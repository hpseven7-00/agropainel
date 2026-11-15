# AgroPainel

Painel para acompanhar clima, talhões, operações e resultados da safra no sul do Maranhão.

**Aplicação publicada:** aguardando o primeiro deploy  
**Endereço previsto:** https://hpseven7-00.github.io/agropainel/  
**Tema:** A — AgroPainel Sul do Maranhão  
**Repositório:** https://github.com/hpseven7-00/agropainel

## Progresso

- Base e clima: concluída.
- Talhões: concluída.
- Operações e relatório: concluída.
- Publicação: fluxo do GitHub Pages configurado; depende de enviar as alterações para `main`.
- Capturas de tela: pendentes.

## Equipe

Responsabilidades para apresentação e manutenção das partes do sistema:

| Integrante | Responsável por |
|---|---|
| Hágape Latan Mendonça de Sousa | Painel, clima, municípios e publicação |
| César Kayoma Sousa de Oliveira | Cadastro, validação, filtros e persistência de talhões |
| Miquéias do Nascimento | Diário de operações, regras da safra, relatório e testes |

O combinado atual é que Hágape fará os commits. O enunciado pede commits de todos os integrantes; portanto, esse requisito ainda dependerá de ajuste pela equipe.

## Como rodar

```bash
npm install
npm run dev
npm test
```

`npm run build` verifica os tipos e gera a versão de produção.

## Telas

| Rota | Tela |
|---|---|
| `/` | Painel, clima e resumo da safra |
| `/talhoes` | Lista e filtros de talhões |
| `/talhoes/novo` | Cadastro de talhão |
| `/talhoes/:id` | Detalhes e diário de operações |
| `/talhoes/:id/editar` | Edição e exclusão de talhão |
| `/relatorio` | Relatório da safra |

Capturas de tela das rotas: pendentes.

## Regras de negócio

- Ciclos, previsão de colheita e situação do talhão: `src/dominio/talhoes.ts`.
- Indicador de pulverização e descrição do clima: `src/dominio/pulverizacao.ts` e `src/dominio/descricaoTempo.ts`.
- Validação de operações, custos em centavos e produção: `src/dominio/operacoes.ts`.
- Área por cultura, custos e produção do relatório: `src/dominio/relatorio.ts`.

## Decisões técnicas

- React com TypeScript, Vite, `HashRouter`, Context e `localStorage`.
- Regras de negócio ficam em funções TypeScript sem dependência de React.
- O clima é consultado diretamente pelo navegador, sem chave de API.
- O GitHub Actions executa os testes, gera o site e publica no GitHub Pages ao receber alterações em `main`.

## Publicar

1. Envie as alterações para a branch `main` do repositório.
2. No GitHub, abra **Settings → Pages** e selecione **GitHub Actions** como origem, caso seja solicitado.
3. Aguarde o fluxo **Publicar no GitHub Pages** terminar em **Actions**.
4. O endereço publicado será `https://hpseven7-00.github.io/agropainel/`.

## Créditos

Dados meteorológicos: [Open-Meteo.com](https://open-meteo.com/).
