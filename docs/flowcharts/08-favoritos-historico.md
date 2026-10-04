# Favoritos e histórico

Para gerar a imagem, cole o bloco em [mermaid.live](https://mermaid.live) e exporte em PNG/SVG.

```mermaid
---
title: "Fluxo 8 — Favoritos e histórico"
---
flowchart TB
    A([Início])

    subgraph USUARIO["👤 Aluno / Educador"]
        direction TB
        B["Abre um sinal<br/><small>📱 Tela: Detalhe do sinal</small>"] --> C{"Já é favorito?<br/><small>📱 Botão ♥ / Card → ⋮ Favoritar</small>"}
        C -- Não --> D["Favoritar"]
        C -- Sim --> E["Desfavoritar"]
    end

    subgraph SISTEMA["⚙️ Sistema"]
        direction TB
        F["Registra o acesso<br/>no histórico"]
        G["Adiciona aos favoritos"]
        H["Remove dos favoritos"]
    end

    subgraph CONSULTA["📂 Consulta rápida"]
        direction TB
        I["Favoritos<br/><small>📂 Menu: Favoritos</small>"]
        J["Histórico<br/><small>📂 Menu: Histórico</small>"]
        K["Favoritos da turma<br/><small>📱 Turma → aba Favoritos</small>"]
    end

    N([Fim])

    %% Ligações entre as raias, sempre de cima para baixo
    A --> B
    B --> F
    D --> G
    E --> H
    G --> I
    G --> K
    F --> J
    I --> N
    J --> N
    K --> N

    %% Notas (texto fora do fluxo)
    nF["Guarda o último acesso e<br/>quantas vezes o sinal foi aberto"]:::note
    nG["Favoritos contam o dobro nos<br/>candidatos à promoção do gestor"]:::note
    nJ["Mostra os 35 mais recentes.<br/>Pode remover um ou limpar tudo"]:::note

    F -.- nF
    G -.- nG
    J -.- nJ

    classDef note fill:#FFF8E1,stroke:#E6AB6E,stroke-dasharray:4 3,color:#5B6B7A,font-size:12px
```

## Descrição do fluxo

1. **Abre um sinal** (tela de detalhe): ao abrir, o sistema **registra o acesso no histórico**, guardando a data do último acesso e quantas vezes o usuário abriu aquele sinal.
2. **Já é favorito?** O usuário favorita ou desfavorita pelo botão ♥ no detalhe do sinal ou pelo menu ⋮ do card.
   - **Favoritar:** o sinal entra na lista de favoritos.
   - **Desfavoritar:** o sinal sai da lista.
3. **Consulta rápida:**
   - **Favoritos** (menu Favoritos): todos os sinais favoritados pelo usuário.
   - **Favoritos da turma** (turma → aba Favoritos): só os favoritos daquela turma.
   - **Histórico** (menu Histórico): os 35 sinais acessados mais recentemente. O usuário pode remover um item ou limpar todo o histórico.

> Os acessos e favoritos também alimentam a página **Métricas** do gestor: os sinais mais acessados e os candidatos à promoção, em que cada favorito vale o dobro de um acesso (ver [Fluxo 3](03-promocao-glossario.md)).
