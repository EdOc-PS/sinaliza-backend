// Template genérico dos avisos do Sinaliza — mesmo layout dos emails de conta
// (tabelas + estilos inline). Os textos chegam prontos; aqui só se escapa e monta.

export type NoticeTone = 'success' | 'danger' | 'info';

export interface NoticeTemplateData {
  name: string;
  tone: NoticeTone;
  badge: string;
  title: string;
  preheader: string;
  /** Parágrafos em texto puro (são escapados) */
  paragraphs: string[];
  /** Bloco em destaque, ex: motivo de uma recusa */
  highlight?: { label: string; text: string };
  button?: { label: string; url: string };
  logoUrl: string;
}

export const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

// success = lime, danger = salmon, info = sky (cores do tema)
const TONES: Record<NoticeTone, { bg: string; color: string }> = {
  success: { bg: '#EEF3D2', color: '#6B7A1F' },
  danger: { bg: '#FBE3E3', color: '#B25454' },
  info: { bg: '#DDF0F7', color: '#2F7E9C' },
};

export function noticeTemplate(data: NoticeTemplateData) {
  const { name, tone, badge, title, preheader, paragraphs, highlight, button, logoUrl } = data;
  const firstName = name.split(' ')[0] ?? name;
  const colors = TONES[tone];

  const body = paragraphs
    .map((p, i) => `<p style="margin:${i === 0 ? '0' : '12px 0 0'};font-size:15px;line-height:1.6;color:#5B6B7A;">${escapeHtml(p)}</p>`)
    .join('\n              ');

  const highlightHtml = highlight
    ? `<div style="margin-top:16px;padding:16px;border-radius:16px;background:${colors.bg};">
                <p style="margin:0 0 4px;font-size:12px;font-weight:bold;color:${colors.color};">${escapeHtml(highlight.label)}</p>
                <p style="margin:0;font-size:15px;line-height:1.6;color:#213547;white-space:pre-line;">${escapeHtml(highlight.text)}</p>
              </div>`
    : '';

  const buttonHtml = button
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
                <tr>
                  <td align="center" style="border-radius:16px;background:#213547;">
                    <a href="${escapeHtml(button.url)}" target="_blank" style="display:block;padding:16px 24px;font-size:15px;font-weight:bold;color:#F5F9FC;text-decoration:none;border-radius:16px;">
                      ${escapeHtml(button.label)}
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
<title>${escapeHtml(title)} — Sinaliza</title>
</head>
<body style="margin:0;padding:0;background:#F5F9FC;font-family:'Segoe UI',Helvetica,Arial,sans-serif;color:#213547;">
  <span style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</span>
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
              <span style="display:inline-block;margin-bottom:16px;padding:6px 12px;border-radius:10px;background:${colors.bg};color:${colors.color};font-size:12px;font-weight:bold;">${escapeHtml(badge)}</span>
              <h1 style="margin:0 0 8px;font-family:Georgia,'Libre Baskerville',serif;font-size:26px;line-height:1.3;color:#213547;">
                Olá, <span style="color:#E6AB6E;font-style:italic;">${escapeHtml(firstName)}</span>
              </h1>
              <p style="margin:0 0 8px;font-size:17px;font-weight:bold;color:#213547;">${escapeHtml(title)}</p>
              ${body}
              ${highlightHtml}
              ${buttonHtml}
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

  const text = [
    `Olá, ${firstName}!`,
    title,
    ...paragraphs,
    ...(highlight ? [`${highlight.label}: ${highlight.text}`] : []),
    ...(button ? [`${button.label}: ${button.url}`] : []),
  ].join('\n\n');

  return { html, text, subject: `${title} — Sinaliza` };
}
