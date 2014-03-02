var mysql      	= require('mysql');
var config	   	= require("./config.json");
var async 		= require('async');

var check = require('validator').check;

var connection;
function getOrCreateConnection() {
	if(connection === undefined){
		connection = mysql.createConnection({
		  host     : config.host,
		  user     : config.username,
		  password : config.password,
		  database : config.database,
		  nestTables: true,
		  timezone: '-3:00'
		});
	}

	return connection;
}

var RawSQLDatabase = function() {
	var connection = getOrCreateConnection();

	this.getDatasets = function(callback) {
		var datasets = [];
		async.series({
			getDataSets: function(_callback) {
				connection.query('select * from dataset', [], function(err, result) {
					if(err || !result || result.length === 0) {
						if(err)
							console.log(err);
						_callback(err);
					} else{
						datasets = result;
						_callback();
					}
				});
			},
			appendDatasetInputs: function(_callback) {
				var _datasets = [];
				async.each(datasets, function(dataset, _callback) {
					connection.query('select * from dataset_input where dataset_id = ?', [dataset["dataset_id"]], function(err, result) {
						if(err || !result) {
							if(err)
								console.log(err);
							_callback(err);
						} else{
							dataset["dataset_inputs"] = result;

							_datasets[_datasets.length] = dataset;
							_callback();
						}
					});
				}, function(err){
					console.log(JSON.stringify(_datasets));
					datasets=_datasets;
				    _callback(err);
				});
			}
		},
		function(err, results){
			console.log(datasets);
			callback(err, datasets);
		});
	}

	this.unsubscribe = function(email_address, subscribeId, callback) {
		try {
    		check(email_address).isEmail()
    	} catch(err) {
    		callback("A valid email address must be provided");
    		return;
		}

		async.series({
			checkSubscribe: function(_callback) {
				connection.query('select subscribe_id from subscribe where email_address = ? and subscribe_id = ? limit 1', [email_address, subscribeId], function(err, result) {
					if(err || !result || result.length === 0) {
						if(err)
							console.log(err);
						_callback("You are not subscribed to anything");
					} else{
						_callback();
					}
				});
			},
			unsubscribe: function(_callback) {
				var query = connection.query('update subscribe set unsubscribed = 1 where email_address = ? and subscribe_id = ?', [email_address, subscribeId], function(err, result) {
					if(err){
						console.log(err);
						_callback("There was an error while unsubscribing");
						return;
					}
					_callback();
				});
			}
		},
		function(err, results){
			callback(err);
		});
	}

	this.createSubscribe = function (subscribe, assertions, callback) {
		if(!subscribe['email_address'] || !subscribe['subscribe_id'] || assertions.length == 0) {
			callback(undefined, "Some value that was supposed to be set on the subscribe is not set");
		}

		var subscribeId;
		async.series({
    		createSubscribe: function(_callback) {
    			var query = connection.query('INSERT INTO subscribe SET ?', subscribe, function(err, result) {
					if(err || result.insertId === undefined) {
						console.log(err);
						_callback(err);
					} else{
						subscribeId = result.insertId;
						_callback();
					}
				});
    		}, createSubscribeAsserion: function(_callback) {
    			console.log("creating assertions");
    			async.mapSeries(assertions
    				, function(assertion, _callback) {
    					assertion["subscribe_id"] = subscribeId;

    					if(assertion['value'] === undefined) {
    						_callback("Value must be set on assertion");
    						return;
    					}

    					if(assertion['dataset_input_id'] === undefined) {
    						console.log('dataset_input_id not defined');
    						_callback("Error");
    						return;
    					}

    					persistSubscribeAssertion(assertion, _callback);
    				}, function(err) {
						if(err) {
							callback(err);
						} else {
							_callback();
						}
				});
    		}
    	},
    	function(err, results) {
    		if(err) {
				callback(undefined, err);
			} else {
				callback(subscribeId);
			}
    	});
	}

	function persistSubscribeAssertion(assertion, callback) {
		var query = connection.query('INSERT INTO subscribe_assertion SET ?', assertion, function(err, result) {
			if(err) {
				console.log(err);
				callback(err);
			} else{
				callback();
			}
		});
	}

	this.search = function(datasetId, assertions, callback) {
		var query = "(select dv.* from" + 
				"	(SELECT dr.dataset_record_id as drid, count(*) as c FROM " + 
				"				dataset_record dr " + 
				"				left join dataset_value dv on dv.dataset_record_id=dr.dataset_record_id " + 
				"				where dr.dataset_id = ?" + 
				"				and " + 
				"					("+generateAssertionAndClauses(assertions)+
				"					) group by dr.dataset_record_id limit 50) drinner" + 
				"				left join dataset_value dv on dv.dataset_record_id=drinner.drid "+
				"	where c >= ?)";
		console.log(query);
		connection.query(query, [datasetId, assertions.length], function(err, results) {
			if(err) {
				console.log(err);
				callback(err);
				return;
			}

			var dataRecordMap = {};
			for(var i in results) {
				var res = results[i];
				var resId = res['dataset_record_id'];
				if(dataRecordMap[resId] === undefined) {
					dataRecordMap[resId] = [];
				}

				dataRecordMap[resId][dataRecordMap[resId].length] = res;
			}

			console.log(dataRecordMap);
			callback(err, dataRecordMap);
		});

	}

	function generateAssertionAndClauses(assertions) {
		var i=1;
		var s = "";
		for(var a in assertions) {
			var ass = assertions[a];
			s = s + "(dv.value = "+connection.escape(ass['value'])+" and dv.dataset_input_id = "+connection.escape(ass['inputId'])+") ";
			if(i !== assertions.length) {
				s = s + " OR ";
			}
			i++;
		}

		return s;
	}
}

exports.RawSQLDatabase=RawSQLDatabase;