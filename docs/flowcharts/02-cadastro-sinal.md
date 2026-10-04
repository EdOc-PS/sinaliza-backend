# Cadastro de sinal

Para gerar a imagem, cole o bloco em [mermaid.live](https://mermaid.live) e exporte em PNG/SVG.

```mermaid
---
title: "Fluxo 2 — Cadastro de sinal pelo educador"
---
flowchart TB
    A([Início])

    subgraph EDUCADOR["🧑‍🏫 Educador"]
        direction TB
        B["Novo sinal<br/><small>📂 Menu: Turmas → turma ou botão ＋</small>"] --> C["Informações<br/><small>📱 Modal: etapa 1 de 3</small>"]
        C --> D["Contexto<br/><small>📱 Modal: etapa 2 de 3</small>"]
        D --> G["Mídia<br/><small>📱 Modal: etapa 3 de 3</small>"]
        G --> H["Salvar sinal"]
    end

    subgraph SISTEMA["⚙️ Sistema"]
        direction TB
        I{"Dados válidos?"} -- Sim --> J["Envia vídeo e imagem<br/>para o armazenamento"]
        J --> K["Cria o sinal como PRIVADO<br/>e vincula às turmas"]
    end

    M["Sinal aparece na turma<br/><small>📂 Menu: Turmas → aba Sinais</small>"]
    N([Fim])

    %% Ligações entre as raias, sempre de cima para baixo
    A --> B
    H --> I
    I -- Não --> C
    K --> M
    M --> N

    %% Notas (texto fora do fluxo)
    nC["Nome, categoria e<br/>configuração de mão"]:::note
    nD["Significado, exemplos em<br/>português e Libras, tags"]:::note
    nG["Vídeo (ou link) obrigatório,<br/>imagem opcional"]:::note
    nI["Nome único, categoria e<br/>configuração de mão existentes,<br/>arquivos válidos"]:::note
    nM["Membros da turma (alunos e educadores)<br/>veem a bolinha de sinais novos"]:::note

    C -.- nC
    D -.- nD
    G -.- nG
    I -.- nI
    M -.- nM

    classDef note fill:#FFF8E1,stroke:#E6AB6E,stroke-dasharray:4 3,color:#5B6B7A,font-size:12px
```

## Descrição do fluxo

1. **Novo sinal** (menu Turmas): o educador abre a turma, ou usa o botão ＋, e escolhe criar um sinal.
2. **Informações** (modal, etapa 1 de 3): informa o nome do sinal, a categoria e escolhe a configuração de mão no teclado visual.
3. **Contexto** (modal, etapa 2 de 3): descreve o significado e o movimento, os exemplos em português e em Libras, e as tags.
4. **Mídia** (modal, etapa 3 de 3): envia o vídeo do sinal ou informa um link alternativo (ex.: YouTube). A imagem ilustrativa é opcional.
5. **Dados válidos?** O sistema confere se o nome ainda não existe, se a categoria, a configuração de mão e as turmas existem, se há vídeo ou link e se os arquivos são realmente vídeo/imagem. Se algo falhar, o educador corrige no formulário.
6. **Armazenamento:** o vídeo e a imagem são enviados para o armazenamento em nuvem (Cloudflare R2).
7. **Criação:** o sinal é salvo com status PRIVADO, ou seja, visível só nas turmas em que foi vinculado.
8. **Sinal na turma** (menu Turmas → aba Sinais): o sinal aparece na lista da turma, e os demais membros (alunos e educadores) veem a bolinha de "sinais novos" no card da turma. Quem criou o sinal não conta como novidade para si mesmo.

> Todo sinal tem obrigatoriamente **vídeo (ou link) + configuração de mão**. Para ficar visível a toda a instituição, o sinal passa pelo [Fluxo 3 — Promoção ao Glossário Global](03-promocao-glossario.md).
