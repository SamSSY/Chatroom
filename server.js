var express = require('express');
var http = require('http');
//var bodyParser = require('body-parser');
var fs = require('fs');
var app = express();
var server = http.createServer(app);
var port = 3000;

var io = require('socket.io')
			.listen(app.listen(port, function(){
				console.log('HTTP on http://localhost:3000/');
			}));


app.use('/dist', express.static(__dirname + '/dist'));

//app.use( bodyParser.json() );       // to support JSON-encoded bodies
//app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
//  extended: true
//})); 

// usernames which are currently connected to the chat
var usernames = {};
var numUsers = 0;


// GET method route
app.get('/', function (req, res) {
  console.log("get!");
  fs.readFile('index.html', function(err, buf) {
    res.send(buf.toString());
  });
});


io.sockets.on('connection', function (socket) {
	console.log("socket!");

	socket.on('new message', function (data) {
	    // we tell the client to execute 'new message'
	    socket.broadcast.emit('new message', {
	        message: data.message,
	        username: data.username,
	        userPicUrl: data.userPicUrl 
	    });
    });

});	








