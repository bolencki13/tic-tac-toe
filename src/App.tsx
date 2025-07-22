
import { useState } from 'react';
import { TicTacToe } from './components/TicTacToe';
import { GameModeSelector } from './components/GameModeSelector';

function App() {
  const [gameMode, setGameMode] = useState<TicTacToe.GameMode | null>(null);
  const [difficulty, setDifficulty] = useState<TicTacToe.Difficulty>('medium');
  
  // Reset game state
  const handleReset = () => {
    setGameMode(null);
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
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 gap-6">
      <h1 className="text-3xl font-bold mb-4">Tic Tac Toe</h1>
      
      {!gameMode ? (
        <GameModeSelector onSelectMode={setGameMode} />
      ) : (
        <>
          {renderDifficultySelector()}
          <TicTacToe 
            mode={gameMode} 
            difficulty={difficulty}
            onGameEnd={() => {
              // You can add game-end logic here if needed
            }} 
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
