import { useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { LinkRetorno } from './LinkRetorno'
import { MUNICIPIOS } from '../dados/municipios'
import { dataLocalHoje, CULTURAS, validarTalhao } from '../dominio/talhoes'
import { useTalhoes } from '../contexto/TalhoesContext'
import type { CamposTalhao, ErrosTalhao, Talhao } from '../tipos/talhao'

interface FormularioTalhaoProps {
  talhao?: Talhao
}

type CampoFormulario = keyof CamposTalhao
type ValoresFormulario = Omit<CamposTalhao, 'dataPlantio'> & { dataPlantio: string }

function valoresIniciais(talhao?: Talhao): ValoresFormulario {
  return {
    nome: talhao?.nome ?? '',
    cultura: talhao?.cultura ?? 'soja',
    areaHa: talhao ? String(talhao.areaHa) : '',
    municipioId: talhao?.municipioId ?? MUNICIPIOS[0].id,
    dataPlantio: talhao?.dataPlantio ?? '',
  }
}

export function FormularioTalhao({ talhao }: FormularioTalhaoProps) {
  const {
    talhoes,
    operacoes,
    adicionarTalhao,
    atualizarTalhao,
    excluirTalhao,
  } = useTalhoes()
  const [campos, setCampos] = useState(() => valoresIniciais(talhao))
  const [erros, setErros] = useState<ErrosTalhao>({})
  const [erroSalvamento, setErroSalvamento] = useState('')
  const referencias = useRef<Partial<Record<CampoFormulario, HTMLElement>>>({})
  const navegar = useNavigate()
  const editando = Boolean(talhao)

  function alterar<K extends CampoFormulario>(campo: K, valor: ValoresFormulario[K]) {
    setCampos((atuais) => ({ ...atuais, [campo]: valor }))
    setErros((atuais) => ({ ...atuais, [campo]: undefined }))
  }

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const novosErros = validarTalhao(
      campos,
      talhoes,
      dataLocalHoje(),
      talhao?.id,
      operacoes,
    )
    setErros(novosErros)
    setErroSalvamento('')

    const primeiroCampo = (
      ['nome', 'cultura', 'areaHa', 'municipioId', 'dataPlantio'] as CampoFormulario[]
    ).find((campo) => novosErros[campo])
    if (primeiroCampo) {
      referencias.current[primeiroCampo]?.focus()
      return
    }

    const atualizado: Talhao = {
      id: talhao?.id ?? crypto.randomUUID(),
      nome: campos.nome.trim(),
      cultura: campos.cultura,
      areaHa: Number(campos.areaHa),
      municipioId: campos.municipioId,
      dataPlantio: campos.dataPlantio || null,
    }

    try {
      if (talhao) {
        atualizarTalhao(atualizado)
        navegar(`/talhoes/${talhao.id}`)
      } else {
        adicionarTalhao(atualizado)
        navegar('/talhoes')
      }
    } catch (erro: unknown) {
      setErroSalvamento(
        erro instanceof Error ? erro.message : 'Não foi possível salvar o talhão.',
      )
    }
  }

  function excluir() {
    if (!talhao || !window.confirm(`Excluir o talhão "${talhao.nome}"?`)) return

    try {
      excluirTalhao(talhao.id)
      navegar('/talhoes')
    } catch (erro: unknown) {
      setErroSalvamento(
        erro instanceof Error ? erro.message : 'Não foi possível excluir o talhão.',
      )
    }
  }

  return (
    <section className="pagina-talhao">
      <LinkRetorno destino="/talhoes" texto="Voltar aos talhões" />
      <h1>{editando ? 'Editar talhão' : 'Novo talhão'}</h1>
      <form className="formulario-talhao" onSubmit={enviar} noValidate>
        <label>
          Nome
          <input
            ref={(elemento) => { referencias.current.nome = elemento ?? undefined }}
            value={campos.nome}
            onChange={(evento) => alterar('nome', evento.target.value)}
            aria-invalid={Boolean(erros.nome)}
            aria-describedby={erros.nome ? 'erro-nome' : undefined}
          />
          {erros.nome && <span className="erro-campo" id="erro-nome">{erros.nome}</span>}
        </label>

        <label>
          Cultura
          <select
            ref={(elemento) => { referencias.current.cultura = elemento ?? undefined }}
            value={campos.cultura}
            onChange={(evento) => alterar('cultura', evento.target.value as CamposTalhao['cultura'])}
            aria-invalid={Boolean(erros.cultura)}
          >
            {CULTURAS.map((cultura) => (
              <option key={cultura.id} value={cultura.id}>{cultura.nome}</option>
            ))}
          </select>
        </label>

        <label>
          Área (ha)
          <input
            ref={(elemento) => { referencias.current.areaHa = elemento ?? undefined }}
            type="number"
            min="0.01"
            max="10000"
            step="0.01"
            value={campos.areaHa}
            onChange={(evento) => alterar('areaHa', evento.target.value)}
            aria-invalid={Boolean(erros.areaHa)}
            aria-describedby={erros.areaHa ? 'erro-area' : undefined}
          />
          {erros.areaHa && <span className="erro-campo" id="erro-area">{erros.areaHa}</span>}
        </label>

        <label>
          Município
          <select
            ref={(elemento) => { referencias.current.municipioId = elemento ?? undefined }}
            value={campos.municipioId}
            onChange={(evento) => alterar('municipioId', evento.target.value)}
            aria-invalid={Boolean(erros.municipioId)}
          >
            {MUNICIPIOS.map((municipio) => (
              <option key={municipio.id} value={municipio.id}>{municipio.nome}</option>
            ))}
          </select>
          {erros.municipioId && <span className="erro-campo">{erros.municipioId}</span>}
        </label>

        <label>
          Data de plantio (opcional)
          <input
            ref={(elemento) => { referencias.current.dataPlantio = elemento ?? undefined }}
            type="date"
            max={dataLocalHoje()}
            value={campos.dataPlantio}
            onChange={(evento) => alterar('dataPlantio', evento.target.value)}
            aria-invalid={Boolean(erros.dataPlantio)}
            aria-describedby={erros.dataPlantio ? 'erro-plantio' : undefined}
          />
          {erros.dataPlantio && (
            <span className="erro-campo" id="erro-plantio">{erros.dataPlantio}</span>
          )}
        </label>

        {erroSalvamento && <p className="erro-campo" role="alert">{erroSalvamento}</p>}
        <div className="acoes-formulario">
          <button type="submit">{editando ? 'Salvar alterações' : 'Cadastrar talhão'}</button>
          {editando && (
            <button type="button" className="botao-perigo" onClick={excluir}>
              Excluir talhão
            </button>
          )}
        </div>
      </form>
    </section>
  )
}
