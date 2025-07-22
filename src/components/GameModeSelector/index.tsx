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