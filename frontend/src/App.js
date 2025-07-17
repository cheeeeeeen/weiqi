import React, { useState, useEffect } from 'react';
import GameBoard from './components/GameBoard';
import PlayerInfo from './components/PlayerInfo';
import GameControls from './components/GameControls';
import ChatPanel from './components/ChatPanel';
import { useSocket } from './hooks/useSocket';
import './App.css';

function App() {
  const [gameState, setGameState] = useState({
    board: Array(19).fill().map(() => Array(19).fill(0)),
    currentPlayer: 1, // 1: 黑棋, 2: 白棋
    isGameActive: false,
    playerColor: null, // 'black' 或 'white'
    step: 0
  });

  const [playerInfo, setPlayerInfo] = useState({
    id: null,
    name: '路人甲',
    isConnected: false,
    canMove: false,
    enemy: null
  });

  const [messages, setMessages] = useState([]);

  const socket = useSocket('http://localhost:8888');

  useEffect(() => {
    if (!socket) return;

    // 监听服务器事件
    socket.on('create', (data) => {
      setPlayerInfo(prev => ({
        ...prev,
        id: data.id,
        name: `路人${data.id}`
      }));
      addMessage('连接到服务器成功');
    });

    socket.on('connectPlayer', (data) => {
      const myPlayerColor = data.color === 'black' ? 'white' : 'black';
      
      setPlayerInfo(prev => ({
        ...prev,
        isConnected: true,
        enemy: data,
        canMove: data.color !== 'black' // 如果对手是黑棋，那么自己是白棋，不能先手；如果对手是白棋，那么自己是黑棋，可以先手
      }));
      
      setGameState(prev => ({
        ...prev,
        isGameActive: true,
        playerColor: myPlayerColor
      }));
      
      addMessage(`已连接到对手: ${data.name}`);
      if (data.color !== 'black') {
        addMessage('你是黑棋，轮到你先下子');
      } else {
        addMessage('对方是黑棋，轮到对方先下子');
      }
    });

    socket.on('action', (data) => {
      // 对手落子
      handleOpponentMove(data);
    });

    socket.on('actionConfirm', (data) => {
      // 自己落子确认
      handleOwnMoveConfirm(data);
    });

    socket.on('notice', (data) => {
      addMessage(`服务器信息: ${data.info}`);
    });

    socket.on('chat', (data) => {
      addMessage(`${data.name}: ${data.info}`, 'chat');
    });

    return () => {
      socket.off('create');
      socket.off('connectPlayer');
      socket.off('action');
      socket.off('actionConfirm');
      socket.off('notice');
      socket.off('chat');
    };
  }, [socket]);

  const addMessage = (text, type = 'system') => {
    setMessages(prev => [...prev, {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // 确保唯一性
      text,
      type,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const handleOpponentMove = (data) => {
    setGameState(prev => {
      const newBoard = prev.board.map(row => [...row]);
      
      // 放置对手的棋子
      const opponentColor = prev.playerColor === 'black' ? 2 : 1;
      newBoard[data.i][data.j] = opponentColor;
      
      // 处理被吃掉的棋子
      if (data.captured && data.captured.length > 0) {
        data.captured.forEach(([ci, cj]) => {
          newBoard[ci][cj] = 0;
        });
        addMessage(`对方吃掉了 ${data.captured.length} 个棋子`);
      }
      
      return {
        ...prev,
        board: newBoard,
        step: data.step,
        currentPlayer: prev.playerColor === 'black' ? 1 : 2
      };
    });

    setPlayerInfo(prev => ({
      ...prev,
      canMove: true
    }));
  };

  const handleOwnMoveConfirm = (data) => {
    setGameState(prev => {
      const newBoard = prev.board.map(row => [...row]);
      
      // 放置自己的棋子 - 使用gameState中的playerColor
      const currentPlayerColor = prev.playerColor;
      const ownColor = currentPlayerColor === 'black' ? 1 : 2;
      newBoard[data.i][data.j] = ownColor;
      
      // 处理被吃掉的棋子
      if (data.captured && data.captured.length > 0) {
        data.captured.forEach(([ci, cj]) => {
          newBoard[ci][cj] = 0;
        });
        addMessage(`你吃掉了 ${data.captured.length} 个棋子`);
      }
      
      return {
        ...prev,
        board: newBoard,
        step: data.step,
        currentPlayer: currentPlayerColor === 'black' ? 2 : 1
      };
    });

    setPlayerInfo(prev => ({
      ...prev,
      canMove: false
    }));
  };

  const handleCellClick = (i, j) => {
    if (!playerInfo.canMove || !gameState.isGameActive || gameState.board[i][j] !== 0) {
      if (!playerInfo.canMove) {
        addMessage('还未到你下子或者还没有连接到对手，请等待');
      }
      return;
    }

    // 发送落子请求到服务器
    socket.emit('action', { i, j });
  };

  const requestOpponent = () => {
    if (!socket || !playerInfo.id) {
      addMessage('还未成功连接上服务器，请稍后再试！');
      return;
    }
    
    // 重置棋盘
    setGameState(prev => ({
      ...prev,
      board: Array(19).fill().map(() => Array(19).fill(0)),
      currentPlayer: 1,
      step: 0
    }));
    
    addMessage('请求已经发出，请等待!');
    socket.emit('request', { name: playerInfo.name });
  };

  const sendChatMessage = (message) => {
    if (!socket || !message.trim()) return;
    socket.emit('chat', { info: message });
  };

  const updatePlayerName = (name) => {
    setPlayerInfo(prev => ({ ...prev, name }));
    if (socket) {
      socket.emit('rename', { name });
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>AI围棋 - 在线对战平台</h1>
      </header>
      
      <div className="app-content">
        <div className="left-panel">
          <PlayerInfo 
            playerInfo={playerInfo}
            onNameChange={updatePlayerName}
            onRequestOpponent={requestOpponent}
          />
          <ChatPanel 
            messages={messages}
            onSendMessage={sendChatMessage}
          />
        </div>
        
        <div className="game-area">
          <GameBoard 
            board={gameState.board}
            onCellClick={handleCellClick}
            playerColor={gameState.playerColor}
            currentPlayer={gameState.currentPlayer}
          />
        </div>
        
        <div className="right-panel">
          <GameControls 
            gameState={gameState}
            playerInfo={playerInfo}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
