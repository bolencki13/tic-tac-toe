/**
 * Advanced board evaluation utilities for Tic Tac Toe AI
 */
import type { Board } from './gameTypes';

/**
 * Scores for different board positions/states
 */
export const SCORES = {
  WIN: 100,       // Winning position
  BLOCK_WIN: 90,  // Blocking opponent's win
  FORK: 80,       // Creating a fork (two winning paths)
  BLOCK_FORK: 70, // Blocking opponent's fork
  CENTER: 60,     // Taking the center
  CORNER: 50,     // Taking a corner
  SIDE: 40,       // Taking a side
  SETUP: 30,      // Setting up potential win
  NEUTRAL: 0      // Neutral move
};

/**
 * Evaluates if a player has a winning position on the board
 */
export function hasWinningMove(board: Board, player: string): number | null {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6]             // diagonals
  ];

  for (const [a, b, c] of lines) {
    // Check if player can win in this line
    const cells = [board[a], board[b], board[c]];
    const playerCells = cells.filter(cell => cell === player).length;
    const emptyCells = cells.filter(cell => cell === null).length;

    if (playerCells === 2 && emptyCells === 1) {
      // Found a winning move, return the empty cell index
      if (board[a] === null) return a;
      if (board[b] === null) return b;
      if (board[c] === null) return c;
    }
  }

  return null;
}

/**
 * Checks if a player has a fork opportunity (two potential winning paths)
 * Returns the move that creates the fork
 */
export function hasForkMove(board: Board, player: string): number | null {
  // Try each empty space
  for (let i = 0; i < board.length; i++) {
    if (board[i] !== null) continue;

    // Make a hypothetical move
    const testBoard = [...board];
    testBoard[i] = player;

    // Count how many winning opportunities this creates
    let winningPaths = 0;
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6]             // diagonals
    ];

    for (const [a, b, c] of lines) {
      const cells = [testBoard[a], testBoard[b], testBoard[c]];
      const playerCells = cells.filter(cell => cell === player).length;
      const emptyCells = cells.filter(cell => cell === null).length;

      // This line has a winning opportunity
      if (playerCells === 2 && emptyCells === 1) {
        winningPaths++;
      }
    }

    // If this move creates two or more winning paths, it's a fork
    if (winningPaths >= 2) {
      return i;
    }
  }

  return null;
}

/**
 * Advanced evaluation function for board positions in limited game mode
 */
export function evaluateLimitedModePosition(
  board: Board,
  aiPlayer: string,
  humanPlayer: string,
  aiMoves: number[],
  humanMoves: number[],
  maxMovesPerPlayer: number
): number {
  // The oldest move of each player (will be removed next)
  const aiOldestMove = aiMoves.length >= maxMovesPerPlayer ? aiMoves[0] : -1;
  const humanOldestMove = humanMoves.length >= maxMovesPerPlayer ? humanMoves[0] : -1;

  // Calculate control scores
  const controlScore = evaluateControlScore(board, aiPlayer, humanPlayer);

  // Special cases for limited mode
  // Evaluate the impact of losing the oldest move
  let removalImpact = 0;

  if (aiOldestMove !== -1) {
    const simulatedBoard = [...board];
    simulatedBoard[aiOldestMove] = null;
    // How bad would it be if our oldest move is removed?
    removalImpact -= evaluateImpactOfRemoval(board, simulatedBoard, aiPlayer, humanPlayer);
  }

  if (humanOldestMove !== -1) {
    const simulatedBoard = [...board];
    simulatedBoard[humanOldestMove] = null;
    // How good would it be if opponent's oldest move is removed?
    removalImpact += evaluateImpactOfRemoval(board, simulatedBoard, humanPlayer, aiPlayer);
  }

  return controlScore + removalImpact;
}

/**
 * Evaluates how much control of the board each player has
 */
function evaluateControlScore(board: Board, aiPlayer: string, humanPlayer: string): number {
  let score = 0;
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6]             // diagonals
  ];

  for (const [a, b, c] of lines) {
    const cells = [board[a], board[b], board[c]];
    const aiCount = cells.filter(cell => cell === aiPlayer).length;
    const humanCount = cells.filter(cell => cell === humanPlayer).length;
    const emptyCount = cells.filter(cell => cell === null).length;

    // AI has control of this line
    if (aiCount > 0 && humanCount === 0) {
      score += 10 * aiCount;
    }

    // Human has control of this line
    if (humanCount > 0 && aiCount === 0) {
      score -= 10 * humanCount;
    }

    // Special case: two in a row with an empty
    if (aiCount === 2 && emptyCount === 1) {
      score += 30; // Near win
    }

    if (humanCount === 2 && emptyCount === 1) {
      score -= 30; // Near loss
    }
  }

  // Center control is important
  if (board[4] === aiPlayer) {
    score += 15;
  } else if (board[4] === humanPlayer) {
    score -= 15;
  }

  // Corner control
  const corners = [0, 2, 6, 8];
  for (const corner of corners) {
    if (board[corner] === aiPlayer) {
      score += 5;
    } else if (board[corner] === humanPlayer) {
      score -= 5;
    }
  }

  return score;
}

/**
 * Evaluates the impact of removing a piece from the board
 */
function evaluateImpactOfRemoval(
  originalBoard: Board,
  boardAfterRemoval: Board,
  playerLosing: string,
  playerGaining: string
): number {
  const originalControl = evaluateControlScore(originalBoard, playerGaining, playerLosing);
  const newControl = evaluateControlScore(boardAfterRemoval, playerGaining, playerLosing);

  // Return the difference - how much the control has changed
  return newControl - originalControl;
}