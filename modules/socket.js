var { Server } = require('socket.io');

exports.createSocket = function(server){
	var io = new Server(server, {
		cors: {
			origin: ["http://localhost:3000", "http://localhost:8888"],
			methods: ["GET", "POST"],
			credentials: true
		}
	});
	return io;
};

