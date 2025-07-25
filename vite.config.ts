import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: "/tic-tac-toe",
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          game: ['./src/components/TicTacToe'],
          utils: ['./src/utils/aiOpponent'],
          ui: ['./src/components/GameModeSelector', './src/components/GameStyleSelector', './src/components/ScoreBoard']
        }
      }
    },
    sourcemap: true,
  }
})
