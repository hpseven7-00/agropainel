import { Link } from 'react-router-dom'
import { CabecalhoPagina } from '../componentes/CabecalhoPagina'
import { CartaoResumo } from '../componentes/CartaoResumo'
import { EstadoVazio } from '../componentes/EstadoVazio'
import { useTalhoes } from '../contexto/TalhoesContext'
import { nomeCultura } from '../dominio/talhoes'
import { resumirSafra } from '../dominio/relatorio'
import './Talhoes.css'

export function PaginaRelatorio() {
  const { talhoes, operacoes } = useTalhoes()
  const resumo = resumirSafra(talhoes, operacoes)
  const moeda = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })

  return (
    <main className="pagina-talhao">
      <CabecalhoPagina titulo="Relatório da safra" />

      <section className="resumo-relatorio" aria-label="Resumo da safra">
        <CartaoResumo
          titulo="Custo total"
          valor={moeda.format(resumo.custoTotalCentavos / 100)}
        />
        <CartaoResumo
          titulo="Produção colhida"
          valor={`${resumo.producaoTotalSacas.toLocaleString('pt-BR')} sacas`}
        />
      </section>

      <section className="secao-operacoes" aria-labelledby="area-cultura">
        <h2 id="area-cultura">Área por cultura</h2>
        <ul className="lista-relatorio">
          {resumo.areaPorCultura.map((item) => (
            <li key={item.cultura}>
              {item.cultura}: {item.areaHa.toLocaleString('pt-BR')} ha
            </li>
          ))}
        </ul>
      </section>

      <section className="secao-operacoes" aria-labelledby="custos-talhoes">
        <h2 id="custos-talhoes">Custo por hectare</h2>
        {talhoes.length === 0 ? (
          <EstadoVazio mensagem="Nenhum talhão cadastrado." />
        ) : (
          <ul className="lista-relatorio">
            {resumo.custoPorTalhao.map((item) => {
              const talhao = talhoes.find((registro) => registro.id === item.talhaoId)
              if (!talhao) return null
              return (
                <li key={item.talhaoId}>
                  <Link to={`/talhoes/${talhao.id}`}>{talhao.nome}</Link>
                  {' · '}{nomeCultura(talhao.cultura)} · {talhao.areaHa} ha ·{' '}
                  {moeda.format(item.custoPorHectareCentavos / 100)}/ha
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </main>
  )
}
