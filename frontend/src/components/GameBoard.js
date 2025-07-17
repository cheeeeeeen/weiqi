import React from 'react';
import './GameBoard.css';

const GameBoard = ({ board, onCellClick, playerColor, currentPlayer }) => {
  const renderIntersection = (i, j) => {
    const cellValue = board[i][j];
    let intersectionClass = 'board-intersection';
    
    // 如果已有棋子，添加occupied类禁用hover效果
    if (cellValue !== 0) {
      intersectionClass += ' occupied';
    }
    
    // 添加星位标记
    if ((i === 3 && j === 3) || (i === 3 && j === 9) || (i === 3 && j === 15) ||
        (i === 9 && j === 3) || (i === 9 && j === 9) || (i === 9 && j === 15) ||
        (i === 15 && j === 3) || (i === 15 && j === 9) || (i === 15 && j === 15)) {
      intersectionClass += ' star-point';
    }

    // 添加边界样式
    if (i === 0) intersectionClass += ' top-edge';
    if (i === 18) intersectionClass += ' bottom-edge';
    if (j === 0) intersectionClass += ' left-edge';
    if (j === 18) intersectionClass += ' right-edge';

    return (
      <div
        key={`${i}-${j}`}
        className={intersectionClass}
        onClick={() => onCellClick(i, j)}
        data-position={`${i},${j}`}
      >
        {/* hover触发区域和指示器 */}
        {cellValue === 0 && (
          <>
            <div className="hover-area"></div>
            <div className={`hover-indicator ${currentPlayer === 1 ? 'black-hover' : 'white-hover'}`}></div>
          </>
        )}
        
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
            {row.map((_, j) => renderIntersection(i, j))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameBoard;
