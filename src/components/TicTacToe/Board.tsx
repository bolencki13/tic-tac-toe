import { memo } from 'react';
import { Square } from './Square';

export namespace Board {
  export type Props = {
    board: Array<string | null>;
    highlightCell: number | null;
    winningLine: number[] | null;
    onSquareClick: (index: number) => void;
  };
}

/**
 * Game board component that renders the 3x3 grid of squares
 */
export const Board = memo(function Board(props: Board.Props) {
  const { board, highlightCell, winningLine, onSquareClick } = props;
  
  // Create a square component with the right props
  const renderSquare = (index: number) => {
    // Only highlight if there's no winner yet
    const isHighlighted = highlightCell === index;
    // Check if this square is part of the winning line
    const isWinningSquare = winningLine?.includes(index) || false;
    
    return (
      <Square
        key={index}
        value={board[index]}
        onClick={() => onSquareClick(index)}
        isHighlighted={isHighlighted}
        isWinningSquare={isWinningSquare}
        index={index}
      />
    );
  };
  
  return (
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
  );
});