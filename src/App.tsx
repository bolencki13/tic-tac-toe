
import { useState, useEffect } from 'react';
import { TicTacToe } from './components/TicTacToe';
import { GameModeSelector } from './components/GameModeSelector';
import { ScoreBoard } from './components/ScoreBoard';

function App() {
  /**
   * State vars
   */
  const [gameMode, setGameMode] = useState<TicTacToe.GameMode | null>(null);
  const [difficulty, setDifficulty] = useState<TicTacToe.Difficulty>('medium');
  const [scores, setScores] = useState({
    player1: 0, // X player (human in single mode)
    player2: 0, // O player (AI in single mode)
    ties: 0
  });
  const [previousMode, setPreviousMode] = useState<TicTacToe.GameMode | null>(null);
  
  /**
   * Side effects
   */
  // Reset scores when game mode changes
  useEffect(() => {
    if (gameMode !== null && gameMode !== previousMode) {
      setScores({
        player1: 0,
        player2: 0,
        ties: 0
      });
      setPreviousMode(gameMode);
    }
  }, [gameMode, previousMode]);
  
  /**
   * Helpers
   */
  // Reset game state and go back to mode selection
  const handleReset = () => {
    setGameMode(null);
    // Reset scores when going back to mode selection
    setScores({
      player1: 0,
      player2: 0,
      ties: 0
    });
    // Also reset previousMode to ensure scores will be reset even if the same mode is selected again
    setPreviousMode(null);
  };
  
  // Handle game end and update scores
  const handleGameEnd = (winner: string | null) => {
    if (winner === 'X') {
      setScores(prev => ({
        ...prev,
        player1: prev.player1 + 1
      }));
    } else if (winner === 'O') {
      setScores(prev => ({
        ...prev,
        player2: prev.player2 + 1
      }));
    } else {
      // Draw case
      setScores(prev => ({
        ...prev,
        ties: prev.ties + 1
      }));
    }
  };
  
  // Show difficulty selector for single player mode
  const renderDifficultySelector = () => {
    if (gameMode !== 'single') return null;
    
    return (
      <div className="difficulty-selector">
        <h3>Select Difficulty</h3>
        <div className="difficulty-buttons">
          <button 
            className={`difficulty-button ${difficulty === 'easy' ? 'active' : ''}`}
            onClick={() => setDifficulty('easy')}
          >
            Easy
          </button>
          <button 
            className={`difficulty-button ${difficulty === 'medium' ? 'active' : ''}`}
            onClick={() => setDifficulty('medium')}
          >
            Medium
          </button>
          <button 
            className={`difficulty-button ${difficulty === 'hard' ? 'active' : ''}`}
            onClick={() => setDifficulty('hard')}
          >
            Hard
          </button>
        </div>
      </div>
    );
  };
  
  /**
   * Render
   */
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 gap-6">
      <h1 className="text-3xl font-bold mb-4">Tic Tac Toe</h1>
      
      {!gameMode ? (
        <GameModeSelector onSelectMode={setGameMode} />
      ) : (
        <>
          {renderDifficultySelector()}
          
          {/* Score Board */}
          <ScoreBoard scores={scores} gameMode={gameMode} />
          
          <TicTacToe 
            mode={gameMode} 
            difficulty={difficulty}
            onGameEnd={handleGameEnd} 
          />
          <button 
            className="back-button mt-4"
            onClick={handleReset}
          >
            Back to Mode Selection
          </button>
        </>
      )}
    </div>
  )
}

export default App
