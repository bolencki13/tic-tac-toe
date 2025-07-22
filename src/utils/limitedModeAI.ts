/**
 * Specialized AI strategies for the limited mode (3 moves per player)
 */
import type { Board } from './gameTypes';
import { hasWinningMove, hasForkMove, evaluateLimitedModePosition } from './boardEvaluator';

const MAX_MOVES_PER_PLAYER = 3;

/**
 * Finds the best move for the AI in limited mode
 */
export function findBestLimitedMove(
  board: Board,
  aiPlayer: string,
  xMoves: number[],
  oMoves: number[]
): number {
  const humanPlayer = aiPlayer === 'X' ? 'O' : 'X';
  const aiMoves = aiPlayer === 'X' ? xMoves : oMoves;
  const humanMoves = aiPlayer === 'X' ? oMoves : xMoves;

  // 1. Check if AI can win immediately
  const winningMove = hasWinningMove(board, aiPlayer);
  if (winningMove !== null) {
    return winningMove;
  }

  // 2. Check if need to block human from winning
  const blockingMove = hasWinningMove(board, humanPlayer);
  if (blockingMove !== null) {
    return blockingMove;
  }

  // 3. Special limited mode strategy
  return limitedModeStrategy(board, aiPlayer, aiMoves, humanMoves);
}

/**
 * Strategic move selection for limited mode
 */
function limitedModeStrategy(
  board: Board,
  aiPlayer: string,
  aiMoves: number[],
  humanMoves: number[]
): number {
  const humanPlayer = aiPlayer === 'X' ? 'O' : 'X';

  // Get all empty cell indices
  const emptyCells = board
    .map((cell, index) => cell === null ? index : -1)
    .filter(index => index !== -1);

  // If AI already has max moves, we need to consider replacing one
  if (aiMoves.length >= MAX_MOVES_PER_PLAYER) {
    // The move to be replaced is the oldest one (first in the array)
    const moveToReplace = aiMoves[0];

    // Try each empty cell and evaluate
    let bestScore = -Infinity;
    let bestMove = emptyCells[0] || 0; // Default to first empty if somehow none

    for (const emptyCell of emptyCells) {
      // Simulate making this move and removing the oldest
      const simulatedBoard = [...board];
      simulatedBoard[moveToReplace] = null;  // Remove oldest
      simulatedBoard[emptyCell] = aiPlayer;  // Place new

      // Calculate new moves arrays for evaluation
      const newAiMoves = [...aiMoves.slice(1), emptyCell];

      // Evaluate this position with deeper search
      const score = evaluateWithLookahead(
        simulatedBoard,
        aiPlayer,
        humanPlayer,
        newAiMoves,
        humanMoves,
        2 // Lookahead depth
      );

      if (score > bestScore) {
        bestScore = score;
        bestMove = emptyCell;
      }
    }

    return bestMove;
  }
  // If AI has fewer than max moves, we can place anywhere
  else {
    // If center is empty, take it
    if (board[4] === null) {
      return 4;
    }

    // Try to create a fork
    const forkMove = hasForkMove(board, aiPlayer);
    if (forkMove !== null) {
      return forkMove;
    }

    // Block opponent's fork
    const blockForkMove = hasForkMove(board, humanPlayer);
    if (blockForkMove !== null) {
      return blockForkMove;
    }

    // Evaluate each empty cell
    let bestScore = -Infinity;
    let bestMove = emptyCells[0] || 0;

    for (const emptyCell of emptyCells) {
      const simulatedBoard = [...board];
      simulatedBoard[emptyCell] = aiPlayer;

      // Calculate new moves arrays for evaluation
      const newAiMoves = [...aiMoves, emptyCell];

      // Evaluate this position with lookahead
      const score = evaluateWithLookahead(
        simulatedBoard,
        aiPlayer,
        humanPlayer,
        newAiMoves,
        humanMoves,
        2 // Lookahead depth
      );

      if (score > bestScore) {
        bestScore = score;
        bestMove = emptyCell;
      }
    }

    return bestMove;
  }
}

/**
 * Evaluates a position with lookahead for future moves
 */
function evaluateWithLookahead(
  board: Board,
  aiPlayer: string,
  humanPlayer: string,
  aiMoves: number[],
  humanMoves: number[],
  depth: number
): number {
  // Base case: if at depth 0 or game is over, return evaluation
  if (depth === 0 || isGameOver(board)) {
    return evaluateLimitedModePosition(
      board,
      aiPlayer,
      humanPlayer,
      aiMoves,
      humanMoves,
      MAX_MOVES_PER_PLAYER
    );
  }

  // Get all empty cells
  const emptyCells = board
    .map((cell, index) => cell === null ? index : -1)
    .filter(index => index !== -1);

  // If AI's turn (maximizing)
  if (depth % 2 === 0) {
    let maxScore = -Infinity;

    // Try each possible move
    for (const emptyCell of emptyCells) {
      // If AI already has max moves, need to remove oldest
      const newBoard = [...board];
      let newAiMoves = [...aiMoves];

      if (aiMoves.length >= MAX_MOVES_PER_PLAYER) {
        const oldestMove = aiMoves[0];
        newBoard[oldestMove] = null;
        newBoard[emptyCell] = aiPlayer;
        newAiMoves = [...aiMoves.slice(1), emptyCell];
      } else {
        newBoard[emptyCell] = aiPlayer;
        newAiMoves = [...aiMoves, emptyCell];
      }

      // Recursive evaluation
      const score = evaluateWithLookahead(
        newBoard,
        aiPlayer,
        humanPlayer,
        newAiMoves,
        humanMoves,
        depth - 1
      );

      maxScore = Math.max(maxScore, score);
    }

    return maxScore;
  }
  // Human's turn (minimizing)
  else {
    let minScore = Infinity;

    // Try each possible move
    for (const emptyCell of emptyCells) {
      // If human already has max moves, need to remove oldest
      const newBoard = [...board];
      let newHumanMoves = [...humanMoves];

      if (humanMoves.length >= MAX_MOVES_PER_PLAYER) {
        const oldestMove = humanMoves[0];
        newBoard[oldestMove] = null;
        newBoard[emptyCell] = humanPlayer;
        newHumanMoves = [...humanMoves.slice(1), emptyCell];
      } else {
        newBoard[emptyCell] = humanPlayer;
        newHumanMoves = [...humanMoves, emptyCell];
      }

      // Recursive evaluation
      const score = evaluateWithLookahead(
        newBoard,
        aiPlayer,
        humanPlayer,
        aiMoves,
        newHumanMoves,
        depth - 1
      );

      minScore = Math.min(minScore, score);
    }

    return minScore;
  }
}

/**
 * Checks if the game is over (win or full board)
 */
function isGameOver(board: Board): boolean {
  // Check for win
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6]             // diagonals
  ];

  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return true; // Win
    }
  }

  // In limited mode, the board is never technically full since we keep removing pieces
  // But we can consider a certain number of moves as endgame
  return false;
}