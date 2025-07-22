/**
 * AI Opponent utilities for Tic Tac Toe
 * Optimized with memoization for better performance
 */

export type Board = Array<string | null>;
export type MoveResult = number;

// Cache for minimax results to avoid recalculating the same positions
const minimaxCache = new Map<string, number>();

/**
 * Create a hash key from board state for caching
 */
function getBoardHash(board: Board, isMaximizing: boolean, depth: number): string {
  return `${board.join('')}|${isMaximizing}|${depth}`;
}

/**
 * Finds the best move for the AI using the minimax algorithm with memoization
 */
export function findBestMove(board: Board, aiPlayer: string): MoveResult {
  // Reset cache for new board evaluation to prevent memory leaks
  if (minimaxCache.size > 1000) {
    minimaxCache.clear();
  }
  
  // Check for empty spaces
  const emptyIndices = board
    .map((square, index) => (square === null ? index : null))
    .filter((index): index is number => index !== null);

  // If no empty spaces, return -1
  if (emptyIndices.length === 0) {
    return -1;
  }

  // If only one empty space, return it
  if (emptyIndices.length === 1) {
    return emptyIndices[0];
  }

  // Human player is the opposite of AI player
  const humanPlayer = aiPlayer === 'X' ? 'O' : 'X';

  // Initialize best move and score
  let bestMove: number = -1;
  let bestScore = -Infinity;

  // Try each empty space
  for (const index of emptyIndices) {
    // Make the move
    board[index] = aiPlayer;

    // Calculate score for this move with memoization
    const score = minimax(board, 0, false, aiPlayer, humanPlayer);

    // Undo the move
    board[index] = null;

    // If better score, update best score and move
    if (score > bestScore) {
      bestScore = score;
      bestMove = index;
    }
  }

  return bestMove;
}

/**
 * Minimax algorithm for determining the best move with alpha-beta pruning
 */
function minimax(
  board: Board,
  depth: number,
  isMaximizing: boolean,
  aiPlayer: string,
  humanPlayer: string,
  alpha: number = -Infinity,
  beta: number = Infinity
): number {
  // Create a cache key for this board state
  const cacheKey = getBoardHash(board, isMaximizing, depth);
  
  // Check if we've already calculated this position
  if (minimaxCache.has(cacheKey)) {
    return minimaxCache.get(cacheKey)!;
  }
  
  // Check if game is over
  const winner = checkWinner(board);
  if (winner !== null) {
    const score = winner === aiPlayer ? 10 - depth : depth - 10;
    minimaxCache.set(cacheKey, score);
    return score;
  }

  // Check if board is full (draw)
  if (!board.includes(null)) {
    minimaxCache.set(cacheKey, 0);
    return 0;
  }

  // Maximizing player (AI)
  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < board.length; i++) {
      if (board[i] === null) {
        board[i] = aiPlayer;
        const score = minimax(board, depth + 1, false, aiPlayer, humanPlayer, alpha, beta);
        board[i] = null;
        bestScore = Math.max(score, bestScore);
        alpha = Math.max(alpha, bestScore);
        if (beta <= alpha) break; // Alpha-beta pruning
      }
    }
    minimaxCache.set(cacheKey, bestScore);
    return bestScore;
  } 
  // Minimizing player (Human)
  else {
    let bestScore = Infinity;
    for (let i = 0; i < board.length; i++) {
      if (board[i] === null) {
        board[i] = humanPlayer;
        const score = minimax(board, depth + 1, true, aiPlayer, humanPlayer, alpha, beta);
        board[i] = null;
        bestScore = Math.min(score, bestScore);
        beta = Math.min(beta, bestScore);
        if (beta <= alpha) break; // Alpha-beta pruning
      }
    }
    minimaxCache.set(cacheKey, bestScore);
    return bestScore;
  }
}

/**
 * Check if there is a winner on the board
 */
function checkWinner(board: Board): string | null {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }

  return null;
}

/**
 * Returns a random valid move (for easy difficulty)
 */
export function findRandomMove(board: Board): MoveResult {
  const emptyIndices = board
    .map((square, index) => (square === null ? index : null))
    .filter((index): index is number => index !== null);

  if (emptyIndices.length === 0) {
    return -1;
  }

  const randomIndex = Math.floor(Math.random() * emptyIndices.length);
  return emptyIndices[randomIndex];
}