import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '@/database/prisma.service';
import { EmailService } from '@modules/email/email.service';
import { resetPasswordTemplate } from '@modules/email/templates/reset-password.template';

const TOKEN_TTL_MINUTES = 60;

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

@Injectable()
export class PasswordResetService {
  private readonly logger = new Logger(PasswordResetService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly config: ConfigService,
  ) {}

  // Sempre termina "com sucesso" para quem chama: responder diferente para
  // email inexistente entregaria quais contas existem na plataforma.
  async requestReset(email: string) {
    const user = await this.prisma.user.findFirst({
      where: { email: { equals: email.trim(), mode: 'insensitive' } },
      select: { id: true, name: true, email: true, status: true },
    });
    if (!user?.email || !user.status) return;

    const token = randomBytes(32).toString('hex');

    // Um link por vez: pedir de novo invalida os anteriores ainda não usados
    await this.prisma.$transaction([
      this.prisma.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } }),
      this.prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash: hashToken(token),
          expiresAt: new Date(Date.now() + TOKEN_TTL_MINUTES * 60_000),
        },
      }),
    ]);

    const frontendUrl = (this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:5173').replace(/\/+$/, '');
    const { html, text } = resetPasswordTemplate({
      name: user.name,
      resetUrl: `${frontendUrl}/auth/reset-password?token=${token}`,
      logoUrl: `${frontendUrl}/logo/logo-simples.png`,
      expiresInMinutes: TOKEN_TTL_MINUTES,
    });

    try {
      await this.emailService.send({ to: user.email, subject: 'Redefinir sua senha — Sinaliza', html, text });
    } catch (err) {
      // Não vaza a falha para o cliente (mesma resposta de sempre); fica no log
      this.logger.error(`Não foi possível enviar o email de recuperação para ${user.email}`, err as Error);
    }
  }

  async resetPassword(token: string, password: string) {
    const record = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash: hashToken(token) },
    });

    if (!record || record.usedAt || record.expiresAt < new Date()) {
      throw new BadRequestException('Link inválido ou expirado. Peça um novo email de recuperação.');
    }

    const hashed = await bcrypt.hash(password, 10);
    await this.prisma.$transaction([
      // Redefinir a senha também libera um eventual bloqueio por tentativas
      this.prisma.user.update({
        where: { id: record.userId },
        data: { password: hashed, failedLoginAttempts: 0, lockedUntil: null },
      }),
      this.prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    ]);
  }
}
