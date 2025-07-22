/**
 * Advanced AI Module for Tic Tac Toe
 * 
 * This module integrates all the advanced AI algorithms into a cohesive system:
 * - Monte Carlo Tree Search for forward planning
 * - Bayesian opponent modeling for prediction
 * - Multi-armed bandit for strategy selection
 * - Persistent learning database for long-term improvement
 */
import type { Board, MoveResult, GameStyle } from './gameTypes';
import { findBestMoveMCTS } from './monteCarlo';
import { observeMove } from './bayesianModel';
import { getAdaptiveStrategyMove, recordGameOutcome } from './banditStrategies';
import { initializePersistentLearning, saveLearnedData } from './persistentLearning';
import { hasWinningMove } from './boardEvaluator';

// Initialize the advanced AI system
let aiInitialized = false;

/**
 * Initialize the advanced AI system
 */
export function initializeAdvancedAI(): void {
  if (aiInitialized) return;
  
  // Initialize persistent learning
  initializePersistentLearning();
  
  aiInitialized = true;
  console.log('Advanced AI system initialized');
}

/**
 * Record a player's move for learning
 */
export function recordPlayerMoveAdvanced(
  board: Board, 
  moveIndex: number
): void {
  // Initialize if not already done
  if (!aiInitialized) {
    initializeAdvancedAI();
  }
  
  // Pass the move to the Bayesian model for learning
  observeMove(board, moveIndex);
}

/**
 * Record game result for learning
 */
export function recordGameResultAdvanced(
  winner: string | null, 
  aiPlayer: string
): void {
  // Initialize if not already done
  if (!aiInitialized) {
    initializeAdvancedAI();
  }
  
  // Pass the result to the bandit system
  recordGameOutcome(winner, aiPlayer);
  
  // Save the learned data
  saveLearnedData();
}

/**
 * Get the best move using the advanced AI system
 */
export function findBestMoveAdvanced(
  board: Board,
  aiPlayer: string,
  gameStyle: GameStyle = 'classic',
  xMoves: number[] = [],
  oMoves: number[] = [],
  difficulty: string = 'hard'
): MoveResult {
  // Initialize if not already done
  if (!aiInitialized) {
    initializeAdvancedAI();
  }
  
  // For easy difficulty, use simpler strategies
  if (difficulty === 'easy') {
    const opponent = aiPlayer === 'X' ? 'O' : 'X';
    
    // 80% chance to miss winning moves
    if (Math.random() > 0.2) {
      const winningMove = hasWinningMove(board, aiPlayer);
      if (winningMove !== null) {
        return winningMove;
      }
    }
    
    // 50% chance to miss blocking moves
    if (Math.random() > 0.5) {
      const blockingMove = hasWinningMove(board, opponent);
      if (blockingMove !== null) {
        return blockingMove;
      }
    }
    
    // Make random moves with preference for center and corners
    const availableMoves = board
      .map((cell, index) => cell === null ? index : -1)
      .filter(index => index !== -1);
    
    // Prefer center
    if (availableMoves.includes(4) && Math.random() > 0.3) {
      return 4;
    }
    
    // Otherwise make a random move
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
  }
  
  // For medium difficulty, occasionally make sub-optimal moves
  if (difficulty === 'medium') {
    // 70% chance to use advanced AI, 30% chance to use simpler approach
    if (Math.random() > 0.3) {
      return getAdaptiveStrategyMove(board, aiPlayer, gameStyle, xMoves, oMoves);
    } else {
      // Use MCTS with fewer iterations for medium difficulty
      return findBestMoveMCTS(board, aiPlayer, 200);
    }
  }
  
  // For hard difficulty, use the full advanced AI system
  return getAdaptiveStrategyMove(board, aiPlayer, gameStyle, xMoves, oMoves);
}

/**
 * Reset the AI's learning data
 * Useful for testing or when the player wants a fresh start
 */
export function resetAdvancedAI(): void {
  import('./persistentLearning').then(module => {
    module.resetLearnedData();
  });
}

/**
 * Get statistics about the AI's learning
 * Useful for debugging and visualization
 */
export function getAIStats(): Promise<unknown> {
  if (!aiInitialized) {
    initializeAdvancedAI();
  }
  
  // We need to use dynamic import for this function
  // This returns a Promise, but since this is for debugging only, it's acceptable
  return import('./persistentLearning').then(module => {
    return module.getLearningStats();
  });
}