/**
 * AI Opponent utilities for Tic Tac Toe
 */

export type Board = Array<string | null>;
export type MoveResult = number;

/**
 * Finds the best move for the AI using the minimax algorithm
 */
export function findBestMove(board: Board, aiPlayer: string): MoveResult {
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

    // Calculate score for this move
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
 * Minimax algorithm for determining the best move
 */
function minimax(
  board: Board,
  depth: number,
  isMaximizing: boolean,
  aiPlayer: string,
  humanPlayer: string
): number {
  // Check if game is over
  const winner = checkWinner(board);
  if (winner !== null) {
    if (winner === aiPlayer) return 10 - depth;
    if (winner === humanPlayer) return depth - 10;
    return 0; // Draw
  }

  // Check if board is full (draw)
  if (!board.includes(null)) {
    return 0;
  }

  // Maximizing player (AI)
  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < board.length; i++) {
      if (board[i] === null) {
        board[i] = aiPlayer;
        const score = minimax(board, depth + 1, false, aiPlayer, humanPlayer);
        board[i] = null;
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } 
  // Minimizing player (Human)
  else {
    let bestScore = Infinity;
    for (let i = 0; i < board.length; i++) {
      if (board[i] === null) {
        board[i] = humanPlayer;
        const score = minimax(board, depth + 1, true, aiPlayer, humanPlayer);
        board[i] = null;
        bestScore = Math.min(score, bestScore);
      }
    }
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