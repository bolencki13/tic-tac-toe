/**
 * Bayesian Opponent Modeling for Tic Tac Toe
 * 
 * This module implements a probabilistic model of the opponent's behavior
 * using Bayesian inference to predict their next moves based on observed patterns.
 */
import type { Board, MoveResult } from './gameTypes';

// Interface for tracking conditional probabilities P(move | board state)
interface ConditionalProbability {
  boardState: string;     // Serialized board state
  moveProbabilities: Map<number, number>; // Move index -> probability
  totalObservations: number; // Total number of observations for this state
}

// Constants for the Bayesian model
const LEARNING_RATE = 0.2;   // Rate at which new observations update the model
const MIN_OBSERVATIONS = 2;  // Minimum observations before making predictions

// Global state for the Bayesian model
const conditionalProbabilities = new Map<string, ConditionalProbability>();

// Prior probability distribution for moves (based on common strategic preferences)
const priorDistribution = new Map<number, number>([
  [0, 0.15], // Top-left corner
  [1, 0.05], // Top-middle
  [2, 0.15], // Top-right corner
  [3, 0.05], // Middle-left
  [4, 0.4],  // Center (strong prior)
  [5, 0.05], // Middle-right
  [6, 0.15], // Bottom-left corner
  [7, 0.05], // Bottom-middle
  [8, 0.15]  // Bottom-right corner
]);

/**
 * Helper function to serialize a board to string
 */
function serializeBoard(board: Board): string {
  return board.map(cell => cell === null ? '-' : cell).join('');
}

/**
 * Normalizes a board state by accounting for symmetries
 * to better generalize learned patterns
 */
function getNormalizedBoardState(board: Board): string {
  // Create all possible rotations and reflections
  const orientations: string[] = [];
  
  // Original
  orientations.push(board.map(c => c === null ? '-' : c).join(''));
  
  // 90° rotation
  const rot90 = [
    board[6], board[3], board[0],
    board[7], board[4], board[1],
    board[8], board[5], board[2]
  ];
  orientations.push(rot90.map(c => c === null ? '-' : c).join(''));
  
  // 180° rotation
  const rot180 = [
    board[8], board[7], board[6],
    board[5], board[4], board[3],
    board[2], board[1], board[0]
  ];
  orientations.push(rot180.map(c => c === null ? '-' : c).join(''));
  
  // 270° rotation
  const rot270 = [
    board[2], board[5], board[8],
    board[1], board[4], board[7],
    board[0], board[3], board[6]
  ];
  orientations.push(rot270.map(c => c === null ? '-' : c).join(''));
  
  // Horizontal flip
  const flipH = [
    board[2], board[1], board[0],
    board[5], board[4], board[3],
    board[8], board[7], board[6]
  ];
  orientations.push(flipH.map(c => c === null ? '-' : c).join(''));
  
  // Vertical flip
  const flipV = [
    board[6], board[7], board[8],
    board[3], board[4], board[5],
    board[0], board[1], board[2]
  ];
  orientations.push(flipV.map(c => c === null ? '-' : c).join(''));
  
  // Diagonal flip (top-left to bottom-right)
  const flipD1 = [
    board[0], board[3], board[6],
    board[1], board[4], board[7],
    board[2], board[5], board[8]
  ];
  orientations.push(flipD1.map(c => c === null ? '-' : c).join(''));
  
  // Diagonal flip (top-right to bottom-left)
  const flipD2 = [
    board[8], board[5], board[2],
    board[7], board[4], board[1],
    board[6], board[3], board[0]
  ];
  orientations.push(flipD2.map(c => c === null ? '-' : c).join(''));
  
  // Return the lexicographically smallest representation
  return orientations.sort()[0];
}

/**
 * Maps a move from one board orientation to another
 */
function mapMoveToOrientation(
  move: number, 
  fromOrientation: string, 
  toOrientation: string
): number {
  // If orientations are the same, no mapping needed
  if (fromOrientation === toOrientation) return move;
  
  // Define possible transformations and their move mappings
  const transformations = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8], // Identity
    [6, 3, 0, 7, 4, 1, 8, 5, 2], // 90° rotation
    [8, 7, 6, 5, 4, 3, 2, 1, 0], // 180° rotation
    [2, 5, 8, 1, 4, 7, 0, 3, 6], // 270° rotation
    [2, 1, 0, 5, 4, 3, 8, 7, 6], // Horizontal flip
    [6, 7, 8, 3, 4, 5, 0, 1, 2], // Vertical flip
    [0, 3, 6, 1, 4, 7, 2, 5, 8], // Diagonal flip (top-left to bottom-right)
    [8, 5, 2, 7, 4, 1, 6, 3, 0]  // Diagonal flip (top-right to bottom-left)
  ];
  
  // Find transformation from fromOrientation to canonical form
  
  // Find which transformation produces the target orientation
  for (const transform of transformations) {
    // Apply transformation to from orientation
    const transformedFrom = transform.map(i => fromOrientation[i]).join('');
    if (transformedFrom === toOrientation) {
      // Found the right transformation
      return transform[move];
    }
    
    // Apply inverse transformation to target orientation
    const inverseTransform = transform.map((_, idx) => 
      transform.findIndex(v => v === idx));
    const transformedTo = inverseTransform.map(i => toOrientation[i]).join('');
    if (transformedTo === fromOrientation) {
      // Found the inverse transformation
      return inverseTransform[move];
    }
  }
  
  // If no transformation is found (should never happen)
  console.error("Could not map move between orientations");
  return move;
}

/**
 * Observes a player's move and updates the Bayesian model
 */
export function observeMove(board: Board, moveIndex: number): void {
  // Get the board state before the move
  const boardCopy = [...board];
  boardCopy[moveIndex] = null;
  
  // Get a normalized representation of the board state
  const normalizedState = getNormalizedBoardState(boardCopy);
  
  // Map the move to the normalized orientation
  const normalizedMove = mapMoveToOrientation(
    moveIndex, 
    serializeBoard(boardCopy),
    normalizedState
  );
  
  // Get or create the conditional probability for this state
  let conditionalProb = conditionalProbabilities.get(normalizedState);
  if (!conditionalProb) {
    conditionalProb = {
      boardState: normalizedState,
      moveProbabilities: new Map<number, number>(),
      totalObservations: 0
    };
    
    // Initialize with prior distribution
    for (let i = 0; i < 9; i++) {
      // Only set priors for valid moves in this state
      if (normalizedState[i] === '-') {
        conditionalProb.moveProbabilities.set(i, priorDistribution.get(i) || 0.1);
      }
    }
    
    conditionalProbabilities.set(normalizedState, conditionalProb);
  }
  
  // Update the probability distribution with the observed move
  const currentProb = conditionalProb.moveProbabilities.get(normalizedMove) || 0;
  const newProb = currentProb * (1 - LEARNING_RATE) + LEARNING_RATE;
  
  // Update the probability of the observed move
  conditionalProb.moveProbabilities.set(normalizedMove, newProb);
  
  // Normalize probabilities to sum to 1
  let sum = 0;
  conditionalProb.moveProbabilities.forEach(prob => sum += prob);
  
  conditionalProb.moveProbabilities.forEach((prob, move) => {
    conditionalProb!.moveProbabilities.set(move, prob / sum);
  });
  
  // Increment observation count
  conditionalProb.totalObservations += 1;
}

/**
 * Predicts the opponent's next move using the Bayesian model
 */
export function predictOpponentMove(board: Board): { move: number, confidence: number } | null {
  const normalizedState = getNormalizedBoardState(board);
  
  // Get the conditional probability for this state
  const conditionalProb = conditionalProbabilities.get(normalizedState);
  
  // If we don't have enough observations for this state, return null
  if (!conditionalProb || conditionalProb.totalObservations < MIN_OBSERVATIONS) {
    return null;
  }
  
  // Find the move with highest probability
  let bestMove = -1;
  let highestProb = 0;
  
  conditionalProb.moveProbabilities.forEach((probability, move) => {
    // Check if the move is valid in the current board
    const originalMove = mapMoveToOrientation(
      move, 
      normalizedState,
      board.map(c => c === null ? '-' : c).join('')
    );
    
    if (board[originalMove] === null && probability > highestProb) {
      highestProb = probability;
      bestMove = originalMove;
    }
  });
  
  if (bestMove === -1) {
    return null;
  }
  
  return { 
    move: bestMove, 
    confidence: highestProb
  };
}

/**
 * Suggests a counter-move based on the predicted opponent move
 */
export function getBayesianCounterMove(board: Board): MoveResult | null {
  const prediction = predictOpponentMove(board);
  
  if (!prediction) {
    return null;
  }
  
  // If the confidence is high enough, use the predicted move
  if (prediction.confidence > 0.6) {
    return prediction.move;
  }
  
  // If confidence is moderate, consider the predicted move but allow
  // for other strategies to take precedence
  return prediction.confidence > 0.3 ? prediction.move : null;
}

/**
 * Resets the Bayesian model
 */
export function resetBayesianModel(): void {
  conditionalProbabilities.clear();
}

/**
 * Load Bayesian state from saved data
 */
export function loadBayesianState(data: BayesianStats): boolean {
  try {
    if (!data || !data.patternDetails || !Array.isArray(data.patternDetails)) {
      return false;
    }
    
    // Reset first to ensure clean state
    resetBayesianModel();
    
    // Reconstruct the conditional probabilities from saved data
    data.patternDetails.forEach(pattern => {
      if (!pattern.boardState || !pattern.probabilities || !Array.isArray(pattern.probabilities)) {
        return;
      }
      
      const moveProbabilities = new Map<number, number>();
      pattern.probabilities.forEach(moveProb => {
        if (moveProb.move !== undefined && moveProb.probability !== undefined) {
          moveProbabilities.set(moveProb.move, moveProb.probability);
        }
      });
      
      // Create and store the conditional probability
      const conditionalProb: ConditionalProbability = {
        boardState: pattern.boardState,
        moveProbabilities,
        totalObservations: Math.max(1, pattern.observations || 1)
      };
      
      conditionalProbabilities.set(pattern.boardState, conditionalProb);
    });
    
    return true;
  } catch (error) {
    console.error('Error loading Bayesian state:', error);
    return false;
  }
}

/**
 * Gets statistics about the Bayesian model
 */
export interface BayesianStats {
  totalPatterns: number;
  patternDetails: Array<{
    boardState: string;
    observations: number;
    probabilities: Array<{
      move: number;
      probability: number;
    }>;
  }>;
}

export function getBayesianStats(): BayesianStats {
  return {
    totalPatterns: conditionalProbabilities.size,
    patternDetails: Array.from(conditionalProbabilities.entries())
      .map(([state, data]) => ({
        boardState: state,
        observations: data.totalObservations,
        probabilities: Array.from(data.moveProbabilities.entries())
          .map(([move, prob]) => ({ move, probability: prob }))
          .sort((a, b) => b.probability - a.probability)
      }))
      .sort((a, b) => b.observations - a.observations)
  };
}