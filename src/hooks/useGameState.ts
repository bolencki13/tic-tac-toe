import { useState, useEffect, useCallback } from 'react';
import { findBestMove, findRandomMove } from '../utils/aiOpponent';
import { 
  findBestMoveAdvanced, 
  recordPlayerMoveAdvanced, 
  recordGameResultAdvanced,
  initializeAdvancedAI
} from '../utils/advancedAI';
import type { TicTacToe } from '../components/TicTacToe/TicTacToe';

export function useGameState(props: {
  mode: TicTacToe.GameMode;
  style: TicTacToe.GameStyle;
  difficulty?: TicTacToe.Difficulty;
  onGameEnd?: (winner: string | null) => void;
}) {
  const { mode, style, difficulty, onGameEnd } = props;

  // Game state
  const [board, setBoard] = useState<Array<string | null>>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState<boolean>(true);
  const [winner, setWinner] = useState<string | null>(null);
  const [isAIThinking, setIsAIThinking] = useState<boolean>(false);
  // Track move history for limited mode (3 moves per player)
  const [xMoves, setXMoves] = useState<number[]>([]);
  const [oMoves, setOMoves] = useState<number[]>([]);
  const [highlightCell, setHighlightCell] = useState<number | null>(null);
  // Track winning line indices
  const [winningLine, setWinningLine] = useState<number[] | null>(null);

  // AI player is always 'O', human is always 'X' in single player mode
  const aiPlayer = 'O';

  // Constants
  const MAX_MOVES_PER_PLAYER = 3;

  /**
   * Calculate winner helper function - memoized for performance
   */
  const calculateWinner = useCallback((squares: Array<string | null>) => {
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

    for (const line of lines) {
      const [a, b, c] = line;
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a], line: line };
      }
    }

    return { winner: null, line: null };
  }, []);

  /**
   * Reset game state
   * @param initialMove Optional index to place a move right after resetting
   */
  const resetGame = useCallback((initialMove?: number) => {
    // Record game outcome if we're resetting mid-game
    if (mode === 'single' && board.some(cell => cell !== null) && !winner) {
      // Treat abandoning a game as a loss for learning purposes
      recordGameResultAdvanced('X', aiPlayer);
    }
    
    // Reset all state variables
    const newBoard = Array(9).fill(null);
    setBoard(newBoard);
    setIsXNext(true);
    setWinner(null);
    setIsAIThinking(false);
    setXMoves([]);
    setOMoves([]);
    setHighlightCell(null);
    setWinningLine(null);

    // If an initial move was provided, place it after resetting
    if (initialMove !== undefined && initialMove >= 0 && initialMove < 9) {
      // Small delay to ensure state is updated before placing the move
      setTimeout(() => {
        // Update the board with the new move (player X always starts)
        const updatedBoard = [...newBoard];
        updatedBoard[initialMove] = 'X';
        setBoard(updatedBoard);

        // Update moves history for limited mode
        if (style === 'limited') {
          setXMoves([initialMove]);
        }

        // Set next player to O
        setIsXNext(false);
      }, 10);
    }
  }, [style, mode, board, winner, aiPlayer]);


  /**
   * AI move handler
   */
  const makeAIMove = useCallback(() => {
    // If game is over or not AI's turn, do nothing
    if (winner || isXNext) {
      return;
    }

    // In classic mode, also return if board is full
    if (style === 'classic' && board.every(square => square !== null)) {
      return;
    }

    setIsAIThinking(true);

    // Add a small delay to simulate "thinking"
    setTimeout(() => {
      const newBoard = [...board];
      let moveIndex: number;

      // Choose AI move based on difficulty
      switch (difficulty) {
        case 'easy':
          moveIndex = findRandomMove(newBoard, aiPlayer, style, xMoves, oMoves);
          break;
        case 'medium':
          // 50% chance to make a random move, 50% chance to make the best move
          moveIndex = Math.random() > 0.5
            ? findRandomMove(newBoard, aiPlayer, style, xMoves, oMoves)
            : findBestMove(newBoard, aiPlayer, style, xMoves, oMoves, difficulty);
          break;
        case 'hard':
        default:
          // Use the advanced AI system with all learning algorithms integrated
          moveIndex = findBestMoveAdvanced(newBoard, aiPlayer, style, xMoves, oMoves, difficulty);
          break;
      }

      if (moveIndex >= 0) {
        // Limited mode special handling for AI
        if (style === 'limited') {
          // If AI already has MAX_MOVES_PER_PLAYER moves, remove the oldest one
          if (oMoves.length >= MAX_MOVES_PER_PLAYER) {
            const oldestMoveIndex = oMoves[0];
            newBoard[oldestMoveIndex] = null;

            // Update O moves array (remove oldest and add new)
            setOMoves(prevMoves => [...prevMoves.slice(1), moveIndex]);
          } else {
            // Just add the new move
            setOMoves(prevMoves => [...prevMoves, moveIndex]);
          }
        }

        // Update the board with AI's move
        newBoard[moveIndex] = aiPlayer;
        setBoard(newBoard);

        // Check for winner
        const result = calculateWinner(newBoard);
        if (result.winner) {
          setWinner(result.winner);
          setWinningLine(result.line);
          onGameEnd?.(result.winner);
        } else if (style === 'classic' && newBoard.every(square => square !== null)) {
          // Draw case in classic mode only
          onGameEnd?.(null);
        }
      }

      setIsXNext(true);
      setIsAIThinking(false);
    }, 500);
  }, [board, isXNext, winner, style, difficulty, oMoves, calculateWinner, onGameEnd, xMoves]);

  /**
   * Effect to trigger AI move when it's AI's turn in single player mode
   */
  // Initialize advanced AI when the hook is first used
  useEffect(() => {
    if (mode === 'single') {
      initializeAdvancedAI();
    }
  }, [mode]);
  
  useEffect(() => {
    if (mode === 'single' && !isXNext && !winner) {
      makeAIMove();
    }
  }, [isXNext, winner, mode, makeAIMove]);

  /**
   * Effect to highlight the next piece to be removed in limited mode
   */
  useEffect(() => {
    // Don't highlight any cell if there's a winner or if not in limited mode
    if (winner || style !== 'limited') {
      setHighlightCell(null);
      return;
    }

    // Highlight the oldest piece for the next player (only if no winner)
    if (isXNext && xMoves.length === MAX_MOVES_PER_PLAYER) {
      setHighlightCell(xMoves[0]);
    } else if (!isXNext && oMoves.length === MAX_MOVES_PER_PLAYER) {
      setHighlightCell(oMoves[0]);
    } else {
      setHighlightCell(null);
    }
  }, [isXNext, xMoves, oMoves, style, winner]);

  /**
   * Handle human player click
   */
  const handleClick = useCallback((index: number) => {
    // If there's a winner, start a new game and place a move at the clicked position
    if (winner) {
      resetGame(index);
      return;
    }

    // If square is occupied, AI is thinking, or it's AI's turn, do nothing
    if (board[index] || (mode === 'single' && !isXNext) || isAIThinking) {
      return;
    }

    const currentPlayer = isXNext ? 'X' : 'O';
    const currentMoves = isXNext ? xMoves : oMoves;
    const newBoard = [...board];

    // Limited mode special handling
    if (style === 'limited') {
      // If player already has MAX_MOVES_PER_PLAYER moves, remove the oldest one
      if (currentMoves.length >= MAX_MOVES_PER_PLAYER) {
        const oldestMoveIndex = currentMoves[0];
        newBoard[oldestMoveIndex] = null;

        // Update the moves array (remove oldest and add new)
        if (isXNext) {
          setXMoves(prevMoves => [...prevMoves.slice(1), index]);
        } else {
          setOMoves(prevMoves => [...prevMoves.slice(1), index]);
        }
      } else {
        // Just add the new move
        if (isXNext) {
          setXMoves(prevMoves => [...prevMoves, index]);
        } else {
          setOMoves(prevMoves => [...prevMoves, index]);
        }
      }
    }

    // Update the board with the new move
    newBoard[index] = currentPlayer;
    setBoard(newBoard);
    
    // Record the move for AI learning (only in single player mode when human player makes a move)
    if (mode === 'single' && currentPlayer === 'X') {
      // Use the advanced AI learning system
      recordPlayerMoveAdvanced([...newBoard], index);
    }

    // Check for winner
    const result = calculateWinner(newBoard);
    if (result.winner) {
      setWinner(result.winner);
      setWinningLine(result.line);
      
      // Record game result for AI learning when game ends
      if (mode === 'single') {
        recordGameResultAdvanced(result.winner, aiPlayer);
      }
      
      onGameEnd?.(result.winner);
    } else {
      // In classic mode, check for draw when board is full
      // In limited mode, we never reach a draw by filling the board
      if (style === 'classic' && newBoard.every(square => square !== null)) {
        // Draw case - also record this result for AI learning
        if (mode === 'single') {
          recordGameResultAdvanced(null, aiPlayer);
        }
        onGameEnd?.(null);
      } else {
        setIsXNext(!isXNext);
      }
    }
  }, [board, winner, mode, isXNext, isAIThinking, style, xMoves, oMoves, calculateWinner, onGameEnd, resetGame]);

  // Check if the game is a draw
  const isDraw = style === 'classic' && board.every(square => square !== null) && !winner;

  return {
    board,
    isXNext,
    winner,
    isAIThinking,
    xMoves,
    oMoves,
    highlightCell,
    winningLine,
    isDraw,
    handleClick,
    resetGame
  };
}