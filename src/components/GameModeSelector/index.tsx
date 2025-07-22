import './styles.css';

export namespace GameModeSelector {
  export type GameMode = 'single' | 'multi';

  export type Props = {
    onSelectMode: (mode: GameMode) => void;
  }
}

export function GameModeSelector(props: GameModeSelector.Props) {
  /**
   * Render
   */
  return (
    <div className="game-mode-selector">
      <h2>Select Game Mode</h2>
      
      <div className="game-description">
        <p>
          Welcome to Advanced Tic Tac Toe!
        </p>
        <p>
          This isn't your ordinary Tic Tac Toe. Choose between single-player against our AI (which learns from your moves in Hard mode) or multiplayer with a friend.
        </p>
        <p>
          Game Modes:
        </p>
        <ul>
          <li><strong>Classic:</strong> First to get three in a row wins</li>
          <li><strong>Limited:</strong> Each player has only 3 pieces - strategic placement is key!</li>
        </ul>
        <p>
          In Hard mode, our AI uses machine learning to adapt to your play style. The more you play, the smarter it gets!
        </p>
      </div>
      
      <div className="mode-buttons">
        <button
          onClick={() => props.onSelectMode('single')}
          className="mode-button"
        >
          Single Player
        </button>
        <button
          onClick={() => props.onSelectMode('multi')}
          className="mode-button"
        >
          Two Players
        </button>
      </div>
    </div>
  );
}