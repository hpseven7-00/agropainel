import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

// Ponto de entrada: conecta o componente principal ao elemento #root do HTML.
const root = document.getElementById('root')

if (!root) {
  throw new Error('Elemento #root não encontrado no HTML.')
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
