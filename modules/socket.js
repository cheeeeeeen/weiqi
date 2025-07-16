var { Server } = require('socket.io');

exports.createSocket = function(server){
	var io = new Server(server, {
		cors: {
			origin: "*",
			methods: ["GET", "POST"]
		}
	});
	return io;
};

