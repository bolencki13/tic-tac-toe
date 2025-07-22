There are a few learning algorithm that are used for the hard mode.

1. Monte Carlo Tree Search (MCTS) Implementation

- Create a MCTS algorithm that can look several moves ahead
- Implement exploration-exploitation balancing with UCB1 formula
- Add time constraints to ensure reasonable move speed
- Integrate with existing pattern database for better initial search focus

2. Bayesian Opponent Modeling

- Develop a probabilistic model to predict player's next moves
- Track conditional probabilities of moves given board states
- Update model dynamically during gameplay
- Use this to inform the MCTS search priorities

3. Multi-Armed Bandit Strategy Selection

- Implement a strategy selector that treats different approaches as "arms"
- Include strategies like "aggressive", "defensive", "control center", etc.
- Use Thompson sampling to choose the most effective strategy against the current player
- Continuously update success rates to adapt to changing player styles

4. Persistent Learning Database

- Create a database that persists between games/sessions
- Store player patterns, success rates of different counter-strategies
- Develop a serialization/deserialization system for saving learning progress
- Implement a weighting system that prioritizes recent games
