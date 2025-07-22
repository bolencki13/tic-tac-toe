import { TicTacToe } from '../TicTacToe';
import './styles.css';

export namespace GameStyleSelector {
  export type Props = {
    onSelectStyle: (style: TicTacToe.GameStyle) => void;
  }
}

export function GameStyleSelector(props: GameStyleSelector.Props) {
  /**
   * Render
   */
  return (
    <div className="game-style-selector">
      <h2>Select Game Style</h2>
      <div className="style-options">
        <div className="style-option" onClick={() => props.onSelectStyle('classic')}>
          <h3>Classic</h3>
          <p>Traditional tic-tac-toe where pieces stay on the board</p>
        </div>
        <div className="style-option" onClick={() => props.onSelectStyle('limited')}>
          <h3>3-Move Limit</h3>
          <p>Each player can only have 3 pieces on the board at a time</p>
          <div className="style-icon">3</div>
        </div>
      </div>
    </div>
  );
}