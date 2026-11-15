import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CabecalhoPagina } from '../componentes/CabecalhoPagina'
import { EstadoVazio } from '../componentes/EstadoVazio'
import { EtiquetaSituacao } from '../componentes/EtiquetaSituacao'
import { useTalhoes } from '../contexto/TalhoesContext'
import {
  CULTURAS,
  nomeCultura,
  preverColheita,
  situacaoTalhao,
} from '../dominio/talhoes'
import type { SituacaoTalhao } from '../tipos/talhao'
import './Talhoes.css'

const SITUACOES: SituacaoTalhao[] = [
  'Colhido',
  'Aguardando plantio',
  'Em desenvolvimento',
  'Colheita próxima',
  'Ponto de colheita',
]

export function PaginaTalhoes() {
  const { talhoes, operacoes } = useTalhoes()
  const [busca, setBusca] = useState('')
  const [cultura, setCultura] = useState('')
  const [situacao, setSituacao] = useState('')

  const termo = busca.trim().toLocaleLowerCase('pt-BR')
  const filtrados = talhoes.filter((talhao) => {
    const nomeCorresponde = talhao.nome.toLocaleLowerCase('pt-BR').includes(termo)
    const culturaCorresponde = !cultura || talhao.cultura === cultura
    const situacaoCorresponde =
      !situacao || situacaoTalhao(talhao, undefined, operacoes) === situacao
    return nomeCorresponde && culturaCorresponde && situacaoCorresponde
  })

  return (
    <main className="pagina-talhao">
      <CabecalhoPagina titulo="Talhões">
        <Link className="botao-link" to="/talhoes/novo">Novo talhão</Link>
      </CabecalhoPagina>

      <section className="filtros-talhao" aria-label="Filtros de talhões">
        <label>
          Buscar pelo nome
          <input value={busca} onChange={(evento) => setBusca(evento.target.value)} />
        </label>
        <label>
          Cultura
          <select value={cultura} onChange={(evento) => setCultura(evento.target.value)}>
            <option value="">Todas</option>
            {CULTURAS.map((item) => (
              <option key={item.id} value={item.id}>{item.nome}</option>
            ))}
          </select>
        </label>
        <label>
          Situação
          <select value={situacao} onChange={(evento) => setSituacao(evento.target.value)}>
            <option value="">Todas</option>
            {SITUACOES.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
      </section>

      {filtrados.length === 0 ? (
        <EstadoVazio
          mensagem={
            talhoes.length === 0
              ? 'Nenhum talhão cadastrado.'
              : 'Nenhum talhão corresponde aos filtros.'
          }
        />
      ) : (
        <section className="lista-talhoes" aria-label="Talhões cadastrados">
          {filtrados.map((talhao) => (
            <article className="cartao-talhao" key={talhao.id}>
              <h2><Link to={`/talhoes/${talhao.id}`}>{talhao.nome}</Link></h2>
              <p>{nomeCultura(talhao.cultura)} · {talhao.areaHa} ha</p>
              <p><EtiquetaSituacao situacao={situacaoTalhao(talhao, undefined, operacoes)} /></p>
              <p>
                Colheita prevista:{' '}
                {preverColheita(talhao)
                  ? new Date(`${preverColheita(talhao)}T12:00:00`).toLocaleDateString('pt-BR')
                  : 'Sem previsão'}
              </p>
            </article>
          ))}
        </section>
      )}
    </main>
  )
}
