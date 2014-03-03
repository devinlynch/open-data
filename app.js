
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , db = require('./database')
var app = express();
var database = new db.RawSQLDatabase();

app.configure(function(){
  app.set('port', process.env.PORT || 80);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use("/public", express.static(__dirname + '/public'));
  app.use(express.cookieParser());
  app.use(app.router);
  app.use(require('stylus').middleware(__dirname + '/public'));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', function(req, res, next){
  routes.index(req, res, next);
});

app.get('/licence', function(req, res, next){
  routes.licence(req, res, next);
});

app.get('/test', function(req, res, next){
  database.createSubscribe({
    email_address: "test@test.com",
    dataset_id: 1
  },
  [{
    value: "test"
  }],
  function(res, err) {
    console.log('res: ' +res);
  });
});

app.get('/unsubscribe', function(req, res){
  var email = req.query.email;
  var id = req.query.id;
  if(!email || !id) {
    res.send("A email and ID must be provided in order to unsubscribe");
    return;
  }

  database.unsubscribe(email, id, function(err) {
    if(err) {
      res.send(err);
    } else{
      res.send("You are unsubscribed.")
    }
  });
});

app.get('/o/datasets', function(req, res, next){
  database.getDatasets(function(err, datasets) {
    if(err)
      console.log(err);
    res.send(datasets);
  });
});

app.get('/searchTest', function(req, res, next){
  database.search(2, [{inputId: 27, value: '0'}], function(err, result) {
    if(err)
      console.log(err);
    res.send(result);
  });
});

app.get('/search', function(req, res, next){
  var datasetId = req.body.datasetId;
  var assertions = req.body.assertions;

  database.search(datasetId, assertions, function(err, result) {
    if(err)
      console.log(err);
    res.send(result);
  });
});

app.post('/subscribe', function(req, res, next){
  var subscribe = req.body.subscribe;
  var assertions = req.body.assertions;

  database.createSubscribe(subscribe, assertions, function(err, result) {
    var returnObject = {
      error: err
    }
    res.send(returnObject);
  });
});

try{
	http.createServer(app).listen(app.get('port'), function(){
	  console.log("Express server listening on port " + app.get('port'));
	});
} catch (err){
	console.log(err);
	throw err;
}