import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { ThemeProvider } from './theme/ThemeProvider'
import '../styles/main.scss'

const root = document.getElementById('root')

if (!root) {
  throw new Error('Élément racine #root introuvable.')
}

createRoot(root).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
