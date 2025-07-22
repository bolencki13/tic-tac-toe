import { createContext } from 'react';
import type { TicTacToe } from '../components/TicTacToe/TicTacToe';

export interface GameContextType {
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

export const GameContext = createContext<GameContextType | undefined>(undefined);