/**
 * 围棋规则引擎 - 后端校验
 */

class WeiqiEngine {
    constructor() {
        this.BOARD_SIZE = 19;
        this.EMPTY = 0;
        this.BLACK = 1;
        this.WHITE = 2;
    }

    /**
     * 创建新的棋盘状态
     */
    createBoard() {
        const board = [];
        for (let i = 0; i < this.BOARD_SIZE; i++) {
            board[i] = [];
            for (let j = 0; j < this.BOARD_SIZE; j++) {
                board[i][j] = this.EMPTY;
            }
        }
        return board;
    }

    /**
     * 检查坐标是否在棋盘范围内
     */
    isValidPosition(i, j) {
        return i >= 0 && i < this.BOARD_SIZE && j >= 0 && j < this.BOARD_SIZE;
    }

    /**
     * 获取相邻位置
     */
    getAdjacentPositions(i, j) {
        const adjacent = [];
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        
        for (const [di, dj] of directions) {
            const ni = i + di;
            const nj = j + dj;
            if (this.isValidPosition(ni, nj)) {
                adjacent.push([ni, nj]);
            }
        }
        return adjacent;
    }

    /**
     * 计算棋子的气（自由度）
     */
    getLiberties(board, i, j, visited = new Set()) {
        const key = `${i},${j}`;
        if (visited.has(key)) return new Set();
        
        visited.add(key);
        const color = board[i][j];
        if (color === this.EMPTY) return new Set();
        
        const liberties = new Set();
        const adjacent = this.getAdjacentPositions(i, j);
        
        for (const [ni, nj] of adjacent) {
            if (board[ni][nj] === this.EMPTY) {
                liberties.add(`${ni},${nj}`);
            } else if (board[ni][nj] === color) {
                // 同色棋子，递归计算气
                const groupLiberties = this.getLiberties(board, ni, nj, visited);
                groupLiberties.forEach(lib => liberties.add(lib));
            }
        }
        
        return liberties;
    }

    /**
     * 获取连通的同色棋子组
     */
    getGroup(board, i, j, visited = new Set()) {
        const key = `${i},${j}`;
        if (visited.has(key)) return [];
        
        visited.add(key);
        const color = board[i][j];
        if (color === this.EMPTY) return [];
        
        const group = [[i, j]];
        const adjacent = this.getAdjacentPositions(i, j);
        
        for (const [ni, nj] of adjacent) {
            if (board[ni][nj] === color) {
                const subGroup = this.getGroup(board, ni, nj, visited);
                group.push(...subGroup);
            }
        }
        
        return group;
    }

    /**
     * 移除死子
     */
    removeCapturedStones(board, color) {
        const captured = [];
        const enemyColor = color === this.BLACK ? this.WHITE : this.BLACK;
        
        for (let i = 0; i < this.BOARD_SIZE; i++) {
            for (let j = 0; j < this.BOARD_SIZE; j++) {
                if (board[i][j] === enemyColor) {
                    const liberties = this.getLiberties(board, i, j);
                    if (liberties.size === 0) {
                        // 这个棋子组没有气，需要被移除
                        const group = this.getGroup(board, i, j);
                        for (const [gi, gj] of group) {
                            if (board[gi][gj] === enemyColor) {
                                board[gi][gj] = this.EMPTY;
                                captured.push([gi, gj]);
                            }
                        }
                    }
                }
            }
        }
        
        return captured;
    }

    /**
     * 检查落子是否合法
     */
    isValidMove(board, i, j, color) {
        // 1. 检查坐标是否合法
        if (!this.isValidPosition(i, j)) {
            return { valid: false, reason: '坐标超出棋盘范围' };
        }

        // 2. 检查位置是否为空
        if (board[i][j] !== this.EMPTY) {
            return { valid: false, reason: '此位置已有棋子' };
        }

        // 3. 模拟落子，检查是否为自杀
        const testBoard = board.map(row => [...row]);
        testBoard[i][j] = color;

        // 4. 移除被吃掉的对方棋子
        const captured = this.removeCapturedStones(testBoard, color);

        // 5. 检查自己的棋子是否还有气
        const selfLiberties = this.getLiberties(testBoard, i, j);
        
        if (selfLiberties.size === 0 && captured.length === 0) {
            return { valid: false, reason: '不能自杀' };
        }

        return { 
            valid: true, 
            captured: captured,
            newBoard: testBoard
        };
    }

    /**
     * 执行落子
     */
    makeMove(board, i, j, color) {
        const validation = this.isValidMove(board, i, j, color);
        if (!validation.valid) {
            return validation;
        }

        // 应用落子结果
        for (let x = 0; x < this.BOARD_SIZE; x++) {
            for (let y = 0; y < this.BOARD_SIZE; y++) {
                board[x][y] = validation.newBoard[x][y];
            }
        }

        return {
            valid: true,
            captured: validation.captured,
            board: board
        };
    }
}

module.exports = WeiqiEngine;
