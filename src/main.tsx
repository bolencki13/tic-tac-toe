import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './main.css'
import App from './App.tsx'
import { initializePersistentLearning } from './utils/persistentLearning'

// Initialize the persistent learning system
initializePersistentLearning()

// Create a root and render the app in strict mode
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)