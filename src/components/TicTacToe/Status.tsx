import { memo } from 'react';

export namespace Status {
  export type Props = {
    winner: string | null;
    isAIThinking: boolean;
    isXNext: boolean;
    isDraw: boolean;
  };
}

/**
 * Game status component that displays the current game state
 */
export const Status = memo(function Status(props: Status.Props) {
  const { winner, isAIThinking, isXNext, isDraw } = props;
  
  let statusText: string;
  
  if (winner) {
    statusText = `Winner: ${winner}`;
  } else if (isDraw) {
    statusText = 'Game ended in a draw';
  } else if (isAIThinking) {
    statusText = 'AI is thinking...';
  } else {
    const currentPlayer = isXNext ? 'X' : 'O';
    statusText = `Next player: ${currentPlayer}`;
  }
  
  return <div className="status">{statusText}</div>;
});