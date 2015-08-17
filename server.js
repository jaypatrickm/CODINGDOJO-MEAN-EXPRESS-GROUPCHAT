// require express and path
var express = require("express");
var path = require("path");

var session = require('express-session');
// create the express app
var app = express();

// static content
app.use(express.static(path.join(__dirname, "./static")));

app.use(session({
					secret: 'codingdojorocks',
					resave: true,
					saveUninitialized: true  }));

// setting up ejs and our views folder
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

// root route to render the index.ejs view
app.get('/', function(req, res){
	req.session.user = 'Gary';
	console.log(req.session.user);
	res.render("index");
})

// tell the express app to listen on port 8000
var server = app.listen(3333, function() {
	console.log("listening on port 3333");
})

var usernames = {};
var log = [];

// this gets the socket.io module *new code!*
var io = require('socket.io').listen(server); // notice we pass the server object
io.sockets.on('connection', function(socket){
	console.log("WE ARE USING SOCKETS!");
	console.log(socket.id);
	//console.log(socket.broadcast.emit("my_broadcast_event"));
	//console.log(io.emit("my_full_broadcast_event"));
	//all the socket code goes in here!
	socket.on("login_name", function(data) {
		console.log('user submitted a name: ' + data.name + ' ' + socket.id);
		usernames[socket.id] = data.name;
		// socket.emit('server_response', {response: "sockets are the best!"});
		socket.emit('chat_log', {log: log});
		socket.emit('user_id', {user_id: socket.id, name: data.name});
		socket.broadcast.emit("user_entered_chat", {response: data.name + " has entered chat!"});
	});

	socket.on("update_log", function(data) {
		log.push(data.msg);
	});

	socket.on("send_chat_message", function(data) {
		log.push('<li><span class="name">' + data.name + '</span> ' + data.msg + '</li>');
		io.emit("my_full_broadcast_event", {msg : '<li><span class="name">' + data.name + '</span> ' + data.msg + '</li>' })
	});
	// io.emit("my_full_broadcast_event", {response: "new person has logged in"});
})