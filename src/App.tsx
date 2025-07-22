import { lazy, Suspense, useState } from 'react';
import { GameProvider } from './contexts/GameContext';
import { useGame } from './hooks/useGame';
import './components/SettingsModal/styles.css';

// Lazy-loaded components
const TicTacToe = lazy(() => import('./components/TicTacToe').then(module => ({ default: module.TicTacToe })));
const GameModeSelector = lazy(() => import('./components/GameModeSelector').then(module => ({ default: module.GameModeSelector })));
const GameStyleSelector = lazy(() => import('./components/GameStyleSelector').then(module => ({ default: module.GameStyleSelector })));
const ScoreBoard = lazy(() => import('./components/ScoreBoard').then(module => ({ default: module.ScoreBoard })));
const SettingsModal = lazy(() => import('./components/SettingsModal').then(module => ({ default: module.SettingsModal })));

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
  
  const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
  
  // No more difficulty selector in the main UI - moved to the settings modal
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 gap-6 max-w-[800px] mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-center">Tic Tac Toe</h1>
      
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
            {/* Score Board */}
            <ScoreBoard scores={scores} gameMode={gameMode} />
            
            <TicTacToe 
              mode={gameMode} 
              style={gameStyle}
              difficulty={difficulty}
              onGameEnd={handleGameEnd} 
            />
            
            {/* Settings button (visible in single player mode) */}
            {gameMode === 'single' && (
              <button 
                className="back-button mt-4"
                onClick={() => setSettingsModalOpen(true)}
              >
                Game Settings
              </button>
            )}
            
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
            
            {/* Settings Modal */}
            <Suspense fallback={<div>Loading...</div>}>
              <SettingsModal 
                isOpen={isSettingsModalOpen} 
                onClose={() => setSettingsModalOpen(false)}
                difficulty={difficulty}
                setDifficulty={setDifficulty}
                gameMode={gameMode}
              />
            </Suspense>
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