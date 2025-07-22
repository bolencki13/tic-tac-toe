import { useState } from 'react';
import './styles.css';

export namespace TicTacToe {
  export type Props = {
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

  const handleClick = (index: number) => {
    if (board[index] || winner) return;
    
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