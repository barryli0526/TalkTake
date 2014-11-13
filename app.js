
/**
 * Module dependencies.
 */

var path = require('path');
var express = require('express');
var config = require('./config/base').config;
var routes = require('./routes');
//var redis = require('redis');
var fs = require('fs');
require('oneapm');
//var ejsfilter = require('./lib/ejs_filter');

/**
 *   Instantiate redis
 */

//
//var client = null;
//
//if(process.env.REDISTOGO_URL){
//    var rtg   = require('url').parse(process.env.REDISTOGO_URL);
//     client = exports.client  = redis.createClient(rtg.port, rtg.hostname);
//    client.auth(rtg.auth.split(':')[1]); // auth 1st part is username and 2nd is password separated by ":"
//}else{
//     client = exports.client  = redis.createClient();
//}
//
////add this for test
//client.flushdb();


var app = express.createServer();

app.configure(function () {

  app.use(express.bodyParser({
    uploadDir: path.join(__dirname,config.upload_dir)
  }));
  app.use(express.cookieParser());
  app.use(express.session({
    secret: config.session_secret
  }));


  app.use('/upload/', express.static(config.upload_dir, { maxAge: config.image_maxAge }));

});


// routes
routes(app);


app.listen(config.port);

console.log("You can debug your app with http://" + config.hostname + ':' + config.port);


module.exports = app;

/*
 * Catch uncaught exceptions
 */

process.on('uncaughtException', function(err){
    console.log(Date.now() + 'Exception: ' + err.stack);
    fs.appendFile(path.resolve('log.txt'),err.stack,function(err){
    })
});
