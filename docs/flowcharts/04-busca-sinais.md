# Busca de sinais

Para gerar a imagem, cole o bloco em [mermaid.live](https://mermaid.live) e exporte em PNG/SVG.

```mermaid
---
title: "Fluxo 4 — Busca de sinais"
---
flowchart TB
    A([Início])

    subgraph USUARIO["👤 Aluno / Educador"]
        direction TB
        B["Escolhe onde buscar<br/><small>📂 Menu: Turmas ou Glossário</small>"] --> C["Preenche os filtros<br/><small>📱 Card de filtros</small>"]
        C --> D["Pesquisar"]
    end

    subgraph SISTEMA["⚙️ Sistema"]
        direction TB
        E["Aplica os filtros<br/>no escopo escolhido"] --> F{"Encontrou sinais?"}
        F -- Sim --> G["Lista os sinais em cards"]
    end

    H["Abre o sinal<br/><small>📱 Tela: Detalhe do sinal</small>"]
    I["Registra no histórico"]
    N([Fim])

    %% Ligações entre as raias, sempre de cima para baixo
    A --> B
    D --> E
    F -- Não --> C
    G --> H
    H --> I
    I --> N

    %% Notas (texto fora do fluxo)
    nB["Turmas: só sinais das suas turmas<br/>Glossário: sinais públicos"]:::note
    nC["Texto, categoria, disciplina e<br/>configuração de mão (várias opções).<br/>'Limpar' zera tudo"]:::note
    nF["Mostra 'Nenhum sinal encontrado'<br/>e sugere ajustar os filtros"]:::note
    nH["Vídeo, configuração de mão,<br/>significado, exemplos, favoritar"]:::note
    nI["Alimenta Histórico e<br/>as Métricas do gestor"]:::note

    B -.- nB
    C -.- nC
    F -.- nF
    H -.- nH
    I -.- nI

    classDef note fill:#FFF8E1,stroke:#E6AB6E,stroke-dasharray:4 3,color:#5B6B7A,font-size:12px
```

## Descrição do fluxo

1. **Escolhe onde buscar** (menu Turmas ou Glossário): a busca é contextualizada. Em Turmas, o usuário encontra só os sinais das turmas de que participa; no Glossário, os sinais públicos de toda a instituição.
2. **Preenche os filtros** (card de filtros): pode combinar busca por texto (nome do sinal), categoria, disciplina e configuração de mão pelo teclado visual. Cada filtro aceita várias opções ao mesmo tempo. O botão "Limpar" zera todos.
3. **Pesquisar:** os filtros só são aplicados ao clicar em "Pesquisar".
4. **Encontrou sinais?** O sistema filtra os sinais do escopo escolhido. Se nada for encontrado, mostra "Nenhum sinal encontrado" e o usuário ajusta os filtros.
5. **Lista em cards:** os resultados aparecem como cards; passar o mouse sobre um card reproduz o vídeo.
6. **Abre o sinal** (tela de detalhe): mostra o vídeo, a configuração de mão, o significado, os exemplos em português e Libras, e permite favoritar.
7. **Registra no histórico:** cada abertura entra no histórico do usuário e nas métricas de uso vistas pelo gestor.
