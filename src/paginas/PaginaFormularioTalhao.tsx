import { useParams } from 'react-router-dom'
import { FormularioTalhao } from '../componentes/FormularioTalhao'
import { LinkRetorno } from '../componentes/LinkRetorno'
import { useTalhoes } from '../contexto/TalhoesContext'
import './Talhoes.css'

export function PaginaNovoTalhao() {
  return <FormularioTalhao />
}

export function PaginaEditarTalhao() {
  const { id } = useParams()
  const { talhoes } = useTalhoes()
  const talhao = talhoes.find((item) => item.id === id)

  if (!talhao) {
    return (
      <main className="pagina-talhao">
        <h1>Talhão não encontrado</h1>
        <LinkRetorno destino="/talhoes" texto="Voltar aos talhões" />
      </main>
    )
  }

  return <FormularioTalhao key={talhao.id} talhao={talhao} />
}
