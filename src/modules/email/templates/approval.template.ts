interface ApprovalTemplateData {
  name: string;
  approved: boolean;
  loginUrl: string;
  logoUrl: string;
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

// Mesmo layout do email de recuperação de senha (tabelas + estilos inline).
// Aprovado usa o verde lime; recusado usa o salmon do tema.
export function approvalTemplate({ name, approved, loginUrl, logoUrl }: ApprovalTemplateData) {
  const firstName = escapeHtml(name.split(' ')[0] ?? name);
  const url = escapeHtml(loginUrl);

  const title = approved ? 'Sua conta foi aprovada!' : 'Sua solicitação foi recusada';
  const preheader = approved
    ? 'Seu acesso ao Sinaliza foi liberado.'
    : 'Sua solicitação de acesso ao Sinaliza não foi aprovada.';
  const message = approved
    ? 'Boas notícias: um gestor da instituição aprovou seu cadastro. Você já pode entrar e acessar suas turmas, o glossário e seus favoritos.'
    : 'Um gestor da instituição analisou seu cadastro e, por enquanto, ele não foi aprovado. Se acredita que houve um engano, procure a coordenação do seu curso — a decisão pode ser revista.';
  const badge = approved
    ? { bg: '#EEF3D2', color: '#6B7A1F', text: 'Acesso liberado' }
    : { bg: '#FBE3E3', color: '#B25454', text: 'Acesso não liberado' };

  const button = approved
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
                <tr>
                  <td align="center" style="border-radius:16px;background:#213547;">
                    <a href="${url}" target="_blank" style="display:block;padding:16px 24px;font-size:15px;font-weight:bold;color:#F5F9FC;text-decoration:none;border-radius:16px;">
                      Entrar no Sinaliza
                    </a>
                  </td>
                </tr>
              </table>`
    : '';

  const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} — Sinaliza</title>
</head>
<body style="margin:0;padding:0;background:#F5F9FC;font-family:'Segoe UI',Helvetica,Arial,sans-serif;color:#213547;">
  <span style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</span>
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
              <span style="display:inline-block;margin-bottom:16px;padding:6px 12px;border-radius:10px;background:${badge.bg};color:${badge.color};font-size:12px;font-weight:bold;">${badge.text}</span>
              <h1 style="margin:0 0 8px;font-family:Georgia,'Libre Baskerville',serif;font-size:26px;line-height:1.3;color:#213547;">
                Olá, <span style="color:#E6AB6E;font-style:italic;">${firstName}</span>
              </h1>
              <p style="margin:0 0 8px;font-size:17px;font-weight:bold;color:#213547;">${title}</p>
              <p style="margin:0;font-size:15px;line-height:1.6;color:#5B6B7A;">${message}</p>
              ${button}
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

${title}

${message}${approved ? `\n\nEntre em: ${loginUrl}` : ''}`;

  return { html, text, subject: `${title} — Sinaliza` };
}
