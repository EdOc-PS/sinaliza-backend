# Recuperação de senha

Para gerar a imagem, cole o bloco em [mermaid.live](https://mermaid.live) e exporte em PNG/SVG.

```mermaid
---
title: "Fluxo 7 — Recuperação de senha"
---
flowchart TB
    A([Início])

    subgraph USUARIO["👤 Usuário"]
        direction TB
        B["Esqueci minha senha<br/><small>📱 Tela: Login</small>"] --> C["Informa o e-mail<br/><small>📱 Tela: Recuperar senha</small>"]
    end

    subgraph SISTEMA["⚙️ Sistema"]
        direction TB
        D{"Conta existe<br/>e está ativa?"}
        D -- Sim --> E["Gera link único<br/>e envia por e-mail"]
        D -- Não --> F["Não envia nada"]
        E --> G["Mensagem de confirmação"]
        F --> G
    end

    subgraph EMAIL["📧 E-mail do usuário"]
        direction TB
        H["Clica em 'Redefinir minha senha'"] --> I["Cria a nova senha<br/><small>📱 Tela: Redefinir senha</small>"]
    end

    subgraph VALIDACAO["⚙️ Sistema"]
        direction TB
        J{"Link válido?"} -- Sim --> K["Salva a nova senha<br/>e desfaz bloqueios"]
    end

    L["Faz login com a nova senha<br/><small>📱 Tela: Login</small>"]
    X["Link inválido ou expirado"]
    N([Fim])

    %% Ligações entre as raias, sempre de cima para baixo
    A --> B
    C --> D
    G --> H
    I --> J
    J -- Não --> X
    X -.-> B
    K --> L
    L --> N

    %% Notas (texto fora do fluxo)
    nG["Mesma mensagem nos dois casos:<br/>não revela quais e-mails existem"]:::note
    nE["Novo pedido invalida<br/>links anteriores"]:::note
    nJ["Vale por 60 minutos<br/>e só pode ser usado uma vez"]:::note
    nK["Zera as tentativas erradas<br/>e o bloqueio de 30 min"]:::note

    G -.- nG
    E -.- nE
    J -.- nJ
    K -.- nK

    classDef note fill:#FFF8E1,stroke:#E6AB6E,stroke-dasharray:4 3,color:#5B6B7A,font-size:12px
```

## Descrição do fluxo

1. **Esqueci minha senha** (tela de Login): o usuário clica no link abaixo do formulário.
2. **Informa o e-mail** (tela Recuperar senha).
3. **Conta existe e está ativa?**
   - **Sim:** o sistema gera um link único e envia por e-mail. Um novo pedido invalida os links anteriores que ainda não foram usados.
   - **Não:** nada é enviado.
4. **Mensagem de confirmação:** a resposta é a mesma nos dois casos. Isso evita que alguém descubra quais e-mails estão cadastrados na plataforma.
5. **Clica em "Redefinir minha senha"** (e-mail): o botão abre a tela Redefinir senha.
6. **Cria a nova senha** (tela Redefinir senha): o usuário digita e confirma a nova senha.
7. **Link válido?** O link vale por **60 minutos** e só pode ser usado **uma vez**. Se estiver expirado ou já usado, o sistema avisa e o usuário pede um novo e-mail.
8. **Salva a nova senha:** a senha é guardada criptografada, e o sistema zera as tentativas erradas e o bloqueio temporário de login (ver [Fluxo 6](06-login-seguranca.md)).
9. **Faz login com a nova senha** (tela de Login).
