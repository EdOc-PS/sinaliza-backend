import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend | null;
  private readonly from: string;

  constructor(config: ConfigService) {
    const apiKey = config.get<string>('RESEND_API_KEY');
    this.from = config.get<string>('EMAIL_FROM') ?? 'Sinaliza <onboarding@resend.dev>';
    // Sem chave (ex: dev local) o envio vira só log, em vez de derrubar o boot
    this.resend = apiKey ? new Resend(apiKey) : null;
    if (!apiKey) this.logger.warn('RESEND_API_KEY não definido — emails não serão enviados.');
  }

  async send({ to, subject, html, text }: SendEmailInput) {
    if (!this.resend) {
      this.logger.warn(`Email para ${to} não enviado (sem RESEND_API_KEY): ${subject}`);
      return;
    }
    const { error } = await this.resend.emails.send({ from: this.from, to, subject, html, text });
    if (error) {
      this.logger.error(`Falha ao enviar email para ${to}: ${error.message}`);
      throw new Error(error.message);
    }
  }
}
