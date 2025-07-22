import { useState, useEffect } from 'react';
import { findBestMove, findRandomMove } from '../../utils/aiOpponent';
import './styles.css';

export namespace TicTacToe {
  export type GameMode = 'single' | 'multi';
  export type Difficulty = 'easy' | 'medium' | 'hard';

  export type Props = {
    mode: GameMode;
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

  // AI player is always 'O', human is always 'X' in single player mode
  const aiPlayer = 'O';

  /**
   * Side effects
   */
  // Effect to trigger AI move when it's AI's turn in single player mode
  useEffect(() => {
    if (props.mode === 'single' && !isXNext && !winner) {
      makeAIMove();
    }
  }, [isXNext, winner, props.mode]);

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
    if (winner || isXNext || board.every(square => square !== null)) {
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
        newBoard[moveIndex] = aiPlayer;
        setBoard(newBoard);

        const newWinner = calculateWinner(newBoard);
        if (newWinner) {
          setWinner(newWinner);
          props.onGameEnd?.(newWinner);
        } else if (newBoard.every(square => square !== null)) {
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

    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);

    const newWinner = calculateWinner(newBoard);
    if (newWinner) {
      setWinner(newWinner);
      props.onGameEnd?.(newWinner);
    } else if (newBoard.every(square => square !== null)) {
      // Draw case
      props.onGameEnd?.(null);
    } else {
      setIsXNext(!isXNext);
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setIsAIThinking(false);
  };

  const renderSquare = (index: number) => (
    <button
      className="square"
      onClick={() => handleClick(index)}
      aria-label={`Square ${index}`}
    >
      {board[index]}
    </button>
  );

  /**
   * Status message
   */
  const status = winner
    ? `Winner: ${winner}`
    : board.every(square => square !== null)
      ? 'Game ended in a draw'
      : isAIThinking
        ? 'AI is thinking...'
        : `Next player: ${isXNext ? 'X' : 'O'}`;

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