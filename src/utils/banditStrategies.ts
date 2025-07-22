/**
 * Multi-Armed Bandit Strategy Selector for Tic Tac Toe AI
 * 
 * This module implements a Thompson sampling approach to select between
 * different AI strategies based on their past performance against the player.
 * It dynamically adapts to find the most effective approach for each opponent.
 */
import type { Board, MoveResult, GameStyle } from './gameTypes';
import { findBestMove } from './aiOpponent';
import { findBestMoveMCTS } from './monteCarlo';
import { getBayesianCounterMove } from './bayesianModel';
import { hasWinningMove, hasForkMove } from './boardEvaluator';

// Define strategy types
export type StrategyName = 
  | 'minimax'      // Traditional minimax algorithm
  | 'mcts'         // Monte Carlo Tree Search
  | 'bayesian'     // Bayesian opponent modeling
  | 'aggressive'   // Focus on creating winning opportunities
  | 'defensive'    // Focus on blocking opponent moves
  | 'corners'      // Prioritize taking corners
  | 'center'       // Prioritize taking center then corners
  | 'random';      // Random valid moves (for exploration)

// Interface for strategy statistics
interface StrategyStats {
  name: StrategyName;
  wins: number;        // Number of wins
  losses: number;      // Number of losses
  draws: number;       // Number of draws
  total: number;       // Total uses
  alpha: number;       // Beta distribution parameter for Thompson sampling
  beta: number;        // Beta distribution parameter for Thompson sampling
}

// Initialize strategy statistics
const strategies: Map<StrategyName, StrategyStats> = new Map([
  ['minimax', { name: 'minimax', wins: 1, losses: 1, draws: 1, total: 3, alpha: 1, beta: 1 }],
  ['mcts', { name: 'mcts', wins: 1, losses: 1, draws: 1, total: 3, alpha: 1, beta: 1 }],
  ['bayesian', { name: 'bayesian', wins: 1, losses: 1, draws: 1, total: 3, alpha: 1, beta: 1 }],
  ['aggressive', { name: 'aggressive', wins: 1, losses: 1, draws: 1, total: 3, alpha: 1, beta: 1 }],
  ['defensive', { name: 'defensive', wins: 1, losses: 1, draws: 1, total: 3, alpha: 1, beta: 1 }],
  ['corners', { name: 'corners', wins: 1, losses: 1, draws: 1, total: 3, alpha: 1, beta: 1 }],
  ['center', { name: 'center', wins: 1, losses: 1, draws: 1, total: 3, alpha: 1, beta: 1 }],
  ['random', { name: 'random', wins: 1, losses: 1, draws: 1, total: 3, alpha: 1, beta: 1 }]
]);

// Track the current active strategy
let currentStrategy: StrategyName | null = null;

/**
 * Sample from a beta distribution
 * Used for Thompson sampling
 */
function sampleBeta(alpha: number, beta: number): number {
  // This is an approximation of beta distribution sampling
  // For more accurate sampling, a proper stats library would be better
  const u = Math.random();
  const v = Math.random();
  const x = Math.pow(u, 1/alpha);
  const y = Math.pow(v, 1/beta);
  return x / (x + y);
}

/**
 * Select a strategy using Thompson sampling
 */
export function selectStrategy(): StrategyName {
  // Sample from each strategy's beta distribution
  let bestStrategy: StrategyName = 'minimax';
  let highestSample = -Infinity;
  
  strategies.forEach((stats, name) => {
    const sample = sampleBeta(stats.alpha, stats.beta);
    if (sample > highestSample) {
      highestSample = sample;
      bestStrategy = name;
    }
  });
  
  currentStrategy = bestStrategy;
  return bestStrategy;
}

/**
 * Update strategy performance based on game outcome
 */
export function updateStrategyPerformance(
  strategy: StrategyName,
  result: 'win' | 'loss' | 'draw'
): void {
  const stats = strategies.get(strategy);
  if (!stats) return;
  
  // Update raw counts
  if (result === 'win') {
    stats.wins += 1;
    stats.alpha += 1;
  } else if (result === 'loss') {
    stats.losses += 1;
    stats.beta += 1;
  } else {
    stats.draws += 1;
    stats.alpha += 0.5;
    stats.beta += 0.5;
  }
  
  stats.total += 1;
  
  // Update the strategies map
  strategies.set(strategy, stats);
}

/**
 * Record the game outcome for the current strategy
 */
export function recordGameOutcome(winner: string | null, aiPlayer: string): void {
  if (!currentStrategy) return;
  
  let result: 'win' | 'loss' | 'draw';
  
  if (winner === null) {
    result = 'draw';
  } else if (winner === aiPlayer) {
    result = 'win';
  } else {
    result = 'loss';
  }
  
  updateStrategyPerformance(currentStrategy, result);
}

/**
 * Get available moves on the board
 */
function getAvailableMoves(board: Board): number[] {
  return board
    .map((cell, index) => cell === null ? index : -1)
    .filter(index => index !== -1);
}

/**
 * Implements the aggressive strategy
 * Focuses on creating winning opportunities
 */
function aggressiveStrategy(
  board: Board, 
  aiPlayer: string
): MoveResult {
  const opponent = aiPlayer === 'X' ? 'O' : 'X';
  
  // First check for a winning move
  const winningMove = hasWinningMove(board, aiPlayer);
  if (winningMove !== null) {
    return winningMove;
  }
  
  // Then check for opponent's winning move to block
  const blockingMove = hasWinningMove(board, opponent);
  if (blockingMove !== null) {
    return blockingMove;
  }
  
  // Look for fork opportunities
  const forkMove = hasForkMove(board, aiPlayer);
  if (forkMove !== null) {
    return forkMove;
  }
  
  // If center is available, take it
  if (board[4] === null) {
    return 4;
  }
  
  // Prefer corners that create more opportunities
  const corners = [0, 2, 6, 8].filter(i => board[i] === null);
  if (corners.length > 0) {
    // Check which corner creates the most potential winning lines
    let bestCorner = corners[0];
    let bestScore = -Infinity;
    
    for (const corner of corners) {
      // Try this corner
      board[corner] = aiPlayer;
      
      // Count potential winning lines
      let score = 0;
      const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6]             // Diagonals
      ];
      
      for (const [a, b, c] of lines) {
        if ((board[a] === aiPlayer || board[a] === null) &&
            (board[b] === aiPlayer || board[b] === null) &&
            (board[c] === aiPlayer || board[c] === null)) {
          score += 1;
          
          // If there are already two of our pieces, higher score
          if ((board[a] === aiPlayer && board[b] === aiPlayer) ||
              (board[b] === aiPlayer && board[c] === aiPlayer) ||
              (board[a] === aiPlayer && board[c] === aiPlayer)) {
            score += 3;
          }
        }
      }
      
      // Undo move
      board[corner] = null;
      
      if (score > bestScore) {
        bestScore = score;
        bestCorner = corner;
      }
    }
    
    return bestCorner;
  }
  
  // Take any available side
  const sides = [1, 3, 5, 7].filter(i => board[i] === null);
  if (sides.length > 0) {
    return sides[Math.floor(Math.random() * sides.length)];
  }
  
  // Take any available move
  const availableMoves = getAvailableMoves(board);
  return availableMoves[Math.floor(Math.random() * availableMoves.length)];
}

/**
 * Implements the defensive strategy
 * Focuses on blocking opponent moves and safe play
 */
function defensiveStrategy(
  board: Board,
  aiPlayer: string
): MoveResult {
  const opponent = aiPlayer === 'X' ? 'O' : 'X';
  
  // First check for a winning move
  const winningMove = hasWinningMove(board, aiPlayer);
  if (winningMove !== null) {
    return winningMove;
  }
  
  // Then check for opponent's winning move to block
  const blockingMove = hasWinningMove(board, opponent);
  if (blockingMove !== null) {
    return blockingMove;
  }
  
  // Block potential fork opportunities for opponent
  const opponentForkMove = hasForkMove(board, opponent);
  if (opponentForkMove !== null) {
    return opponentForkMove;
  }
  
  // If center is available, take it
  if (board[4] === null) {
    return 4;
  }
  
  // Check which move minimizes opponent's potential winning lines
  const availableMoves = getAvailableMoves(board);
  let bestMove = availableMoves[0];
  let lowestOpponentScore = Infinity;
  
  for (const move of availableMoves) {
    // Try this move
    board[move] = aiPlayer;
    
    // Count opponent's potential winning lines
    let opponentScore = 0;
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
      [0, 4, 8], [2, 4, 6]             // Diagonals
    ];
    
    for (const [a, b, c] of lines) {
      if ((board[a] === opponent || board[a] === null) &&
          (board[b] === opponent || board[b] === null) &&
          (board[c] === opponent || board[c] === null) &&
          !(board[a] === aiPlayer || board[b] === aiPlayer || board[c] === aiPlayer)) {
        opponentScore += 1;
        
        // If there are already two of opponent's pieces, much higher score (threat)
        if ((board[a] === opponent && board[b] === opponent) ||
            (board[b] === opponent && board[c] === opponent) ||
            (board[a] === opponent && board[c] === opponent)) {
          opponentScore += 5;
        }
      }
    }
    
    // Undo move
    board[move] = null;
    
    if (opponentScore < lowestOpponentScore) {
      lowestOpponentScore = opponentScore;
      bestMove = move;
    }
  }
  
  return bestMove;
}

/**
 * Implements the corners strategy
 * Prioritizes taking corners in a specific pattern
 */
function cornersStrategy(
  board: Board,
  aiPlayer: string
): MoveResult {
  const opponent = aiPlayer === 'X' ? 'O' : 'X';
  
  // First check for a winning move
  const winningMove = hasWinningMove(board, aiPlayer);
  if (winningMove !== null) {
    return winningMove;
  }
  
  // Then check for opponent's winning move to block
  const blockingMove = hasWinningMove(board, opponent);
  if (blockingMove !== null) {
    return blockingMove;
  }
  
  // Preferred corner order: Top-Left, Bottom-Right, Top-Right, Bottom-Left
  const cornerPreference = [0, 8, 2, 6];
  for (const corner of cornerPreference) {
    if (board[corner] === null) {
      return corner;
    }
  }
  
  // If no corners available, take center
  if (board[4] === null) {
    return 4;
  }
  
  // If all corners and center taken, take any side
  const sides = [1, 3, 5, 7].filter(i => board[i] === null);
  if (sides.length > 0) {
    return sides[0];
  }
  
  // Take any available move
  const availableMoves = getAvailableMoves(board);
  return availableMoves[0];
}

/**
 * Implements the center strategy
 * Prioritizes taking center, then corners
 */
function centerStrategy(
  board: Board,
  aiPlayer: string
): MoveResult {
  const opponent = aiPlayer === 'X' ? 'O' : 'X';
  
  // First check for a winning move
  const winningMove = hasWinningMove(board, aiPlayer);
  if (winningMove !== null) {
    return winningMove;
  }
  
  // Then check for opponent's winning move to block
  const blockingMove = hasWinningMove(board, opponent);
  if (blockingMove !== null) {
    return blockingMove;
  }
  
  // Take center if available
  if (board[4] === null) {
    return 4;
  }
  
  // Take opposite corner of opponent's piece if possible
  const cornerPairs = [[0, 8], [2, 6]];
  for (const [c1, c2] of cornerPairs) {
    if (board[c1] === opponent && board[c2] === null) {
      return c2;
    }
    if (board[c2] === opponent && board[c1] === null) {
      return c1;
    }
  }
  
  // Take any corner
  const corners = [0, 2, 6, 8].filter(i => board[i] === null);
  if (corners.length > 0) {
    return corners[Math.floor(Math.random() * corners.length)];
  }
  
  // Take any side
  const sides = [1, 3, 5, 7].filter(i => board[i] === null);
  if (sides.length > 0) {
    return sides[Math.floor(Math.random() * sides.length)];
  }
  
  // Take any available move
  const availableMoves = getAvailableMoves(board);
  return availableMoves[Math.floor(Math.random() * availableMoves.length)];
}

/**
 * Random move strategy (for exploration)
 */
function randomStrategy(
  board: Board
): MoveResult {
  const availableMoves = getAvailableMoves(board);
  
  if (availableMoves.length === 0) {
    return -1;
  }
  
  return availableMoves[Math.floor(Math.random() * availableMoves.length)];
}

/**
 * Get a move using the specified strategy
 */
export function getStrategyMove(
  strategy: StrategyName,
  board: Board,
  aiPlayer: string,
  gameStyle: GameStyle = 'classic',
  xMoves: number[] = [],
  oMoves: number[] = []
): MoveResult {
  // Immediate win check for all strategies
  const winningMove = hasWinningMove(board, aiPlayer);
  if (winningMove !== null) {
    return winningMove;
  }
  
  // Block check for all strategies
  const opponent = aiPlayer === 'X' ? 'O' : 'X';
  const blockingMove = hasWinningMove(board, opponent);
  if (blockingMove !== null) {
    return blockingMove;
  }
  
  switch (strategy) {
    case 'minimax':
      return findBestMove(board, aiPlayer, gameStyle, xMoves, oMoves, 'hard');
    
    case 'mcts':
      return findBestMoveMCTS(board, aiPlayer);
    
    case 'bayesian': {
      const bayesianMove = getBayesianCounterMove(board, aiPlayer);
      if (bayesianMove !== null) {
        return bayesianMove;
      }
      // Fall back to MCTS if bayesian doesn't have enough data
      return findBestMoveMCTS(board, aiPlayer);
    }
    
    case 'aggressive':
      return aggressiveStrategy(board, aiPlayer);
    
    case 'defensive':
      return defensiveStrategy(board, aiPlayer);
    
    case 'corners':
      return cornersStrategy(board, aiPlayer);
    
    case 'center':
      return centerStrategy(board, aiPlayer);
    
    case 'random':
      return randomStrategy(board);
    
    default:
      return findBestMove(board, aiPlayer, gameStyle, xMoves, oMoves, 'hard');
  }
}

/**
 * Make a move using the multi-armed bandit strategy selector
 * This is the main function to use from outside this module
 */
export function getAdaptiveStrategyMove(
  board: Board,
  aiPlayer: string,
  gameStyle: GameStyle = 'classic',
  xMoves: number[] = [],
  oMoves: number[] = []
): MoveResult {
  // Select strategy using the bandit algorithm
  const strategy = selectStrategy();
  
  // Use the selected strategy to make a move
  return getStrategyMove(strategy, board, aiPlayer, gameStyle, xMoves, oMoves);
}

/**
 * Get statistics about the bandit strategy selector
 */
export interface BanditStats {
  strategies: Array<{
    name: string;
    wins: number;
    losses: number;
    draws: number;
    total: number;
    winRate: number;
    alpha: number;
    beta: number;
    expectedValue: number;
  }>;
  currentStrategy: StrategyName | null;
}

export function getBanditStats(): BanditStats {
  return {
    strategies: Array.from(strategies.entries()).map(([name, stats]) => ({
      name,
      wins: stats.wins,
      losses: stats.losses,
      draws: stats.draws,
      total: stats.total,
      winRate: stats.wins / stats.total,
      alpha: stats.alpha,
      beta: stats.beta,
      expectedValue: stats.alpha / (stats.alpha + stats.beta)
    })),
    currentStrategy
  };
}

/**
 * Reset the bandit strategy selector
 */
export function resetBandit(): void {
  strategies.forEach((stats) => {
    stats.wins = 1;
    stats.losses = 1;
    stats.draws = 1;
    stats.total = 3;
    stats.alpha = 1;
    stats.beta = 1;
  });
  
  currentStrategy = null;
}