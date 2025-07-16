import React, { useState } from 'react';
import './PlayerInfo.css';

const PlayerInfo = ({ playerInfo, onNameChange, onRequestOpponent }) => {
  const [nameInput, setNameInput] = useState(playerInfo.name);

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (nameInput.trim()) {
      onNameChange(nameInput.trim());
    }
  };

  return (
    <div className="player-info">
      <h3>玩家信息</h3>
      
      <div className="player-details">
        <div className="player-id">
          ID: {playerInfo.id || '未连接'}
        </div>
        
        <form onSubmit={handleNameSubmit} className="name-form">
          <label htmlFor="playerName">昵称:</label>
          <div className="name-input-group">
            <input
              id="playerName"
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="输入昵称"
            />
            <button type="submit">设置</button>
          </div>
        </form>
      </div>

      <div className="connection-status">
        <div className={`status-indicator ${playerInfo.isConnected ? 'connected' : 'disconnected'}`}>
          {playerInfo.isConnected ? '已连接对手' : '未连接对手'}
        </div>
        
        {playerInfo.enemy && (
          <div className="enemy-info">
            对手: {playerInfo.enemy.name}
          </div>
        )}
      </div>

      <div className="game-controls">
        <button 
          className="request-opponent-btn"
          onClick={onRequestOpponent}
          disabled={!playerInfo.id}
        >
          {playerInfo.isConnected ? '重新匹配' : '请求对战'}
        </button>
        
        {playerInfo.canMove && (
          <div className="turn-indicator active">
            轮到你下子
          </div>
        )}
      </div>

      <div className="game-rules">
        <h4>游戏说明</h4>
        <ul>
          <li>黑棋先手</li>
          <li>轮流落子</li>
          <li>被围住的棋子会被吃掉</li>
          <li>不能自杀</li>
        </ul>
        <a href="http://baike.baidu.com/view/299139.htm" target="_blank" rel="noopener noreferrer">
          围棋规则详解
        </a>
      </div>
    </div>
  );
};

export default PlayerInfo;
