# Cadastro de aluno → aprovação pelo gestor

Para gerar a imagem, cole o bloco em [mermaid.live](https://mermaid.live) e exporte em PNG/SVG.

```mermaid
---
title: "Fluxo 1 — Cadastro de aluno e aprovação pelo gestor"
---
flowchart TB
    A([Início])

    subgraph ALUNO["👤 Aluno"]
        direction TB
        B["Solicitar entrada<br/><small>📱 Tela: Login</small>"] --> C["Preencher cadastro<br/><small>📱 Tela: Cadastro (5 etapas)</small>"]
    end

    subgraph SISTEMA["⚙️ Sistema"]
        direction TB
        E{"Dados válidos?"} -- Sim --> F["Conta pendente<br/><small>📱 Tela: Solicitação em análise</small>"]
    end

    subgraph GESTOR["🛡️ Gestor"]
        direction TB
        I{"Aprovar?<br/><small>📂 Menu: Alunos</small>"}
        I -- Não --> K["Recusado<br/><small>📱 Tela: Solicitação recusada</small>"]
        K -.-> R["Rever decisão<br/><small>📂 Menu: Alunos → aba Bloqueados → ⋮ Aprovar conta</small>"]
        I -- Sim --> J["Aprovado"]
        R --> J
    end

    M["Acessa a plataforma<br/><small>📂 Menu: Turmas</small>"]
    N([Fim])

    %% Ligações entre as raias, sempre de cima para baixo
    A --> B
    C --> E
    E -- Não --> C
    F --> I
    J --> M
    M --> N

    %% Notas (texto fora do fluxo)
    nC["Nome, e-mail, perfil e senha"]:::note
    nE["Confere campos e<br/>se o e-mail já existe"]:::note
    nF["Status PENDENTE + turma Contexto"]:::note
    nJ["E-mail de aprovação.<br/>Aluno vai para a aba Ativos"]:::note
    nK["E-mail de recusa.<br/>Aluno vai para a aba Bloqueados"]:::note
    nR["Gestor revê uma recusa feita por engano"]:::note

    C -.- nC
    E -.- nE
    F -.- nF
    J -.- nJ
    K -.- nK
    R -.- nR

    classDef note fill:#FFF8E1,stroke:#E6AB6E,stroke-dasharray:4 3,color:#5B6B7A,font-size:12px
```

## Descrição do fluxo

1. **Solicitar entrada** (tela de Login): o aluno clica em "Solicitar entrada".
2. **Preencher cadastro** (tela de Cadastro, 5 etapas): o aluno informa nome, e-mail, dados do perfil e senha.
3. **Dados válidos?** O sistema confere os campos e se o e-mail já está em uso. Se houver erro, o aluno volta ao formulário.
4. **Conta pendente** (tela "Solicitação em análise"): o sistema cria a conta com status PENDENTE e matricula o aluno na turma Contexto. Até a aprovação, todo login leva a essa tela.
5. **Aprovar?** (menu Alunos): o gestor analisa a solicitação no card "Aprovações pendentes".
6. **Aprovado:** o status muda para APROVADO, o aluno recebe um e-mail de aprovação e passa a aparecer na aba **Ativos** da tela Alunos.
7. **Recusado** (tela "Solicitação recusada"): o status muda para RECUSADO, o aluno recebe um e-mail de recusa e passa a aparecer na aba **Bloqueados**. No login, ele vê a tela de recusa, com orientação para procurar a coordenação.
8. **Rever decisão** (menu Alunos → aba Bloqueados → ⋮ → "Aprovar conta"): se a recusa foi um engano, o gestor aprova a conta. O aluno vai para a aba Ativos e recebe o e-mail de aprovação.
9. **Acessa a plataforma** (menu Turmas): com a conta aprovada, o aluno entra e acessa turmas, glossário e favoritos.

## Bloqueio de alunos já ativos

Fora do fluxo de cadastro, o gestor pode bloquear um aluno ativo (menu Alunos → aba Ativos → ⋮ → "Bloquear aluno"). A conta fica inativa, o aluno não consegue mais fazer login e vai para a aba Bloqueados. Para liberar de novo, o gestor usa "Desbloquear aluno" na mesma aba.
