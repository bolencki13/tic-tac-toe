import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { TicTacToe } from '../components/TicTacToe';

interface GameContextType {
  scores: {
    player1: number;
    player2: number;
    ties: number;
  };
  gameMode: TicTacToe.GameMode | null;
  gameStyle: TicTacToe.GameStyle | null;
  difficulty: TicTacToe.Difficulty;
  setGameMode: (mode: TicTacToe.GameMode | null) => void;
  setGameStyle: (style: TicTacToe.GameStyle | null) => void;
  setDifficulty: (difficulty: TicTacToe.Difficulty) => void;
  handleGameEnd: (winner: string | null) => void;
  resetScores: () => void;
  resetGame: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [gameMode, setGameModeState] = useState<TicTacToe.GameMode | null>(null);
  const [gameStyle, setGameStyleState] = useState<TicTacToe.GameStyle | null>(null);
  const [difficulty, setDifficulty] = useState<TicTacToe.Difficulty>('medium');
  const [scores, setScores] = useState({
    player1: 0, // X player (human in single mode)
    player2: 0, // O player (AI in single mode)
    ties: 0
  });
  const [previousMode, setPreviousMode] = useState<TicTacToe.GameMode | null>(null);
  const [previousStyle, setPreviousStyle] = useState<TicTacToe.GameStyle | null>(null);
  
  // Reset scores when game mode or style changes
  const setGameMode = useCallback((mode: TicTacToe.GameMode | null) => {
    if (mode !== gameMode) {
      setScores({
        player1: 0,
        player2: 0,
        ties: 0
      });
      setPreviousMode(mode);
    }
    setGameModeState(mode);
  }, [gameMode]);
  
  const setGameStyle = useCallback((style: TicTacToe.GameStyle | null) => {
    if (style !== gameStyle) {
      setScores({
        player1: 0,
        player2: 0,
        ties: 0
      });
      setPreviousStyle(style);
    }
    setGameStyleState(style);
  }, [gameStyle]);
  
  // Handle game end and update scores
  const handleGameEnd = useCallback((winner: string | null) => {
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
  }, []);
  
  // Reset scores
  const resetScores = useCallback(() => {
    setScores({
      player1: 0,
      player2: 0,
      ties: 0
    });
  }, []);
  
  // Reset game state
  const resetGame = useCallback(() => {
    setGameModeState(null);
    setGameStyleState(null);
    resetScores();
    setPreviousMode(null);
    setPreviousStyle(null);
  }, [resetScores]);
  
  const value = {
    scores,
    gameMode,
    gameStyle,
    difficulty,
    setGameMode,
    setGameStyle,
    setDifficulty,
    handleGameEnd,
    resetScores,
    resetGame
  };
  
  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}