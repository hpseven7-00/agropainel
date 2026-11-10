import './App.css'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { PaginaPainel } from './paginas/PaginaPainel'

// As próximas etapas acrescentarão as rotas de talhões e do relatório.
function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<PaginaPainel />} />
        <Route
          path="*"
          element={
            <main>
              <h1>Página não encontrada</h1>
              <a href="#/">Voltar ao painel</a>
            </main>
          }
        />
      </Routes>
    </HashRouter>
  )
}

export default App
