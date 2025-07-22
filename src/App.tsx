import { lazy, Suspense } from 'react';
import { GameProvider } from './contexts/GameContext';
import { useGame } from './hooks/useGame';

// Lazy-loaded components
const TicTacToe = lazy(() => import('./components/TicTacToe').then(module => ({ default: module.TicTacToe })));
const GameModeSelector = lazy(() => import('./components/GameModeSelector').then(module => ({ default: module.GameModeSelector })));
const GameStyleSelector = lazy(() => import('./components/GameStyleSelector').then(module => ({ default: module.GameStyleSelector })));
const ScoreBoard = lazy(() => import('./components/ScoreBoard').then(module => ({ default: module.ScoreBoard })));

function GameApp() {
  const { 
    gameMode, 
    gameStyle, 
    difficulty, 
    scores,
    setGameMode, 
    setGameStyle, 
    setDifficulty,
    handleGameEnd,
    resetGame
  } = useGame();
  
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
      
      <Suspense fallback={<div>Loading...</div>}>
        {!gameMode ? (
          <GameModeSelector onSelectMode={setGameMode} />
        ) : !gameStyle ? (
          <>
            <GameStyleSelector onSelectStyle={setGameStyle} />
            <button 
              className="back-button mt-4"
              onClick={resetGame}
            >
              Back to Mode Selection
            </button>
          </>
        ) : (
          <>
            {renderDifficultySelector()}
            
            {/* Score Board */}
            <ScoreBoard scores={scores} gameMode={gameMode} />
            
            <TicTacToe 
              mode={gameMode} 
              style={gameStyle}
              difficulty={difficulty}
              onGameEnd={handleGameEnd} 
            />
            <button 
              className="back-button mt-4"
              onClick={() => setGameStyle(null)}
            >
              Change Game Style
            </button>
            <button 
              className="back-button mt-2"
              onClick={resetGame}
            >
              Back to Mode Selection
            </button>
          </>
        )}
      </Suspense>
    </div>
  );
}

function App() {
  return (
    <GameProvider>
      <GameApp />
    </GameProvider>
  );
}

export default App;