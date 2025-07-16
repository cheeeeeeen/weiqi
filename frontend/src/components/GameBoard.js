import React from 'react';
import './GameBoard.css';

const GameBoard = ({ board, onCellClick, playerColor, currentPlayer }) => {
  const renderCell = (i, j) => {
    const cellValue = board[i][j];
    let cellClass = 'board-cell';
    
    if (cellValue === 1) {
      cellClass += ' black-stone';
    } else if (cellValue === 2) {
      cellClass += ' white-stone';
    }

    // 添加特殊位置标记
    if ((i === 3 && j === 3) || (i === 3 && j === 9) || (i === 3 && j === 15) ||
        (i === 9 && j === 3) || (i === 9 && j === 9) || (i === 9 && j === 15) ||
        (i === 15 && j === 3) || (i === 15 && j === 9) || (i === 15 && j === 15)) {
      cellClass += ' star-point';
    }

    return (
      <div
        key={`${i}-${j}`}
        className={cellClass}
        onClick={() => onCellClick(i, j)}
        data-position={`${i},${j}`}
      >
        {cellValue !== 0 && (
          <div className={`stone ${cellValue === 1 ? 'black' : 'white'}`} />
        )}
      </div>
    );
  };

  return (
    <div className="game-board-container">
      <div className="board-info">
        <div className={`turn-indicator ${currentPlayer === 1 ? 'black-turn' : 'white-turn'}`}>
          当前回合: {currentPlayer === 1 ? '黑棋' : '白棋'}
        </div>
        {playerColor && (
          <div className={`player-color ${playerColor}`}>
            你的颜色: {playerColor === 'black' ? '黑棋' : '白棋'}
          </div>
        )}
      </div>
      
      <div className="game-board">
        {board.map((row, i) => (
          <div key={i} className="board-row">
            {row.map((_, j) => renderCell(i, j))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameBoard;
