import { useState, type ReactNode, useCallback, useEffect } from 'react';
import type { TicTacToe } from '../components/TicTacToe/TicTacToe';
import { GameContext } from './GameContextType';
import { loadDifficulty, saveDifficulty } from '../utils/gameSettings';

export function GameProvider({ children }: { children: ReactNode }) {
  const [gameMode, setGameModeState] = useState<TicTacToe.GameMode | null>(null);
  const [gameStyle, setGameStyleState] = useState<TicTacToe.GameStyle | null>(null);
  // Load the difficulty from localStorage or use 'medium' as default
  const [difficulty, setDifficultyState] = useState<TicTacToe.Difficulty>(() => loadDifficulty());
  const [scores, setScores] = useState({
    player1: 0, // X player (human in single mode)
    player2: 0, // O player (AI in single mode)
    ties: 0
  });

  // Reset scores when game mode or style changes
  const setGameMode = useCallback((mode: TicTacToe.GameMode | null) => {
    if (mode !== gameMode) {
      setScores({
        player1: 0,
        player2: 0,
        ties: 0
      });
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
  }, [resetScores]);

  // Custom setDifficulty function that also saves to localStorage
  const setDifficulty = useCallback((newDifficulty: TicTacToe.Difficulty) => {
    setDifficultyState(newDifficulty);
    // Only persist the setting for single player mode
    if (gameMode === 'single') {
      saveDifficulty(newDifficulty);
    }
  }, [gameMode]);

  // Effect to save difficulty when gameMode changes to single
  useEffect(() => {
    if (gameMode === 'single') {
      saveDifficulty(difficulty);
    }
  }, [gameMode, difficulty]);

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

