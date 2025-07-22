import { useState, useEffect } from 'react';
import { findBestMove, findRandomMove } from '../../utils/aiOpponent';
import './styles.css';

export namespace TicTacToe {
  export type GameMode = 'single' | 'multi';
  export type Difficulty = 'easy' | 'medium' | 'hard';
  export type GameStyle = 'classic' | 'limited';

  export type Props = {
    mode: GameMode;
    style: GameStyle;
    difficulty?: Difficulty;
    onGameEnd?: (winner: string | null) => void;
  }
}

export function TicTacToe(props: TicTacToe.Props) {
  /**
   * State vars
   */
  const [board, setBoard] = useState<Array<string | null>>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState<boolean>(true);
  const [winner, setWinner] = useState<string | null>(null);
  const [isAIThinking, setIsAIThinking] = useState<boolean>(false);
  // Track move history for limited mode (3 moves per player)
  const [xMoves, setXMoves] = useState<number[]>([]);
  const [oMoves, setOMoves] = useState<number[]>([]);
  const [highlightCell, setHighlightCell] = useState<number | null>(null);

  // AI player is always 'O', human is always 'X' in single player mode
  const aiPlayer = 'O';

  // Constants
  const MAX_MOVES_PER_PLAYER = 3;

  /**
   * Side effects
   */
  // Effect to trigger AI move when it's AI's turn in single player mode
  useEffect(() => {
    if (props.mode === 'single' && !isXNext && !winner) {
      makeAIMove();
    }
  }, [isXNext, winner, props.mode]);

  // Effect to highlight the next piece to be removed in limited mode
  useEffect(() => {
    if (props.style === 'limited') {
      // Highlight the oldest piece for the next player
      if (isXNext && xMoves.length === MAX_MOVES_PER_PLAYER) {
        setHighlightCell(xMoves[0]);
      } else if (!isXNext && oMoves.length === MAX_MOVES_PER_PLAYER) {
        setHighlightCell(oMoves[0]);
      } else {
        setHighlightCell(null);
      }
    } else {
      setHighlightCell(null);
    }
  }, [isXNext, xMoves, oMoves, props.style]);

  /**
   * Helpers
   */
  const calculateWinner = (squares: Array<string | null>): string | null => {
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
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }

    return null;
  };

  // AI move handler
  const makeAIMove = () => {
    // If game is over or not AI's turn, do nothing
    if (winner || isXNext) {
      return;
    }

    // In classic mode, also return if board is full
    if (props.style === 'classic' && board.every(square => square !== null)) {
      return;
    }

    setIsAIThinking(true);

    // Add a small delay to simulate "thinking"
    setTimeout(() => {
      const newBoard = [...board];
      let moveIndex: number;

      // Choose AI move based on difficulty
      switch (props.difficulty) {
        case 'easy':
          moveIndex = findRandomMove(newBoard);
          break;
        case 'medium':
          // 50% chance to make a random move, 50% chance to make the best move
          moveIndex = Math.random() > 0.5
            ? findRandomMove(newBoard)
            : findBestMove(newBoard, aiPlayer);
          break;
        case 'hard':
        default:
          moveIndex = findBestMove(newBoard, aiPlayer);
          break;
      }

      if (moveIndex >= 0) {
        // Limited mode special handling for AI
        if (props.style === 'limited') {
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
        const newWinner = calculateWinner(newBoard);
        if (newWinner) {
          setWinner(newWinner);
          props.onGameEnd?.(newWinner);
        } else if (props.style === 'classic' && newBoard.every(square => square !== null)) {
          // Draw case in classic mode only
          props.onGameEnd?.(null);
        }
      }

      setIsXNext(true);
      setIsAIThinking(false);
    }, 500);
  };

  // Handle human player click
  const handleClick = (index: number) => {
    // If square is occupied, game is over, or AI is thinking, do nothing
    if (board[index] || winner || (props.mode === 'single' && !isXNext) || isAIThinking) {
      return;
    }

    const currentPlayer = isXNext ? 'X' : 'O';
    const currentMoves = isXNext ? xMoves : oMoves;
    const newBoard = [...board];

    // Limited mode special handling
    if (props.style === 'limited') {
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

    // Check for winner
    const newWinner = calculateWinner(newBoard);
    if (newWinner) {
      setWinner(newWinner);
      props.onGameEnd?.(newWinner);
    } else {
      // In classic mode, check for draw when board is full
      // In limited mode, we never reach a draw by filling the board
      if (props.style === 'classic' && newBoard.every(square => square !== null)) {
        // Draw case
        props.onGameEnd?.(null);
      } else {
        setIsXNext(!isXNext);
      }
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setIsAIThinking(false);
    setXMoves([]);
    setOMoves([]);
    setHighlightCell(null);
  };

  const renderSquare = (index: number) => {
    const isHighlighted = highlightCell === index;
    const squareClassName = `square ${isHighlighted ? 'highlighted' : ''}`;

    return (
      <button
        className={squareClassName}
        onClick={() => handleClick(index)}
        aria-label={`Square ${index}`}
      >
        {board[index]}
        {isHighlighted && <span className="removal-indicator">↻</span>}
      </button>
    );
  };

  /**
   * Status message
   */
  const getMoveCount = (player: string) => {
    return player === 'X' ? xMoves.length : oMoves.length;
  };

  let status;
  if (winner) {
    status = `Winner: ${winner}`;
  } else if (props.style === 'classic' && board.every(square => square !== null)) {
    status = 'Game ended in a draw';
  } else if (isAIThinking) {
    status = 'AI is thinking...';
  } else {
    const currentPlayer = isXNext ? 'X' : 'O';
    status = `Next player: ${currentPlayer}`;

    // Add move count for limited mode
    if (props.style === 'limited') {
      const moveCount = getMoveCount(currentPlayer);
      status += ` (${moveCount}/${MAX_MOVES_PER_PLAYER} moves)`;

      if (moveCount === MAX_MOVES_PER_PLAYER) {
        status += ' - Next move will replace oldest piece';
      }
    }
  }

  /**
   * Render
   */
  return (
    <div className="tic-tac-toe">
      <div className="status">{status}</div>
      <div className="board">
        <div className="board-row">
          {renderSquare(0)}
          {renderSquare(1)}
          {renderSquare(2)}
        </div>
        <div className="board-row">
          {renderSquare(3)}
          {renderSquare(4)}
          {renderSquare(5)}
        </div>
        <div className="board-row">
          {renderSquare(6)}
          {renderSquare(7)}
          {renderSquare(8)}
        </div>
      </div>
      <button className="reset-button" onClick={resetGame}>
        Reset Game
      </button>
    </div>
  );
}