import { useEffect, useState } from 'react'
import { CartaoResumo } from '../componentes/CartaoResumo'
import { CartaoPrevisao } from '../componentes/CartaoPrevisao'
import { EstadoVazio } from '../componentes/EstadoVazio'
import { useTalhoes } from '../contexto/TalhoesContext'
import { MUNICIPIOS } from '../dados/municipios'
import { descreverTempo } from '../dominio/descricaoTempo'
import { avaliarPulverizacao } from '../dominio/pulverizacao'
import { dataLocalHoje, preverColheita } from '../dominio/talhoes'
import { buscarClima } from '../servicos/clima'
import type { Clima } from '../tipos/clima'
import type { Talhao } from '../tipos/talhao'
import './PaginaPainel.css'

export function PaginaPainel() {
  const { talhoes, operacoes } = useTalhoes()
  const [municipioId, setMunicipioId] = useState(MUNICIPIOS[0].id)
  const [clima, setClima] = useState<Clima | null>(null)
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [tentativa, setTentativa] = useState(0)
  const municipio = MUNICIPIOS.find((item) => item.id === municipioId) ?? MUNICIPIOS[0]

  // Cancela a consulta anterior se o município mudar ou a tela for fechada.
  useEffect(() => {
    const controlador = new AbortController()
    setCarregando(true)
    setErro('')
    setClima(null)

    buscarClima(municipio, controlador.signal)
      .then(setClima)
      .catch((erroConsulta: unknown) => {
        if (erroConsulta instanceof DOMException && erroConsulta.name === 'AbortError') {
          return
        }
        setErro(
          erroConsulta instanceof Error
            ? erroConsulta.message
            : 'Não foi possível carregar o clima.',
        )
      })
      .finally(() => {
        if (!controlador.signal.aborted) setCarregando(false)
      })

    return () => controlador.abort()
  }, [municipio, tentativa])

  const probabilidadeChuva = clima?.previsao.probabilidadeChuva[0]
  const indicador = clima && probabilidadeChuva !== undefined
    ? avaliarPulverizacao({
        vento: clima.atual.vento,
        temperatura: clima.atual.temperatura,
        umidade: clima.atual.umidade,
        precipitacao: clima.atual.precipitacao,
        probabilidadeChuva,
      })
    : null
  const classeIndicador =
      indicador?.nivel === 'Favorável'
        ? 'favoravel'
        : indicador?.nivel === 'Atenção'
          ? 'atencao'
          : 'desfavoravel'
  const talhoesColhidos = new Set(
    operacoes
      .filter((operacao) => operacao.tipo === 'colheita')
      .map((operacao) => operacao.talhaoId),
  )
  const proximasColheitas = talhoes
    .map((talhao) => ({ talhao, data: preverColheita(talhao) }))
    .filter((item): item is { talhao: Talhao; data: string } =>
      item.data !== null &&
      item.data >= dataLocalHoje() &&
      !talhoesColhidos.has(item.talhao.id),
    )
    .sort((a, b) => a.data.localeCompare(b.data))
    .slice(0, 3)
  const areaTotal = talhoes.reduce((total, talhao) => total + talhao.areaHa, 0)

  return (
    <main className="painel">
      <header className="cabecalho">
        <div>
          <p className="sobretitulo">AgroPainel</p>
          <h1>Painel do produtor</h1>
            </div>
        <label className="seletor-municipio">
          Município
          <select
            value={municipioId}
            onChange={(evento) => setMunicipioId(evento.target.value)}
          >
            {MUNICIPIOS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nome}
              </option>
            ))}
          </select>
        </label>
      </header>

      <section className="resumo-safra" aria-labelledby="resumo-safra-titulo">
        <h2 id="resumo-safra-titulo">Resumo da safra</h2>
        <div className="resumo-clima">
          <CartaoResumo titulo="Área total" valor={`${areaTotal.toLocaleString('pt-BR')} ha`} />
          <CartaoResumo titulo="Talhões cadastrados" valor={String(talhoes.length)} />
        </div>
        <h3>Próximas colheitas</h3>
        {proximasColheitas.length === 0 ? (
          <EstadoVazio mensagem="Não há colheitas previstas próximas." />
        ) : (
          <ol className="lista-colheitas">
            {proximasColheitas.map(({ talhao, data }) => (
              <li key={talhao.id}>
                {talhao.nome} — {new Date(`${data}T12:00:00`).toLocaleDateString('pt-BR')}
              </li>
            ))}
          </ol>
        )}
      </section>

      <section aria-labelledby="clima-titulo">
        <h2 id="clima-titulo">Clima em {municipio.nome}</h2>
        {carregando && <p role="status">Carregando clima...</p>}
        {!carregando && erro && (
          <div className="mensagem-erro" role="alert">
            <p>{erro}</p>
            <button type="button" onClick={() => setTentativa((valor) => valor + 1)}>
              Tentar de novo
            </button>
          </div>
        )}
        {!carregando && clima && (
          <>
            <div className="resumo-clima">
              <article className="cartao clima-atual">
                <h3>Agora</h3>
                <p className="temperatura">{clima.atual.temperatura} °C</p>
                <p>{descreverTempo(clima.atual.codigoTempo)}</p>
                <p>Umidade: {clima.atual.umidade}%</p>
                <p>Vento: {clima.atual.vento} km/h</p>
                <p>Chuva: {clima.atual.precipitacao} mm</p>
              </article>

              {indicador ? (
                <article className={`cartao pulverizacao ${classeIndicador}`}>
                  <h3>Pulverização: {indicador.nivel}</h3>
                  {indicador.motivos.length === 0 ? (
                    <p>Condições favoráveis para pulverizar.</p>
                  ) : (
                    <ul>
                      {indicador.motivos.map((motivo) => (
                        <li key={motivo}>{motivo}</li>
                      ))}
                    </ul>
                  )}
                </article>
              ) : (
                <EstadoVazio mensagem="Indicador de pulverização indisponível sem a previsão de chuva." />
              )}
              </div>

            <h2>Previsão de 7 dias</h2>
            <div className="previsao">
              {clima.previsao.data.length === 0 ? (
                <EstadoVazio mensagem="Nenhuma previsão disponível para este município." />
              ) : (
                clima.previsao.data.map((data, indice) => (
                  <CartaoPrevisao
                    key={data}
                    data={data}
                    codigoTempo={clima.previsao.codigoTempo[indice]}
                    temperaturaMinima={clima.previsao.temperaturaMinima[indice]}
                    temperaturaMaxima={clima.previsao.temperaturaMaxima[indice]}
                    probabilidadeChuva={clima.previsao.probabilidadeChuva[indice]}
                  />
                ))
              )}
            </div>
          </>
        )}
      </section>

      <footer>
        Dados meteorológicos:{' '}
        <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">
          Open-Meteo.com
        </a>
      </footer>
    </main>
  )
}
