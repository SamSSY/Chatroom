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

	/*	// when the client emits 'add user', this listens and executes
	socket.on('add user', function (username) {
		// we store the username in the socket session for this client
		socket.username = username;
		// add the client's username to the global list
		usernames[username] = username;
		++numUsers;
		addedUser = true;
		socket.emit('login', {
		    numUsers: numUsers
		});
		// echo globally (all clients) that a person has connected
		socket.broadcast.emit('user joined', {
		    username: socket.username,
		    numUsers: numUsers
		});
	});

	// when the client emits 'typing', we broadcast it to others
	socket.on('typing', function () {
		socket.broadcast.emit('typing', {
		    username: socket.username
		});
	});

	// when the client emits 'stop typing', we broadcast it to others
	socket.on('stop typing', function () {
		socket.broadcast.emit('stop typing', {
		    username: socket.username
		});
	});


	  // when the user disconnects.. perform this
	socket.on('disconnect', function () {
		// remove the username from global usernames list
		if (addedUser) {
			delete usernames[socket.username];
			--numUsers;

			// echo globally that this client has left
			socket.broadcast.emit('user left', {
				username: socket.username,
				numUsers: numUsers
			});
		}
	});

	*/

});	








