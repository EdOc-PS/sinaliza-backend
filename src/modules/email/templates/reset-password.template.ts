interface ResetPasswordTemplateData {
  name: string;
  resetUrl: string;
  logoUrl: string;
  expiresInMinutes: number;
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

// Email em tabelas + estilos inline: é o que funciona de forma consistente em
// Gmail/Outlook. Cores e tipografia seguem o tema do front (cloud/campfire).
export function resetPasswordTemplate({ name, resetUrl, logoUrl, expiresInMinutes }: ResetPasswordTemplateData) {
  const firstName = escapeHtml(name.split(' ')[0] ?? name);
  const url = escapeHtml(resetUrl);

  const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Redefinir senha — Sinaliza</title>
</head>
<body style="margin:0;padding:0;background:#F5F9FC;font-family:'Segoe UI',Helvetica,Arial,sans-serif;color:#213547;">
  <span style="display:none;max-height:0;overflow:hidden;opacity:0;">Recebemos um pedido para redefinir sua senha no Sinaliza.</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F5F9FC;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
          <tr>
            <td align="center" style="padding-bottom:20px;">
              <img src="${escapeHtml(logoUrl)}" width="44" height="44" alt="Sinaliza" style="display:inline-block;vertical-align:middle;border:0;">
              <span style="display:inline-block;vertical-align:middle;margin-left:8px;font-family:Georgia,'Libre Baskerville',serif;font-size:24px;font-weight:bold;color:#213547;">Sinaliza</span>
            </td>
          </tr>
          <tr>
            <td style="background:#FFFFFF;border:1px solid #E6EEF5;border-radius:24px;padding:36px 32px;">
              <h1 style="margin:0 0 8px;font-family:Georgia,'Libre Baskerville',serif;font-size:26px;line-height:1.3;color:#213547;">
                Olá, <span style="color:#E6AB6E;font-style:italic;">${firstName}</span>
              </h1>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#5B6B7A;">
                Recebemos um pedido para redefinir a senha da sua conta. Clique no botão abaixo para criar uma nova senha.
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="border-radius:16px;background:#213547;">
                    <a href="${url}" target="_blank" style="display:block;padding:16px 24px;font-size:15px;font-weight:bold;color:#F5F9FC;text-decoration:none;border-radius:16px;">
                      Redefinir minha senha
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:24px 0 0;padding:14px 16px;background:#FEEDD8;border-radius:14px;font-size:13px;line-height:1.5;color:#A86830;">
                O link vale por <b>${expiresInMinutes} minutos</b> e só pode ser usado uma vez.
              </p>
              <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#5B6B7A;">
                Se o botão não funcionar, copie e cole este endereço no navegador:<br>
                <a href="${url}" style="color:#213547;word-break:break-all;">${url}</a>
              </p>
              <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#5B6B7A;">
                Não pediu essa alteração? Pode ignorar este email — sua senha continua a mesma.
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top:20px;font-size:12px;line-height:1.5;color:#95A6BD;">
              Sinaliza · Repositório colaborativo de sinais em Libras<br>IFMG — Campus Ouro Branco
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `Olá, ${name.split(' ')[0] ?? name}!

Recebemos um pedido para redefinir a senha da sua conta no Sinaliza.
Acesse o link abaixo para criar uma nova senha (válido por ${expiresInMinutes} minutos):

${resetUrl}

Não pediu essa alteração? Ignore este email — sua senha continua a mesma.`;

  return { html, text };
}
