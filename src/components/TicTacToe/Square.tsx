import { memo } from 'react';

export namespace Square {
  export type Props = {
    value: string | null;
    onClick: () => void;
    isHighlighted: boolean;
    isWinningSquare: boolean;
    index: number;
  };
}

/**
 * Individual square component for the Tic Tac Toe board
 */
export const Square = memo(function Square(props: Square.Props) {
  const { value, onClick, isHighlighted, isWinningSquare, index } = props;
  
  // Compute class name based on props
  const squareClassName = `square ${isHighlighted ? 'highlighted' : ''} ${isWinningSquare ? 'winning' : ''}`;
  
  // Render SVG X and O with animation
  const renderSymbol = () => {
    if (!value) return null;
    
    if (value === 'X') {
      return (
        <svg className="symbol-svg" viewBox="0 0 80 80" preserveAspectRatio="xMidYMid meet">
          {/* First stroke of X */}
          <path 
            className="symbol-path x-symbol-1" 
            d="M20,20 L60,60"
            stroke="#3498db"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Second stroke of X */}
          <path 
            className="symbol-path x-symbol-2" 
            d="M60,20 L20,60"
            stroke="#3498db"
            strokeWidth="12"
            strokeLinecap="round"
          />
        </svg>
      );
    } else {
      return (
        <svg className="symbol-svg" viewBox="0 0 80 80" preserveAspectRatio="xMidYMid meet">
          <circle 
            className="symbol-path o-symbol" 
            cx="40" 
            cy="40" 
            r="25"
            stroke="#e74c3c"
            strokeWidth="12"
            fill="none"
          />
        </svg>
      );
    }
  };
  
  return (
    <button
      className={squareClassName}
      onClick={onClick}
      aria-label={`Square ${index}`}
    >
      {renderSymbol()}
      {isHighlighted && <span className="removal-indicator">↻</span>}
    </button>
  );
});