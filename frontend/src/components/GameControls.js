import React from 'react';
import './GameControls.css';

const GameControls = ({ gameState, playerInfo }) => {
  const getGameStatus = () => {
    if (!gameState.isGameActive) {
      return '等待开始游戏';
    }
    if (playerInfo.canMove) {
      return '轮到你下子';
    }
    return '等待对手下子';
  };

  const getStepCount = () => {
    const totalStones = gameState.board.flat().filter(cell => cell !== 0).length;
    return totalStones;
  };

  return (
    <div className="game-controls">
      <h3>游戏状态</h3>
      
      <div className="status-panel">
        <div className="status-item">
          <label>当前状态:</label>
          <span className={`status-value ${playerInfo.canMove ? 'active' : ''}`}>
            {getGameStatus()}
          </span>
        </div>
        
        <div className="status-item">
          <label>步数:</label>
          <span className="status-value">{gameState.step}</span>
        </div>
        
        <div className="status-item">
          <label>棋子总数:</label>
          <span className="status-value">{getStepCount()}</span>
        </div>
        
        {playerInfo.playerColor && (
          <div className="status-item">
            <label>你的颜色:</label>
            <span className={`status-value ${playerInfo.playerColor}`}>
              {playerInfo.playerColor === 'black' ? '黑棋 ●' : '白棋 ○'}
            </span>
          </div>
        )}
      </div>

      <div className="game-info">
        <h4>当前对局</h4>
        {gameState.isGameActive ? (
          <div className="game-active">
            <div className="players">
              <div className={`player ${playerInfo.playerColor === 'black' ? 'current-player' : ''}`}>
                <span className="stone black">●</span>
                <span>{playerInfo.playerColor === 'black' ? playerInfo.name : playerInfo.enemy?.name}</span>
              </div>
              <div className={`player ${playerInfo.playerColor === 'white' ? 'current-player' : ''}`}>
                <span className="stone white">○</span>
                <span>{playerInfo.playerColor === 'white' ? playerInfo.name : playerInfo.enemy?.name}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="no-game">
            <p>点击"请求对战"开始游戏</p>
          </div>
        )}
      </div>

      <div className="game-tips">
        <h4>游戏提示</h4>
        <ul>
          <li>点击棋盘空白处落子</li>
          <li>黑棋先手，轮流下子</li>
          <li>被包围的棋子将被吃掉</li>
          <li>服务器会验证每步棋的合法性</li>
        </ul>
      </div>
    </div>
  );
};

export default GameControls;
