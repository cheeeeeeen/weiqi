var socket = require("./socket");
var WeiqiEngine = require("./weiqi-engine");

var io = null;
var players = {};
var waitingPlayer = null;
var games = {}; // 存储游戏状态
function connectingDouble(black, white){
	const gameId = `${black.id}_${white.id}`;
	const engine = new WeiqiEngine();
	
	// 初始化游戏状态
	games[gameId] = {
		board: engine.createBoard(),
		engine: engine,
		blackPlayer: black,
		whitePlayer: white,
		currentColor: engine.BLACK, // 黑子先手
		step: 0
	};
	
	// 将游戏ID添加到玩家信息中
	black.gameId = gameId;
	white.gameId = gameId;
	
	white.socket.emit("connectPlayer", {
		id: black.id,
		name: black.name,
		color: "black"
	});
	black.socket.emit("connectPlayer", {
		id: white.id,
		name: white.name,
		color: "white"
	});
	black.enemy = white;
	white.enemy = black;
	black.action = true;
	white.action = false;
	white.step = black.step = 0;
}
function sendMessage(player, type, data){
	var socket = player.socket;
	socket.emit(type, data);
}
function doAction(player, data){
	if(player.action == false){
		sendMessage(player, "notice", {
			errno: 0,
			info: "还未轮到您下子"
		});
		return;
	}
	
	// 获取游戏状态
	const game = games[player.gameId];
	if (!game) {
		sendMessage(player, "notice", {
			errno: 3,
			info: "游戏状态异常"
		});
		return;
	}
	
	// 确定当前玩家颜色
	const playerColor = (player.id === game.blackPlayer.id) ? game.engine.BLACK : game.engine.WHITE;
	
	// 检查是否轮到该玩家
	if (game.currentColor !== playerColor) {
		sendMessage(player, "notice", {
			errno: 0,
			info: "还未轮到您下子"
		});
		return;
	}
	
	// 验证落子合法性
	const moveResult = game.engine.makeMove(game.board, data.i, data.j, playerColor);
	
	if (!moveResult.valid) {
		sendMessage(player, "notice", {
			errno: 4,
			info: "无效落子: " + moveResult.reason
		});
		return;
	}
	
	// 落子成功，更新游戏状态
	game.step++;
	game.currentColor = (playerColor === game.engine.BLACK) ? game.engine.WHITE : game.engine.BLACK;
	
	var enemy = player.enemy;
	enemy.action = true;
	player.action = false;
	player.step++;
	enemy.step = player.step;
	
	// 发送落子结果给双方
	const actionData = {
		id: player.id,
		step: player.step,
		i: data.i,
		j: data.j,
		captured: moveResult.captured || [] // 被吃掉的棋子
	};
	
	sendMessage(enemy, "action", actionData);
	sendMessage(player, "actionConfirm", actionData); // 确认自己的落子
}
function addListener(){
	io.sockets.on('connection', function (socket) {
		socket.emit("create", {
			id: socket.id
		});
		players[socket.id] = {
			socket: socket,
			id: socket.id
		};
		socket.on('request', function(data){
			if(players[socket.id].running){
				sendMessage(players[socket.id], "notice", {
					errno: 1,
					info: "请求已经发出过，请不要重复请求！"
				});
				return;
			}
			players[socket.id].name = data.name || socket.id;
			players[socket.id].running = true;
			if(waitingPlayer){
				connectingDouble(players[waitingPlayer], players[socket.id]);
				waitingPlayer = null;
			}else{
				waitingPlayer = socket.id;
			}
		});
		socket.on('action', function(data){
			doAction(players[socket.id], data);
		});
		socket.on('restart', function(data){
		});
		socket.on('rename', function(data){
			if(players[socket.id]){
				players[socket.id].name = data.name;
			}
		});
		socket.on('chat', function(data){
			broad('chat', {
				name: players[socket.id].name,
				info: data.info
			});
		});
		socket.on('disconnect', function (){
			if(socket.id == waitingPlayer){
				waitingPlayer = null;
			}
			var player = players[socket.id];
			if (player && player.gameId) {
				// 清理游戏状态
				delete games[player.gameId];
			}
			var enemy = player ? player.enemy : null;
			if(enemy){
				enemy.running = false;
				sendMessage(enemy, 'notice', {
					errno: 2,
					info: "对方已经下线 请重新连接"
				});
			}
			players[socket.id] = null;
		});
	});

}

function broad(type, data){
	io.sockets.emit(type, data)
}

exports.start = function(server){
	io = socket.createSocket(server);
	addListener();
}
