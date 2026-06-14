import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

// Retorna apenas os campos slim do sinal (igual ao endpoint disciplines/:id/signs)
const slimSignSelect = {
  sign: {
    select: {
      id: true,
      name: true,
      grammaticalClass: true,
      videoUrl: true,
      anotherUrl: true,
      createdAt: true,
    },
  },
};

@Injectable()
export class HistoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  // Registra (ou atualiza o horário de) o acesso ao sinal
  async register(userId: string, signId: string) {
    return this.prisma.history.upsert({
      where: { userId_signId: { userId, signId } },
      create: { userId, signId },
      update: { accessedAt: new Date() },
      select: { userId: true, signId: true, accessedAt: true },
    });
  }

  async findByUser(userId: string, limit: number) {
    const rows = await this.prisma.history.findMany({
      where: { userId },
      select: slimSignSelect,
      orderBy: { accessedAt: 'desc' },
      take: limit,
    });
    return rows.map((r) => r.sign);
  }

  // Remove um sinal específico do histórico do usuário
  async remove(userId: string, signId: string) {
    return this.prisma.history.deleteMany({
      where: { userId, signId },
    });
  }

  // Limpa todo o histórico do usuário
  async clear(userId: string) {
    return this.prisma.history.deleteMany({
      where: { userId },
    });
  }
}
