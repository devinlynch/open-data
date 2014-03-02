
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
  app.set('port', process.env.PORT || 5800);
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

app.get('/search', function(req, res, next){
  database.search(8, [{inputId: 12, value: 'foo'}], function(err, result) {
    if(err)
      console.log(err);
    res.send(result);
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