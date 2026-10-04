# Turmas: criação, entrada e saída

Para gerar a imagem, cole o bloco em [mermaid.live](https://mermaid.live) e exporte em PNG/SVG.

```mermaid
---
title: "Fluxo 5 — Turmas: criação, entrada e saída"
---
flowchart TB
    A([Início])

    subgraph EDUCADOR["🧑‍🏫 Educador"]
        direction TB
        B["Criar turma<br/><small>📂 Menu: Turmas → ＋ Criar turma</small>"] --> C["Compartilha o código<br/><small>📱 Card da turma → ⋮ Copiar código</small>"]
    end

    subgraph ALUNO["👤 Aluno"]
        direction TB
        D["Entrar com código<br/><small>📂 Menu: Turmas → Entrar em turma</small>"]
    end

    subgraph SISTEMA["⚙️ Sistema"]
        direction TB
        E{"Código válido?"} -- Sim --> F["Matricula na turma"]
    end

    G["Usa a turma<br/><small>📱 Tela: Detalhe da turma → aba Sinais</small>"]

    subgraph SAIDA["🚪 Saída da turma"]
        direction TB
        H{"Quem está saindo?<br/><small>📱 Aba Configurações → Sair da turma</small>"}
        H -- "Aluno ou educador<br/>que entrou depois" --> I["Sai da turma"]
        H -- "Educador dono" --> J{"Há outro educador?"}
        J -- Sim --> K["Turma passa ao educador<br/>que entrou primeiro"]
        K --> I
        J -- Não --> L["Botão 'Sair da turma'<br/>não aparece"]
    end

    N([Fim])

    %% Ligações entre as raias, sempre de cima para baixo
    A --> B
    C --> D
    D --> E
    E -- Não --> D
    F --> G
    G --> H
    I --> N
    L --> N

    %% Notas (texto fora do fluxo)
    nB["Nome, descrição e cor.<br/>Código de 6 caracteres gerado"]:::note
    nC["Também pode adicionar<br/>participante pelo e-mail"]:::note
    nE["Código existe, turma ativa<br/>e usuário ainda não matriculado"]:::note
    nG["Bolinha no card mostra<br/>sinais novos desde a última visita"]:::note
    nL["Precisa adicionar outro<br/>educador antes de sair"]:::note

    B -.- nB
    C -.- nC
    E -.- nE
    G -.- nG
    L -.- nL

    classDef note fill:#FFF8E1,stroke:#E6AB6E,stroke-dasharray:4 3,color:#5B6B7A,font-size:12px
```

## Descrição do fluxo

1. **Criar turma** (menu Turmas → ＋): o educador informa nome, descrição e cor do card. O sistema gera um código de convite de 6 caracteres.
2. **Compartilha o código** (card da turma → ⋮ → "Copiar código"): o educador passa o código aos alunos. Ele também pode adicionar alguém direto pelo e-mail, na aba Configurações da turma.
3. **Entrar com código** (menu Turmas → "Entrar em turma"): o aluno digita o código.
4. **Código válido?** O sistema confere se o código existe, se a turma está ativa e se o aluno ainda não está matriculado. Se algo falhar, mostra o erro e o aluno tenta de novo.
5. **Matricula na turma:** a turma passa a aparecer na lista do aluno.
6. **Usa a turma** (detalhe da turma → aba Sinais): o aluno vê os sinais da turma, favorita e busca. No card da turma, uma bolinha mostra quantos sinais novos entraram desde a última visita (vale para alunos e educadores).
7. **Saída da turma** (aba Configurações → "Sair da turma"):
   - **Aluno** sai quando quiser.
   - **Educador que entrou depois** do criador também sai livremente.
   - **Educador dono** só sai se houver outro educador na turma. Nesse caso, a turma passa para o educador que entrou primeiro depois dele.
   - Se o dono for o **único educador**, o botão "Sair da turma" nem aparece. Ele precisa adicionar outro educador antes de sair.

> Todos os alunos e educadores também são matriculados automaticamente na turma **Contexto** ao criar a conta (ver [Fluxo 1](01-cadastro-aprovacao-aluno.md)).
