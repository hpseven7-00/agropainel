import { useRef, useState, type FormEvent } from 'react'
import { dataLocalHoje } from '../dominio/talhoes'
import {
  reaisParaCentavos,
  TIPOS_OPERACAO,
  validarOperacao,
} from '../dominio/operacoes'
import { useTalhoes } from '../contexto/TalhoesContext'
import type {
  CamposOperacao,
  ErrosOperacao,
  Operacao,
} from '../tipos/operacao'
import type { Talhao } from '../tipos/talhao'

interface FormularioOperacaoProps {
  talhao: Talhao
}

type CampoFormulario = keyof CamposOperacao

const CAMPOS_INVALIDOS: CampoFormulario[] = [
  'tipo',
  'data',
  'descricao',
  'custoReais',
  'produtividadeScHa',
]

function camposIniciais(): CamposOperacao {
  return {
    tipo: 'preparo',
    data: dataLocalHoje(),
    descricao: '',
    custoReais: '0',
    produtividadeScHa: '',
  }
}

export function FormularioOperacao({ talhao }: FormularioOperacaoProps) {
  const { operacoes, adicionarOperacao } = useTalhoes()
  const [campos, setCampos] = useState(camposIniciais)
  const [erros, setErros] = useState<ErrosOperacao>({})
  const [mensagem, setMensagem] = useState('')
  const [erroSalvamento, setErroSalvamento] = useState('')
  const referencias = useRef<Partial<Record<CampoFormulario, HTMLElement>>>({})

  function alterar<K extends CampoFormulario>(campo: K, valor: CamposOperacao[K]) {
    setCampos((atuais) => ({ ...atuais, [campo]: valor }))
    setErros((atuais) => ({ ...atuais, [campo]: undefined }))
    setMensagem('')
    setErroSalvamento('')
  }

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const novosErros = validarOperacao(
      campos.tipo,
      campos.data,
      campos.custoReais,
      campos.produtividadeScHa,
      campos.descricao,
      talhao,
      operacoes,
    )
    setErros(novosErros)
    setMensagem('')
    setErroSalvamento('')

    const primeiroCampo = CAMPOS_INVALIDOS.find((campo) => novosErros[campo])
    if (primeiroCampo) {
      referencias.current[primeiroCampo]?.focus()
      return
    }

    const novaOperacao: Operacao = {
      id: crypto.randomUUID(),
      talhaoId: talhao.id,
      tipo: campos.tipo,
      data: campos.data,
      descricao: campos.descricao.trim(),
      custoCentavos: reaisParaCentavos(campos.custoReais),
      ...(campos.tipo === 'colheita'
        ? { produtividadeScHa: Number(campos.produtividadeScHa) }
        : {}),
    }

    try {
      adicionarOperacao(novaOperacao)
      setCampos(camposIniciais())
      setMensagem('Operação registrada.')
    } catch (erro: unknown) {
      setErroSalvamento(
        erro instanceof Error ? erro.message : 'Não foi possível salvar a operação.',
      )
    }
  }

  return (
    <form className="formulario-talhao formulario-operacao" onSubmit={enviar} noValidate>
      <label>
        Tipo de operação
        <select
          ref={(elemento) => { referencias.current.tipo = elemento ?? undefined }}
          value={campos.tipo}
          onChange={(evento) =>
            alterar('tipo', evento.target.value as CamposOperacao['tipo'])
          }
          aria-invalid={Boolean(erros.tipo)}
          aria-describedby={erros.tipo ? 'erro-tipo-operacao' : undefined}
        >
          {TIPOS_OPERACAO.map((tipo) => (
            <option key={tipo.id} value={tipo.id}>{tipo.nome}</option>
          ))}
        </select>
        {erros.tipo && (
          <span className="erro-campo" id="erro-tipo-operacao">{erros.tipo}</span>
        )}
      </label>

      <label>
        Data
        <input
          ref={(elemento) => { referencias.current.data = elemento ?? undefined }}
          type="date"
          max={dataLocalHoje()}
          value={campos.data}
          onChange={(evento) => alterar('data', evento.target.value)}
          aria-invalid={Boolean(erros.data)}
          aria-describedby={erros.data ? 'erro-data-operacao' : undefined}
        />
        {erros.data && (
          <span className="erro-campo" id="erro-data-operacao">{erros.data}</span>
        )}
      </label>

      <label>
        Descrição
        <input
          ref={(elemento) => { referencias.current.descricao = elemento ?? undefined }}
          value={campos.descricao}
          onChange={(evento) => alterar('descricao', evento.target.value)}
          aria-invalid={Boolean(erros.descricao)}
          aria-describedby={erros.descricao ? 'erro-descricao-operacao' : undefined}
        />
        {erros.descricao && (
          <span className="erro-campo" id="erro-descricao-operacao">
            {erros.descricao}
          </span>
        )}
      </label>

      <label>
        Custo (R$)
        <input
          ref={(elemento) => { referencias.current.custoReais = elemento ?? undefined }}
          type="number"
          min="0"
          step="0.01"
          value={campos.custoReais}
          onChange={(evento) => alterar('custoReais', evento.target.value)}
          aria-invalid={Boolean(erros.custoReais)}
          aria-describedby={erros.custoReais ? 'erro-custo-operacao' : undefined}
        />
        {erros.custoReais && (
          <span className="erro-campo" id="erro-custo-operacao">{erros.custoReais}</span>
        )}
      </label>

      {campos.tipo === 'colheita' && (
        <label>
          Produtividade (sc/ha)
          <input
            ref={(elemento) => { referencias.current.produtividadeScHa = elemento ?? undefined }}
            type="number"
            min="0.01"
            step="0.01"
            value={campos.produtividadeScHa}
            onChange={(evento) => alterar('produtividadeScHa', evento.target.value)}
            aria-invalid={Boolean(erros.produtividadeScHa)}
            aria-describedby={
              erros.produtividadeScHa ? 'erro-produtividade' : undefined
            }
          />
          {erros.produtividadeScHa && (
            <span className="erro-campo" id="erro-produtividade">
              {erros.produtividadeScHa}
            </span>
          )}
        </label>
      )}

      <div>
        <button type="submit">Registrar operação</button>
        {mensagem && <p role="status">{mensagem}</p>}
        {erroSalvamento && <p role="alert">{erroSalvamento}</p>}
      </div>
    </form>
  )
}
