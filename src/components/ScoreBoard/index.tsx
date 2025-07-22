import React from 'react';
import './styles.css';

export namespace ScoreBoard {
  export type Props = {
    scores: {
      player1: number;
      player2: number;
      ties: number;
    };
    gameMode: 'single' | 'multi';
  }
}

export function ScoreBoard(props: ScoreBoard.Props) {
  /**
   * Render
   */
  return (
    <div className="score-board">
      <div className="score-item">
        <div className="score-label">
          {props.gameMode === 'single' ? 'You (X)' : 'Player 1 (X)'}
        </div>
        <div className="score-value">{props.scores.player1}</div>
      </div>

      <div className="score-item">
        <div className="score-label">Ties</div>
        <div className="score-value">{props.scores.ties}</div>
      </div>

      <div className="score-item">
        <div className="score-label">
          {props.gameMode === 'single' ? 'AI (O)' : 'Player 2 (O)'}
        </div>
        <div className="score-value">{props.scores.player2}</div>
      </div>
    </div>
  );
}