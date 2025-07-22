import { memo, useCallback } from 'react';
import { useGameState } from '../../hooks/useGameState';
import { Confetti } from '../Confetti';
import { Board } from './Board';
import { Status } from './Status';
import { WinningLine } from './WinningLine';
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

export const TicTacToe = memo(function TicTacToe(props: TicTacToe.Props) {
  // Use custom hook to manage game state
  const {
    board,
    isXNext,
    winner,
    isAIThinking,
    highlightCell,
    winningLine,
    isDraw,
    handleClick,
    resetGame
  } = useGameState(props);

  // Memoized click handler to optimize renders
  const handleSquareClick = useCallback((index: number) => {
    handleClick(index);
  }, [handleClick]);

  return (
    <div className="tic-tac-toe">
      {/* Show confetti when there's a winner */}
      <Confetti active={!!winner} />
      
      {/* Status message */}
      <Status
        winner={winner}
        isAIThinking={isAIThinking}
        isXNext={isXNext}
        isDraw={isDraw}
      />

      {/* Game board container */}
      <div className="board-container">
        <WinningLine winningLine={winningLine} />
        <Board
          board={board}
          highlightCell={highlightCell}
          winningLine={winningLine}
          onSquareClick={handleSquareClick}
        />
      </div>

      {/* Reset/New Game button */}
      <button className="reset-button" onClick={resetGame}>
        {winner ? 'New Game' : 'Reset Game'}
      </button>
    </div>
  );
});