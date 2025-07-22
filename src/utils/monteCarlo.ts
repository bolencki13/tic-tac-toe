/**
 * Monte Carlo Tree Search (MCTS) algorithm for Tic Tac Toe
 * This provides a much more advanced AI that can learn and adapt through experience
 */
import { hasWinningMove } from './boardEvaluator';
import type { Board, MoveResult } from './gameTypes';

// Node in the Monte Carlo search tree
interface MCTSNode {
  state: Board;        // Board state at this node
  parent: MCTSNode | null;  // Parent node
  children: MCTSNode[];     // Child nodes
  moves: number[];          // Available moves from this state
  playerSymbol: string;     // Player to move at this state
  visits: number;           // Number of times this node has been visited
  wins: number;             // Number of wins through this node
  untriedMoves: number[];   // Moves not yet explored from this state
}

// Constants for MCTS
const EXPLORATION_PARAMETER = 1.414; // UCB1 exploration parameter (sqrt(2))
const DEFAULT_ITERATIONS = 1000;     // Default number of iterations
const MAX_TIME_MS = 500;            // Maximum time for search in milliseconds

/**
 * Creates a new node in the search tree
 */
function createNode(
  state: Board, 
  parent: MCTSNode | null, 
  moves: number[], 
  playerSymbol: string
): MCTSNode {
  return {
    state: [...state],
    parent,
    children: [],
    moves,
    playerSymbol,
    visits: 0,
    wins: 0,
    untriedMoves: [...moves]
  };
}

/**
 * Selects a child node using UCB1 formula
 */
function selectChild(node: MCTSNode): MCTSNode {
  let bestScore = -Infinity;
  let bestChild: MCTSNode | null = null;
  
  for (const child of node.children) {
    // UCB1 formula: wins/visits + C * sqrt(ln(parent visits) / visits)
    const exploitation = child.wins / child.visits;
    const exploration = EXPLORATION_PARAMETER * Math.sqrt(Math.log(node.visits) / child.visits);
    const score = exploitation + exploration;
    
    if (score > bestScore) {
      bestScore = score;
      bestChild = child;
    }
  }
  
  return bestChild!; // We know there's at least one child
}

/**
 * Expands the tree by adding a child node for an unexplored move
 */
function expand(node: MCTSNode): MCTSNode {
  // Get a random untried move
  const moveIndex = Math.floor(Math.random() * node.untriedMoves.length);
  const move = node.untriedMoves[moveIndex];
  
  // Remove this move from untried moves
  node.untriedMoves.splice(moveIndex, 1);
  
  // Create new state after making this move
  const nextState = [...node.state];
  nextState[move] = node.playerSymbol;
  
  // Calculate available moves for the next state
  const nextMoves = getAvailableMoves(nextState);
  
  // Switch to the other player
  const nextPlayer = node.playerSymbol === 'X' ? 'O' : 'X';
  
  // Create child node
  const childNode = createNode(nextState, node, nextMoves, nextPlayer);
  
  // Add child to parent's children
  node.children.push(childNode);
  
  return childNode;
}

/**
 * Simulates a random play-out from the given state
 * Returns the result from the perspective of the player who made the last move
 */
function simulate(node: MCTSNode): number {
  // Make a copy of the state to simulate
  const state = [...node.state];
  let currentPlayer = node.playerSymbol;
  
  // Get available moves
  let availableMoves = getAvailableMoves(state);
  
  // Continue until terminal state
  while (availableMoves.length > 0) {
    // Check for a winner
    const winner = checkWinner(state);
    if (winner !== null) {
      return winner === node.playerSymbol ? 1 : 0; // Win or loss
    }
    
    // Random move
    const moveIndex = Math.floor(Math.random() * availableMoves.length);
    const move = availableMoves[moveIndex];
    
    // Make move
    state[move] = currentPlayer;
    
    // Switch player
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    
    // Update available moves
    availableMoves = getAvailableMoves(state);
  }
  
  // Check if there's a winner in the final state
  const winner = checkWinner(state);
  if (winner === null) {
    return 0.5; // Draw
  }
  
  return winner === node.playerSymbol ? 1 : 0; // Win or loss
}

/**
 * Backpropagates the result through the tree
 */
function backpropagate(node: MCTSNode, result: number): void {
  let current: MCTSNode | null = node;
  
  while (current !== null) {
    current.visits += 1;
    
    // The result needs to be inverted as we move up the tree
    // because the winner alternates with each level
    if (current.playerSymbol === node.playerSymbol) {
      current.wins += result;
    } else {
      current.wins += (1 - result); // Invert result for opponent
    }
    
    current = current.parent;
  }
}

/**
 * Gets all available moves in the given state
 */
function getAvailableMoves(board: Board): number[] {
  return board
    .map((cell, index) => cell === null ? index : -1)
    .filter(index => index !== -1);
}

/**
 * Serialize a board to string representation
 */
export function serializeBoard(board: Board): string {
  return board.map(cell => cell === null ? '-' : cell).join('');
}

/**
 * Checks if there is a winner in the given state
 */
function checkWinner(board: Board): string | null {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
  ];
  
  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  
  return null;
}

/**
 * Runs the Monte Carlo Tree Search algorithm
 * @param board Current board state
 * @param player Current player ('X' or 'O')
 * @param iterations Number of iterations to run
 * @returns The best move found
 */
export function findBestMoveMCTS(
  board: Board, 
  player: string, 
  iterations: number = DEFAULT_ITERATIONS
): MoveResult {
  // First, check for immediate winning moves and blocking moves
  const winningMove = hasWinningMove(board, player);
  if (winningMove !== null) {
    return winningMove;
  }
  
  const opponent = player === 'X' ? 'O' : 'X';
  const blockingMove = hasWinningMove(board, opponent);
  if (blockingMove !== null) {
    return blockingMove;
  }
  
  // Get available moves
  const availableMoves = getAvailableMoves(board);
  
  // If there's only one move, return it immediately
  if (availableMoves.length === 1) {
    return availableMoves[0];
  }
  
  // If no moves available, return -1
  if (availableMoves.length === 0) {
    return -1;
  }
  
  // Create root node
  const rootNode = createNode(board, null, availableMoves, player);
  
  // Record start time to enforce time limit
  const startTime = Date.now();
  let iterationsCompleted = 0;
  
  // Main MCTS loop
  while (iterationsCompleted < iterations && (Date.now() - startTime) < MAX_TIME_MS) {
    // Selection: select best child until we reach a node with untried moves or a terminal node
    let node = rootNode;
    while (node.untriedMoves.length === 0 && node.children.length > 0) {
      node = selectChild(node);
    }
    
    // Expansion: if node has untried moves, expand it
    if (node.untriedMoves.length > 0) {
      node = expand(node);
    }
    
    // Simulation: run a random simulation from the new node
    const result = simulate(node);
    
    // Backpropagation: update statistics back up the tree
    backpropagate(node, result);
    
    iterationsCompleted++;
  }
  
  // Find the move with the most visits
  let bestMove = -1;
  let mostVisits = -1;
  
  for (const child of rootNode.children) {
    if (child.visits > mostVisits) {
      mostVisits = child.visits;
      // Find which move led to this child
      for (let i = 0; i < board.length; i++) {
        if (board[i] !== child.state[i]) {
          bestMove = i;
          break;
        }
      }
    }
  }
  
  return bestMove;
}

/**
 * Helper method to get stats about the MCTS search
 * Useful for debugging and tuning
 */
export function getMCTSStats(
  board: Board, 
  player: string, 
  iterations: number = DEFAULT_ITERATIONS
): {
  iterationsCompleted: number;
  timeSpent: number;
  totalSimulations: number;
  moveStats: Array<{
    move: number;
    visits: number;
    wins: number;
    winRate: number;
  }>;
} {
  const rootNode = createNode(board, null, getAvailableMoves(board), player);
  
  const startTime = Date.now();
  let iterationsCompleted = 0;
  
  // Main MCTS loop
  while (iterationsCompleted < iterations && (Date.now() - startTime) < MAX_TIME_MS) {
    let node = rootNode;
    while (node.untriedMoves.length === 0 && node.children.length > 0) {
      node = selectChild(node);
    }
    
    if (node.untriedMoves.length > 0) {
      node = expand(node);
    }
    
    const result = simulate(node);
    backpropagate(node, result);
    
    iterationsCompleted++;
  }
  
  // Collect stats for each potential move
  const moveStats = rootNode.children.map(child => {
    // Find which move led to this child
    let moveIndex = -1;
    for (let i = 0; i < board.length; i++) {
      if (board[i] !== child.state[i]) {
        moveIndex = i;
        break;
      }
    }
    
    return {
      move: moveIndex,
      visits: child.visits,
      wins: child.wins,
      winRate: child.wins / child.visits
    };
  });
  
  return {
    iterationsCompleted,
    timeSpent: Date.now() - startTime,
    totalSimulations: rootNode.visits,
    moveStats: moveStats.sort((a, b) => b.visits - a.visits)
  };
}