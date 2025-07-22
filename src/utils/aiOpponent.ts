/**
 * AI Opponent utilities for Tic Tac Toe
 * Optimized with memoization, advanced strategies, and adaptive learning
 */
import { findBestLimitedMove } from './limitedModeAI';
import { hasWinningMove, hasForkMove } from './boardEvaluator';
import type { Board, MoveResult, GameStyle } from './gameTypes';

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
 * @param gameStyle - The style of game being played (classic or limited)
 * @param xMoves - Array of X's moves (for limited mode)
 * @param oMoves - Array of O's moves (for limited mode)
 */
export function findBestMove(
  board: Board,
  aiPlayer: string,
  gameStyle: GameStyle = 'classic',
  xMoves: number[] = [],
  oMoves: number[] = [],
  difficulty: string = 'medium'
): MoveResult {
  // For limited mode, use specialized algorithm
  if (gameStyle === 'limited') {
    return findBestLimitedMove(board, aiPlayer, xMoves, oMoves);
  }

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

  // Strategy optimizations for first few moves
  // 1. Check for immediate win
  const winningMove = hasWinningMove(board, aiPlayer);
  if (winningMove !== null) {
    return winningMove;
  }

  // 2. Check if need to block opponent from winning
  const blockingMove = hasWinningMove(board, humanPlayer);
  if (blockingMove !== null) {
    return blockingMove;
  }

  // 3. For medium and hard mode, use adaptive learning to predict player moves
  const adaptiveMove = getAdaptiveCounterMove(board, humanPlayer);
  if (adaptiveMove !== null) {
    // Different adaptation rates based on difficulty
    if (difficulty === 'hard' && Math.random() < 0.9) {
      // 90% chance to use adaptive moves in hard mode
      return adaptiveMove;
    } else if (difficulty === 'medium' && Math.random() < 0.5) {
      // 50% chance to use adaptive moves in medium mode
      return adaptiveMove;
    }
  }

  // 4. Check for fork opportunity
  const forkMove = hasForkMove(board, aiPlayer);
  if (forkMove !== null) {
    return forkMove;
  }

  // 5. Check if need to block opponent's fork
  const blockForkMove = hasForkMove(board, humanPlayer);
  if (blockForkMove !== null) {
    return blockForkMove;
  }

  // 6. Take center if empty
  if (board[4] === null) {
    return 4;
  }

  // Fall back to minimax for deeper evaluation
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
 * Minimax algorithm for determining the best move with alpha-beta pruning and deeper search
 */
function minimax(
  board: Board,
  depth: number, // Increased depth for harder AI
  isMaximizing: boolean,
  aiPlayer: string,
  humanPlayer: string,
  alpha: number = -Infinity,
  beta: number = Infinity,
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
 * Returns a random valid move but prefers winning moves (for easy difficulty)
 */
export function findRandomMove(
  board: Board,
  aiPlayer: string = 'O',
  gameStyle: GameStyle = 'classic',
  xMoves: number[] = [],
  oMoves: number[] = []
): MoveResult {
  const humanPlayer = aiPlayer === 'X' ? 'O' : 'X';

  // Even on easy, the AI should take obvious wins
  const winningMove = hasWinningMove(board, aiPlayer);
  if (winningMove !== null && Math.random() > 0.2) { // 80% chance to take the win
    return winningMove;
  }

  // 50% chance to block an obvious loss
  const blockingMove = hasWinningMove(board, humanPlayer);
  if (blockingMove !== null && Math.random() > 0.5) {
    return blockingMove;
  }

  // For limited mode with full moves, prefer replacing the oldest move
  if (gameStyle === 'limited') {
    const aiMoves = aiPlayer === 'X' ? xMoves : oMoves;
    if (aiMoves.length >= 3) {
      const emptyIndices = board
        .map((square, index) => (square === null ? index : null))
        .filter((index): index is number => index !== null);

      if (emptyIndices.length > 0) {
        const randomIndex = Math.floor(Math.random() * emptyIndices.length);
        return emptyIndices[randomIndex];
      }
    }
  }

  // Get all empty squares
  const emptyIndices = board
    .map((square, index) => (square === null ? index : null))
    .filter((index): index is number => index !== null);

  if (emptyIndices.length === 0) {
    return -1;
  }

  // Slightly prefer center and corners
  const preferredMoves = [4, 0, 2, 6, 8].filter(index => board[index] === null);
  if (preferredMoves.length > 0 && Math.random() > 0.5) {
    const randomPreferredIndex = Math.floor(Math.random() * preferredMoves.length);
    return preferredMoves[randomPreferredIndex];
  }

  // Otherwise pick randomly from all empty squares
  const randomIndex = Math.floor(Math.random() * emptyIndices.length);
  return emptyIndices[randomIndex];
}