# Login e segurança

Para gerar a imagem, cole o bloco em [mermaid.live](https://mermaid.live) e exporte em PNG/SVG.

```mermaid
---
title: "Fluxo 6 — Login e segurança"
---
flowchart TB
    A([Início])

    subgraph USUARIO["👤 Usuário"]
        direction TB
        B["Informa e-mail e senha<br/><small>📱 Tela: Login</small>"]
    end

    subgraph SISTEMA["⚙️ Sistema"]
        direction TB
        C{"E-mail cadastrado?"} -- Sim --> D{"Conta ativa?"}
        D -- Sim --> E{"Conta bloqueada<br/>temporariamente?"}
        E -- Não --> F{"Senha correta?"}
        F -- Não --> G["Soma 1 tentativa errada"]
        G --> H{"Chegou a 6 tentativas?"}
        H -- Sim --> I["Bloqueia por 30 minutos"]
        F -- Sim --> J["Zera as tentativas<br/>e libera o acesso"]
        J --> K{"Situação da conta"}
    end

    L["Solicitação em análise<br/><small>📱 Tela: Aguardando aprovação</small>"]
    M["Solicitação recusada<br/><small>📱 Tela: Recusada</small>"]
    P["Entra na plataforma<br/><small>📂 Menu: Turmas</small>"]
    X["Mensagem de erro<br/><small>📱 Tela: Login</small>"]
    N([Fim])

    %% Ligações entre as raias, sempre de cima para baixo
    A --> B
    B --> C
    C -- Não --> X
    D -- Não --> X
    E -- Sim --> X
    H -- Não --> X
    I --> X
    X -.-> B
    K -- Pendente --> L
    K -- Recusado --> M
    K -- Aprovado --> P
    L --> N
    M --> N
    P --> N

    %% Notas (texto fora do fluxo)
    nD["Conta bloqueada pelo gestor<br/>não entra ('Usuário inativo')"]:::note
    nE["Mostra quantos minutos<br/>faltam para desbloquear"]:::note
    nH["Abaixo de 6: avisa<br/>quantas tentativas restam"]:::note
    nI["'Esqueci minha senha'<br/>também desbloqueia"]:::note
    nK["Educadores e gestores<br/>não passam por aprovação"]:::note

    D -.- nD
    E -.- nE
    H -.- nH
    I -.- nI
    K -.- nK

    classDef note fill:#FFF8E1,stroke:#E6AB6E,stroke-dasharray:4 3,color:#5B6B7A,font-size:12px
```

## Descrição do fluxo

1. **Informa e-mail e senha** (tela de Login).
2. **E-mail cadastrado?** Se não existir, o sistema mostra uma mensagem de erro.
3. **Conta ativa?** Uma conta bloqueada pelo gestor (menu Alunos → "Bloquear aluno") não consegue entrar e recebe "Usuário inativo".
4. **Conta bloqueada temporariamente?** Se a conta estiver no período de bloqueio por tentativas, o sistema informa quantos minutos faltam.
5. **Senha correta?**
   - **Errada:** soma uma tentativa errada e avisa quantas restam. Na **6ª tentativa errada**, a conta fica bloqueada por **30 minutos**.
   - **Certa:** zera o contador de tentativas e libera o acesso.
6. **Situação da conta:** antes de mostrar a plataforma, o sistema confere a aprovação (só para alunos; educadores e gestores não passam por aprovação):
   - **Pendente** → tela "Solicitação em análise".
   - **Recusado** → tela "Solicitação recusada".
   - **Aprovado** → entra na plataforma, no menu Turmas.

> Redefinir a senha por "Esqueci minha senha" também desfaz o bloqueio por tentativas. O fluxo de aprovação está no [Fluxo 1](01-cadastro-aprovacao-aluno.md).
