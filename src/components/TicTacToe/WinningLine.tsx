import { memo } from 'react';

export namespace WinningLine {
  export type Props = {
    winningLine: number[] | null;
  };
}

/**
 * Component that renders the winning line across the board
 */
export const WinningLine = memo(function WinningLine(props: WinningLine.Props) {
  const { winningLine } = props;
  
  if (!winningLine) return null;
  
  // Horizontal rows
  if (winningLine.toString() === [0, 1, 2].toString()) return <div className="winning-line row-1"></div>;
  if (winningLine.toString() === [3, 4, 5].toString()) return <div className="winning-line row-2"></div>;
  if (winningLine.toString() === [6, 7, 8].toString()) return <div className="winning-line row-3"></div>;
  
  // Vertical columns
  if (winningLine.toString() === [0, 3, 6].toString()) return <div className="winning-line col-1"></div>;
  if (winningLine.toString() === [1, 4, 7].toString()) return <div className="winning-line col-2"></div>;
  if (winningLine.toString() === [2, 5, 8].toString()) return <div className="winning-line col-3"></div>;
  
  // Diagonals - use SVG for these
  if (winningLine.toString() === [0, 4, 8].toString()) {
    return (
      <svg className="winning-line-svg" viewBox="0 0 244 244" preserveAspectRatio="none">
        <defs>
          <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#4CAF50" />
            <stop offset="25%"  stopColor="#66BB6A" />
            <stop offset="50%"  stopColor="#4CAF50" />
            <stop offset="75%"  stopColor="#388E3C" />
            <stop offset="100%" stopColor="#4CAF50" />
          </linearGradient>
        </defs>
        <line x1="10" y1="10" x2="234" y2="234" className="diagonal-line" />
      </svg>
    );
  }
  
  if (winningLine.toString() === [2, 4, 6].toString()) {
    return (
      <svg className="winning-line-svg" viewBox="0 0 244 244" preserveAspectRatio="none">
        <defs>
          <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#4CAF50" />
            <stop offset="25%"  stopColor="#66BB6A" />
            <stop offset="50%"  stopColor="#4CAF50" />
            <stop offset="75%"  stopColor="#388E3C" />
            <stop offset="100%" stopColor="#4CAF50" />
          </linearGradient>
        </defs>
        <line x1="234" y1="10" x2="10" y2="234" className="diagonal-line" />
      </svg>
    );
  }
  
  return null;
});