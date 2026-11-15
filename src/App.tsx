import './App.css'
import { HashRouter, Link, Route, Routes } from 'react-router-dom'
import { TalhoesProvider } from './contexto/TalhoesContext'
import { PaginaDetalheTalhao } from './paginas/PaginaDetalheTalhao'
import {
  PaginaEditarTalhao,
  PaginaNovoTalhao,
} from './paginas/PaginaFormularioTalhao'
import { PaginaPainel } from './paginas/PaginaPainel'
import { PaginaRelatorio } from './paginas/PaginaRelatorio'
import { PaginaTalhoes } from './paginas/PaginaTalhoes'

function App() {
  return (
    <HashRouter>
      <TalhoesProvider>
        <nav className="navegacao" aria-label="Navegação principal">
          <Link to="/">Painel</Link>
          <Link to="/talhoes">Talhões</Link>
          <Link to="/relatorio">Relatório</Link>
        </nav>
        <Routes>
          <Route path="/" element={<PaginaPainel />} />
          <Route path="/talhoes" element={<PaginaTalhoes />} />
          <Route path="/talhoes/novo" element={<PaginaNovoTalhao />} />
          <Route path="/talhoes/:id" element={<PaginaDetalheTalhao />} />
          <Route path="/talhoes/:id/editar" element={<PaginaEditarTalhao />} />
          <Route path="/relatorio" element={<PaginaRelatorio />} />
          <Route
            path="*"
            element={
              <main>
                <h1>Página não encontrada</h1>
                <Link to="/">Voltar ao painel</Link>
              </main>
            }
          />
        </Routes>
      </TalhoesProvider>
    </HashRouter>
  )
}

export default App
