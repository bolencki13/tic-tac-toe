/**
 * Persistent Learning Database for Tic Tac Toe AI
 * 
 * This module implements a persistent storage system for the AI's learning data,
 * allowing it to remember and improve across game sessions.
 */
import { getBanditStats, resetBandit } from './banditStrategies';
import { getBayesianStats, resetBayesianModel } from './bayesianModel';

// Storage keys
const STORAGE_KEY_PREFIX = 'tictactoe_ai_';
const BANDIT_STORAGE_KEY = `${STORAGE_KEY_PREFIX}bandit`;
const BAYESIAN_STORAGE_KEY = `${STORAGE_KEY_PREFIX}bayesian`;
const LEARNING_VERSION = '1.0.0'; // Version to handle data format changes

// Interface for persistable state
interface PersistableState {
  version: string;
  timestamp: number;
  banditData: unknown;
  bayesianData: unknown;
}

/**
 * Save the current learning state to localStorage
 */
export function saveLearnedData(): boolean {
  try {
    // Get current data from the learning systems
    const banditData = getBanditStats();
    const bayesianData = getBayesianStats();
    
    // Create persistent state object
    const stateToSave: PersistableState = {
      version: LEARNING_VERSION,
      timestamp: Date.now(),
      banditData,
      bayesianData
    };
    
    // Save to localStorage
    localStorage.setItem(
      BANDIT_STORAGE_KEY, 
      JSON.stringify(stateToSave.banditData)
    );
    localStorage.setItem(
      BAYESIAN_STORAGE_KEY, 
      JSON.stringify(stateToSave.bayesianData)
    );
    
    console.log('AI learning data saved successfully');
    return true;
  } catch (error) {
    console.error('Error saving AI learning data:', error);
    return false;
  }
}

/**
 * Load learned data from localStorage
 */
export function loadLearnedData(): boolean {
  try {
    // Check if we have data in storage
    const banditDataStr = localStorage.getItem(BANDIT_STORAGE_KEY);
    const bayesianDataStr = localStorage.getItem(BAYESIAN_STORAGE_KEY);
    
    if (!banditDataStr || !bayesianDataStr) {
      console.log('No previous learning data found');
      return false;
    }
    
    // Parse the data
    try {
      const parsedBanditData = JSON.parse(banditDataStr);
      const parsedBayesianData = JSON.parse(bayesianDataStr);
      
      // Import functions dynamically to avoid circular dependencies
      import('./banditStrategies').then(banditModule => {
        if (typeof banditModule.loadBanditState === 'function') {
          banditModule.loadBanditState(parsedBanditData);
        }
      });
      
      import('./bayesianModel').then(bayesianModule => {
        if (typeof bayesianModule.loadBayesianState === 'function') {
          bayesianModule.loadBayesianState(parsedBayesianData);
        }
      });
      
      console.log('AI learning data loaded successfully');
      return true;
    } catch (parseError) {
      console.error('Error parsing stored AI data:', parseError);
      // If parsing fails, remove the corrupted data
      localStorage.removeItem(BANDIT_STORAGE_KEY);
      localStorage.removeItem(BAYESIAN_STORAGE_KEY);
      return false;
    }
  } catch (error) {
    console.error('Error loading AI learning data:', error);
    return false;
  }
}

/**
 * Reset all learned data
 */
export function resetLearnedData(): void {
  // Clear localStorage
  localStorage.removeItem(BANDIT_STORAGE_KEY);
  localStorage.removeItem(BAYESIAN_STORAGE_KEY);
  
  // Reset the learning systems
  resetBandit();
  resetBayesianModel();
  
  console.log('AI learning data reset successfully');
}

/**
 * Get statistics about the learning data
 */
export interface LearningStats {
  bandit: unknown;
  bayesian: unknown;
  persistence: {
    hasSavedBanditData: boolean;
    hasSavedBayesianData: boolean;
    lastSavedTimestamp: number | null;
    error?: string;
  };
}

export function getLearningStats(): LearningStats {
  const banditStats = getBanditStats();
  const bayesianStats = getBayesianStats();
  
  // Check if we have data in storage
  let persistenceInfo;
  try {
    const banditDataStr = localStorage.getItem(BANDIT_STORAGE_KEY);
    const bayesianDataStr = localStorage.getItem(BAYESIAN_STORAGE_KEY);
    
    persistenceInfo = {
      hasSavedBanditData: !!banditDataStr,
      hasSavedBayesianData: !!bayesianDataStr,
      lastSavedTimestamp: banditDataStr 
        ? JSON.parse(banditDataStr).timestamp || null 
        : null
    };
  } catch (error) {
    persistenceInfo = {
      hasSavedBanditData: false,
      hasSavedBayesianData: false,
      lastSavedTimestamp: null,
      error: error.message
    };
  }
  
  return {
    bandit: banditStats,
    bayesian: bayesianStats,
    persistence: persistenceInfo
  };
}

/**
 * Auto-save learning data periodically or when the window is about to unload
 */
export function initializeAutosave(): void {
  // Save data when the window is about to unload
  window.addEventListener('beforeunload', () => {
    saveLearnedData();
  });
  
  // Save data periodically (every 5 minutes)
  setInterval(() => {
    saveLearnedData();
  }, 5 * 60 * 1000);
  
  // Attempt to load any existing data
  loadLearnedData();
}

/**
 * Initialize the persistent learning system
 * This should be called once when the application starts
 */
export function initializePersistentLearning(): void {
  // Try to load existing data
  const dataLoaded = loadLearnedData();
  
  // If no data was loaded, initialize with default data
  if (!dataLoaded) {
    console.log('Initializing AI with default learning data');
    // Default initialization is handled by the respective modules
  }
  
  // Set up autosave
  initializeAutosave();
}