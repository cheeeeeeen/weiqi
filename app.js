/**
 * by yutingzhao 2012 8 18
 */

var path = require('path');
var express = require('express');
var http = require('http');
var config = require('./config').config;
var control = require('./modules/control');

var app = express();
var server = http.createServer(app);

// Serve static files
app.use(express.static(__dirname + '/public'));

// Start socket.io control
control.start(server);

// Start server
server.listen(process.argv[2] || config.port);

console.log("围棋 start at port:"+config.port);
