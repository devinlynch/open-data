var db = require('../database')
var database = new db.RawSQLDatabase();

exports.index = function(req, res){
	database.getDatasets(function(err, datasets) {
	    if(err)
	      datasets = [];
	    res.render("index.jade", {variable: {datasets: datasets}});	
	  });
};