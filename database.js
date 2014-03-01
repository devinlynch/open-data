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
				async.each(datasets, function(dataset) {
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
					datasets=_datasets;
				    _callback(err);
				});
			}
		},
		function(err, results){
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
}

exports.RawSQLDatabase=RawSQLDatabase;