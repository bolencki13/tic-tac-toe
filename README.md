# Advanced Tic Tac Toe

A sophisticated Tic Tac Toe implementation featuring adaptive AI, multiple game modes, and a responsive design.

## 🎮 Overview

This project goes far beyond the traditional Tic Tac Toe game by implementing:

- **Adaptive AI** that learns from your play style
- **Multiple game modes** including classic and limited (3-piece) variants
- **Responsive design** that works on all devices
- **Animated SVG** game pieces
- **Persistent game settings** and AI learning data

The hard difficulty AI uses advanced algorithms including Monte Carlo Tree Search, Bayesian Opponent Modeling, and Multi-Armed Bandit approaches to create a challenging and adaptive gameplay experience that improves the more you play against it.

## 📂 Project Structure

The project follows a well-organized React component structure:

```
src/
├── components/         # UI components
│   ├── Confetti/       # Victory celebration effect
│   ├── GameModeSelector/   # Game mode selection UI
│   ├── GameStyleSelector/  # Game style selection UI
│   ├── ScoreBoard/     # Score tracking component
│   ├── SettingsModal/  # Game settings and AI stats modal
│   └── TicTacToe/      # Core game components
│       ├── Board.tsx   # Game board component
│       ├── Square.tsx  # Individual board square
│       ├── Status.tsx  # Game status display
│       ├── TicTacToe.tsx  # Main game component
│       └── WinningLine.tsx # Win highlight animation
├── contexts/           # React contexts
│   ├── GameContext.tsx # Game state management
│   └── GameContextType.ts # Type definitions for context
├── hooks/              # Custom React hooks
│   ├── useGame.ts      # Hook for accessing game context
│   └── useGameState.ts # Hook for game logic and state
├── utils/              # Game logic utilities
│   ├── advancedAI.ts   # Integration of AI algorithms
│   ├── aiOpponent.ts   # Base AI implementation
│   ├── banditStrategies.ts # Multi-armed bandit algorithm
│   ├── bayesianModel.ts # Probabilistic player modeling
│   ├── boardEvaluator.ts # Board state evaluation utilities
│   ├── gameSettings.ts  # Game settings persistence
│   ├── gameTypes.ts     # Type definitions
│   ├── limitedModeAI.ts # AI for limited game mode
│   ├── monteCarlo.ts    # Monte Carlo Tree Search implementation
│   └── persistentLearning.ts # Storage of AI learning data
├── App.tsx             # Main application component
└── main.tsx            # Application entry point
```

## 🛠️ Technology Stack

- **Framework**: React 19.x with TypeScript
- **Build Tool**: Vite 7.x
- **Styling**: Tailwind CSS 4.x
- **State Management**: React Context API
- **Animation**: CSS animations and SVG animations
- **Storage**: localStorage for persistence
- **Development Tools**:
  - ESLint for code quality
  - TypeScript for type safety

## 🎯 Game Modes & Features

### Game Modes

1. **Single Player**:
   - Play against an AI opponent with three difficulty levels
   - AI adapts to your play style in hard mode

2. **Multiplayer**:
   - Local play with two players taking turns
   - Score tracking for multiple games

### Game Styles

1. **Classic**:
   - Traditional Tic Tac Toe rules
   - First player to get three in a row wins
   - Draw when all squares are filled

2. **Limited**:
   - Each player can only have 3 pieces on the board at a time
   - When placing a 4th piece, the oldest piece is removed
   - Creates a more dynamic and strategic gameplay
   - Games can't end in a draw by board filling up

### Features

- **Real-time feedback** on game state and AI thinking
- **Animated game pieces** with smooth transitions
- **Score tracking** across multiple games
- **Responsive design** that works on all device sizes
- **Highlighting** of winning lines
- **Settings modal** for viewing AI learning statistics and game settings

## 🧠 AI Implementation

The game features three difficulty levels in single-player mode:

### Easy Mode
- Makes random moves with basic strategy
- Occasionally misses winning moves and blocks
- Prefers center and corners but doesn't plan ahead

### Medium Mode
- Mixes between random and strategic play
- Uses minimax algorithm occasionally
- Implements basic pattern recognition
- Will block obvious wins and take obvious winning moves

### Hard Mode (Adaptive Learning)
The hard mode AI integrates multiple advanced algorithms:

#### 1. Monte Carlo Tree Search (MCTS)
- Simulates possible future game states to determine optimal moves
- Uses UCB1 formula to balance exploration and exploitation
- Limited by time constraints to ensure reasonable move speed
- Handles the "look-ahead" aspect of gameplay planning

#### 2. Bayesian Opponent Modeling
- Creates a probabilistic model of player behavior
- Tracks conditional probabilities of moves given board states
- Normalizes board states to account for rotational symmetry
- Predicts player's next moves based on observed patterns
- Updates dynamically during gameplay with a learning rate

#### 3. Multi-Armed Bandit Strategy Selection
- Treats different AI strategies as "arms" of a bandit
- Includes 8 different strategies:
  - Minimax: Traditional minimax algorithm
  - MCTS: Monte Carlo Tree Search
  - Bayesian: Uses pattern prediction
  - Aggressive: Focuses on creating winning opportunities
  - Defensive: Focuses on blocking opponent moves
  - Corners: Prioritizes taking corners
  - Center: Prioritizes center then corners
  - Random: For exploration
- Uses Thompson sampling to select strategies
- Continuously updates success rates based on game outcomes
- Adapts to find the most effective approach for each opponent

#### 4. Persistent Learning Database
- Saves learning data between game sessions using localStorage
- Stores:
  - Player move patterns
  - Success rates of different strategies
  - Board state probabilities
- Automatically saves:
  - When the window closes
  - Periodically during play (every 5 minutes)
  - After each game completes
- Can be reset via the settings modal

## 💾 Persistent Storage

The application uses localStorage to persist both game settings and AI learning data:

### Game Settings
- Difficulty level for single player mode
- Stored in a dedicated storage key with versioning
- Automatically loaded when the application starts

### AI Learning Data
- Stored in separate storage keys for different algorithms:
  - Bandit strategy performance data
  - Bayesian model pattern probabilities
  - Last saved timestamp
- Data is automatically:
  - Loaded when the application initializes
  - Saved when a game ends
  - Saved periodically during play
  - Saved when the window is about to close
- Learning data can be visualized in the settings modal
- Option to reset learning data to start fresh

## 🚀 Setup and Development

### Installation

```bash
# Clone the repository
git clone [repository-url]

# Navigate to the project directory
cd hackathon

# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev

# Lint the code
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔮 Future Improvements

Potential enhancements for this project:

1. **Online Multiplayer**: Add WebSocket support for online play
2. **Difficulty Scaling**: Dynamically adjust difficulty based on player skill
3. **Customizable Board Size**: Support for larger board sizes (4x4, 5x5)
4. **Game History**: Track and display history of moves and games
5. **Alternative Game Modes**: Connect Four or other grid-based games
6. **Visual Themes**: Customizable color schemes and piece designs
7. **Sound Effects**: Audio feedback for game actions
8. **Enhanced AI Visualizations**: More detailed insights into AI decision-making
9. **Tournament Mode**: Series of games with overall scoring

---

This project was created as a demonstration of advanced frontend techniques and AI algorithms in a simple game context. It was developed using Claude code in the hopes to get a better understanding of how "vibe coding" works in a real world application. Feel free to explore the code and learn from the implementation!