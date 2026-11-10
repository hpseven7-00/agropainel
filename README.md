# AgroPainel

Projeto do Tema A — AgroPainel Sul do Maranhão.

## Etapas

1. **Base e clima:** TypeScript, municípios, painel climático e pulverização — concluída.
2. **Talhões:** cadastro, listagem, edição, detalhes e salvamento local.
3. **Operações:** diário, regras da safra e cálculos do relatório.
4. **Entrega:** rotas completas, acessibilidade, testes e publicação.

## Executar

```bash
npm install
npm run dev
```

`npm run build` verifica os tipos e gera a versão de produção. `npm test` executa os testes.

## Onde fica cada parte

- `src/App.tsx`: rotas da aplicação.
- `src/paginas/`: telas.
- `src/componentes/`: partes reaproveitáveis da interface.
- `src/tipos/`: formatos dos dados.
- `src/dominio/`: regras e cálculos, sem interface.
- `src/servicos/`: consulta à API de clima.
- `src/dados/`: municípios atendidos.
- `src/contexto/`: estado compartilhado, a ser usado na etapa de talhões.
