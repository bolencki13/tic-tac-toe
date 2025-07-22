import { useState, useEffect } from 'react';
import { getLearningStats, resetLearnedData } from '../../utils/persistentLearning';
import type { LearningStats } from '../../utils/persistentLearning';
import type { TicTacToe } from '../../components/TicTacToe/TicTacToe';
import type { BanditStats } from '../../utils/banditStrategies';
import type { BayesianStats } from '../../utils/bayesianModel';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  difficulty?: TicTacToe.Difficulty;
  setDifficulty?: (difficulty: TicTacToe.Difficulty) => void;
  gameMode: TicTacToe.GameMode;
}

export function SettingsModal({ isOpen, onClose, difficulty, setDifficulty, gameMode }: SettingsModalProps) {
  const [stats, setStats] = useState<LearningStats | null>(null);
  const [resetting, setResetting] = useState(false);

  // Load stats when modal opens
  useEffect(() => {
    if (isOpen) {
      setStats(getLearningStats());
    }
  }, [isOpen]);

  // Handle resetting AI learning data
  const handleReset = () => {
    setResetting(true);
    
    // Add a small delay for UX feedback
    setTimeout(() => {
      resetLearnedData();
      setStats(getLearningStats());
      setResetting(false);
    }, 300);
  };

  if (!isOpen) return null;

  // Format date from timestamp
  const formatTimestamp = (timestamp: number | null) => {
    if (!timestamp) return 'Never';
    return new Date(timestamp).toLocaleString();
  };

  // Render bandit strategy statistics
  const renderBanditStats = () => {
    if (!stats || !stats.bandit) return null;
    
    const banditStats = stats.bandit as BanditStats; // Type assertion for the bandit stats
    
    if (!banditStats.strategies || !Array.isArray(banditStats.strategies)) {
      return <p>No strategy data available</p>;
    }
    
    return (
      <div className="stats-section">
        <h3>Strategy Performance</h3>
        <div className="stats-table-container">
          <table className="stats-table">
            <thead>
              <tr>
                <th>Strategy</th>
                <th>Win Rate</th>
                <th>Wins</th>
                <th>Losses</th>
                <th>Draws</th>
              </tr>
            </thead>
            <tbody>
              {banditStats.strategies.map((strategy) => (
                <tr key={strategy.name}>
                  <td>{strategy.name}</td>
                  <td>{(strategy.winRate * 100).toFixed(1)}%</td>
                  <td>{strategy.wins}</td>
                  <td>{strategy.losses}</td>
                  <td>{strategy.draws}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="stats-note">
          Current strategy: {banditStats.currentStrategy || 'None'}
        </p>
      </div>
    );
  };

  // Render bayesian model statistics
  const renderBayesianStats = () => {
    if (!stats || !stats.bayesian) return null;
    
    const bayesianStats = stats.bayesian as BayesianStats; // Type assertion for the bayesian stats
    
    if (!bayesianStats.totalPatterns || bayesianStats.totalPatterns <= 0) {
      return <p>No pattern data available</p>;
    }
    
    return (
      <div className="stats-section">
        <h3>Pattern Recognition</h3>
        <p>
          Total patterns learned: <strong>{bayesianStats.totalPatterns}</strong>
        </p>
        {bayesianStats.patternDetails && bayesianStats.patternDetails.length > 0 && (
          <div className="pattern-preview">
            <h4>Top Patterns:</h4>
            <ul className="pattern-list">
              {bayesianStats.patternDetails.slice(0, 3).map((pattern, idx: number) => (
                <li key={idx}>
                  <div className="mini-board">
                    {pattern.boardState.split('').map((cell: string, i: number) => (
                      <div key={i} className="mini-cell">
                        {cell !== '-' ? cell : ''}
                      </div>
                    ))}
                  </div>
                  <div className="pattern-info">
                    <span>Observations: {pattern.observations}</span>
                    {pattern.probabilities && pattern.probabilities.length > 0 && (
                      <span>
                        Predicted: {pattern.probabilities[0].move} 
                        ({(pattern.probabilities[0].probability * 100).toFixed(0)}%)
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  // Render persistence information
  const renderPersistenceInfo = () => {
    if (!stats) return null;
    
    return (
      <div className="stats-section">
        <h3>Data Persistence</h3>
        <p>
          Last saved: <strong>{formatTimestamp(stats.persistence.lastSavedTimestamp)}</strong>
        </p>
        <p>
          Bandit data: <strong>{stats.persistence.hasSavedBanditData ? 'Saved' : 'Not Saved'}</strong>
        </p>
        <p>
          Pattern data: <strong>{stats.persistence.hasSavedBayesianData ? 'Saved' : 'Not Saved'}</strong>
        </p>
        {stats.persistence.error && (
          <p className="error-text">Error: {stats.persistence.error}</p>
        )}
      </div>
    );
  };
  
  // Render difficulty selector
  const renderDifficultySelector = () => {
    if (gameMode !== 'single' || !setDifficulty || !difficulty) return null;
    
    return (
      <div className="stats-section">
        <h3>Game Difficulty</h3>
        <p>Select the AI opponent difficulty level:</p>
        <div className="difficulty-buttons modal-difficulty-buttons">
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
        {difficulty === 'hard' && (
          <p className="settings-note">
            Hard mode enables AI learning to adapt to your play style.
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{difficulty === 'hard' ? 'Game & AI Learning Settings' : 'Game Settings'}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          {/* Difficulty selector appears first and for any difficulty */}
          {renderDifficultySelector()}
          
          {/* AI learning settings only shown for hard difficulty */}
          {difficulty === 'hard' && (
            <>
              <div className="settings-description">
                <p>
                  In Hard mode, the AI uses advanced algorithms to learn from your play style
                  and adapt its strategy to counter your moves more effectively over time.
                </p>
              </div>
              
              <div className="stats-container">
                {renderBanditStats()}
                {renderBayesianStats()}
                {renderPersistenceInfo()}
              </div>
              
              <div className="reset-section">
                <h3>Reset Learning Data</h3>
                <p>
                  This will reset all AI learning data and start fresh. This cannot be undone.
                </p>
                <button 
                  className={`reset-button ${resetting ? 'resetting' : ''}`}
                  onClick={handleReset}
                  disabled={resetting}
                >
                  {resetting ? 'Resetting...' : 'Reset AI Learning'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default { SettingsModal };