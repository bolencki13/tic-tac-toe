/**
 * Game Settings Persistence
 * 
 * This module handles saving and loading game settings to/from localStorage
 * to persist user preferences across sessions.
 */
import type { TicTacToe } from '../components/TicTacToe/TicTacToe';

// Storage keys
const STORAGE_KEY_PREFIX = 'tictactoe_settings_';
const DIFFICULTY_STORAGE_KEY = `${STORAGE_KEY_PREFIX}difficulty`;
const SETTINGS_VERSION = '1.0.0';

interface StoredSettings {
  version: string;
  timestamp: number;
  difficulty: TicTacToe.Difficulty;
}

/**
 * Save the current difficulty setting to localStorage
 */
export function saveDifficulty(difficulty: TicTacToe.Difficulty): boolean {
  try {
    const settingsToSave: StoredSettings = {
      version: SETTINGS_VERSION,
      timestamp: Date.now(),
      difficulty
    };
    
    // Save to localStorage
    localStorage.setItem(
      DIFFICULTY_STORAGE_KEY,
      JSON.stringify(settingsToSave)
    );
    
    return true;
  } catch (error) {
    console.error('Error saving difficulty setting:', error);
    return false;
  }
}

/**
 * Load difficulty setting from localStorage
 * Returns the default difficulty ('medium') if no saved setting exists
 */
export function loadDifficulty(): TicTacToe.Difficulty {
  try {
    const settingsStr = localStorage.getItem(DIFFICULTY_STORAGE_KEY);
    
    if (!settingsStr) {
      return 'medium'; // Default difficulty
    }
    
    const settings: StoredSettings = JSON.parse(settingsStr);
    
    if (!settings || !settings.difficulty) {
      return 'medium';
    }
    
    // Validate the difficulty value
    if (['easy', 'medium', 'hard'].includes(settings.difficulty)) {
      return settings.difficulty as TicTacToe.Difficulty;
    }
    
    return 'medium';
  } catch (error) {
    console.error('Error loading difficulty setting:', error);
    return 'medium';
  }
}

/**
 * Clear all saved game settings
 */
export function clearGameSettings(): void {
  try {
    localStorage.removeItem(DIFFICULTY_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing game settings:', error);
  }
}