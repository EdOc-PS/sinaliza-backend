# Gestão de usuários pelo gestor

Para gerar a imagem, cole o bloco em [mermaid.live](https://mermaid.live) e exporte em PNG/SVG.

```mermaid
---
title: "Fluxo 9 — Gestão de usuários pelo gestor"
---
flowchart TB
    A([Início])

    subgraph GESTOR["🛡️ Gestor"]
        direction TB
        B{"O que gerenciar?"}
        B -- Educadores --> C["Cadastrar educador<br/><small>📂 Menu: Educadores → ＋ Novo educador</small>"]
        B -- Alunos --> D{"Situação do aluno<br/><small>📂 Menu: Alunos</small>"}
        D -- "Pendente" --> E["Aprovar ou recusar<br/><small>📱 Card Aprovações pendentes</small>"]
        D -- "Ativo" --> F["Bloquear aluno<br/><small>📱 Aba Ativos → ⋮</small>"]
        D -- "Bloqueado" --> G["Desbloquear ou aprovar<br/><small>📱 Aba Bloqueados → ⋮</small>"]
    end

    subgraph SISTEMA["⚙️ Sistema"]
        direction TB
        H{"E-mail disponível?"} -- Sim --> I["Cria a conta do educador<br/>e matricula na turma Contexto"]
        J["Atualiza a situação<br/>e avisa por e-mail"]
        K["Conta inativa:<br/>não consegue fazer login"]
        L["Conta liberada"]
    end

    M["Educador acessa a plataforma<br/><small>📂 Menu: Turmas</small>"]
    N([Fim])

    %% Ligações entre as raias, sempre de cima para baixo
    A --> B
    C --> H
    H -- Não --> C
    I --> M
    E --> J
    F --> K
    G --> L
    M --> N
    J --> N
    K --> N
    L --> N

    %% Notas (texto fora do fluxo)
    nC["Nome, e-mail, senha, tipo<br/>(professor ou intérprete), área,<br/>proficiência em Libras.<br/>Opcional: também ser gestor"]:::note
    nI["Educador já nasce aprovado.<br/>Pode ser editado ou excluído<br/>em Educadores → ⋮"]:::note
    nJ["Detalhes no Fluxo 1"]:::note
    nK["Vai para a aba Bloqueados"]:::note
    nL["Volta para a aba Ativos.<br/>Recusado aprovado recebe e-mail"]:::note

    C -.- nC
    I -.- nI
    J -.- nJ
    K -.- nK
    L -.- nL

    classDef note fill:#FFF8E1,stroke:#E6AB6E,stroke-dasharray:4 3,color:#5B6B7A,font-size:12px
```

## Descrição do fluxo

1. **O que gerenciar?** O gestor escolhe entre o menu **Educadores** e o menu **Alunos**.

**Educadores**

2. **Cadastrar educador** (Educadores → ＋ Novo educador): o gestor informa nome, e-mail, senha, tipo (professor ou intérprete), área de atuação e proficiência em Libras. Pode marcar que o educador também será **gestor**.
3. **E-mail disponível?** Se o e-mail já estiver em uso, o gestor corrige o cadastro.
4. **Cria a conta:** o educador já nasce aprovado (educadores não passam pela fila de aprovação) e é matriculado automaticamente na turma Contexto.
5. **Educador acessa a plataforma** (menu Turmas). Depois, o gestor pode editar ou excluir o educador pelo menu ⋮ do card.

**Alunos**

6. **Pendente** (card "Aprovações pendentes"): o gestor aprova ou recusa. O aluno recebe um e-mail com a decisão (detalhes no [Fluxo 1](01-cadastro-aprovacao-aluno.md)).
7. **Ativo** (aba Ativos → ⋮ → "Bloquear aluno"): a conta fica inativa, o aluno não consegue mais fazer login e passa para a aba Bloqueados.
8. **Bloqueado** (aba Bloqueados → ⋮):
   - Aluno **bloqueado pelo gestor** → "Desbloquear aluno": volta para a aba Ativos.
   - Aluno **recusado** → "Aprovar conta": volta para a aba Ativos e recebe o e-mail de aprovação.
