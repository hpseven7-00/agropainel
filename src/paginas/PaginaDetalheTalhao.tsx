import { Link, useParams } from 'react-router-dom'
import { CabecalhoPagina } from '../componentes/CabecalhoPagina'
import { EstadoVazio } from '../componentes/EstadoVazio'
import { EtiquetaSituacao } from '../componentes/EtiquetaSituacao'
import { FormularioOperacao } from '../componentes/FormularioOperacao'
import { LinkRetorno } from '../componentes/LinkRetorno'
import { MUNICIPIOS } from '../dados/municipios'
import { useTalhoes } from '../contexto/TalhoesContext'
import { diasDesdePlantio, nomeCultura, preverColheita, situacaoTalhao } from '../dominio/talhoes'
import { producaoEmSacas, TIPOS_OPERACAO } from '../dominio/operacoes'
import './Talhoes.css'

export function PaginaDetalheTalhao() {
  const { id } = useParams()
  const { talhoes, operacoes } = useTalhoes()
  const talhao = talhoes.find((item) => item.id === id)

  if (!talhao) {
    return (
      <main className="pagina-talhao">
        <h1>Talhão não encontrado</h1>
        <Link to="/talhoes">Voltar aos talhões</Link>
      </main>
    )
  }

  const municipio = MUNICIPIOS.find((item) => item.id === talhao.municipioId)
  const previsao = preverColheita(talhao)
  const operacoesDoTalhao = operacoes
    .filter((operacao) => operacao.talhaoId === talhao.id)
    .sort((a, b) => a.data.localeCompare(b.data))
  const moeda = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })

  return (
    <main className="pagina-talhao">
      <LinkRetorno destino="/talhoes" texto="Voltar aos talhões" />
      <CabecalhoPagina titulo={talhao.nome} subtitulo="Detalhe do talhão">
        <Link className="botao-link" to={`/talhoes/${talhao.id}/editar`}>Editar</Link>
      </CabecalhoPagina>

      <section className="cartao-talhao">
        <p><strong>Cultura:</strong> {nomeCultura(talhao.cultura)}</p>
        <p><strong>Área:</strong> {talhao.areaHa} ha</p>
        <p><strong>Município:</strong> {municipio?.nome ?? 'Não informado'}</p>
        <p>
          <strong>Situação:</strong>{' '}
          <EtiquetaSituacao situacao={situacaoTalhao(talhao, undefined, operacoes)} />
        </p>
        <p>
          <strong>Plantio:</strong>{' '}
          {talhao.dataPlantio
            ? `${new Date(`${talhao.dataPlantio}T12:00:00`).toLocaleDateString('pt-BR')} (${diasDesdePlantio(talhao.dataPlantio)} dias)`
            : 'Ainda não plantado'}
        </p>
        <p>
          <strong>Previsão de colheita:</strong>{' '}
          {previsao
            ? new Date(`${previsao}T12:00:00`).toLocaleDateString('pt-BR')
            : 'Sem previsão'}
        </p>
      </section>

      <section className="secao-operacoes" aria-labelledby="diario-titulo">
        <h2 id="diario-titulo">Diário de operações</h2>
        {operacoesDoTalhao.length === 0 ? (
          <EstadoVazio mensagem="Nenhuma operação registrada." />
        ) : (
          <ol className="lista-operacoes">
            {operacoesDoTalhao.map((operacao) => {
              const tipo = TIPOS_OPERACAO.find((item) => item.id === operacao.tipo)
              return (
                <li className="cartao-talhao" key={operacao.id}>
                  <strong>{new Date(`${operacao.data}T12:00:00`).toLocaleDateString('pt-BR')} · {tipo?.nome}</strong>
                  <p>{operacao.descricao}</p>
                  <p>Custo: {moeda.format(operacao.custoCentavos / 100)}</p>
                  {operacao.tipo === 'colheita' && (
                    <p>
                      Produção: {producaoEmSacas(talhao, operacao).toLocaleString('pt-BR')} sacas
                    </p>
                  )}
                </li>
              )
            })}
          </ol>
        )}
      </section>

      <section className="secao-operacoes" aria-labelledby="nova-operacao-titulo">
        <h2 id="nova-operacao-titulo">Registrar operação</h2>
        <FormularioOperacao talhao={talhao} />
      </section>
    </main>
  )
}
