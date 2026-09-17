import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

// Retorna apenas os campos slim do sinal (igual ao endpoint classrooms/:id/signs)
const slimSignSelect = {
  sign: {
    select: {
      id: true,
      name: true,
      slug: true,
      videoUrl: true,
      anotherUrl: true,
      createdAt: true,
      category: { select: { id: true, name: true, value: true } },
    },
  },
};

@Injectable()
export class HistoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  // Registra o acesso ao sinal — cria a linha (accessCount 1) ou incrementa
  // o contador de quem já acessou antes
  async register(userId: string, signId: string) {
    return this.prisma.history.upsert({
      where: { userId_signId: { userId, signId } },
      create: { userId, signId },
      update: { accessedAt: new Date(), accessCount: { increment: 1 } },
      select: { userId: true, signId: true, accessedAt: true, accessCount: true },
    });
  }

  // Soma de acessos por sinal — usado no ranking de mais/menos usados do dashboard.
  // `signIds` restringe a soma a um conjunto (ex: sinais de uma turma).
  async sumAccessBySign(signIds?: string[]) {
    const rows = await this.prisma.history.groupBy({
      by: ['signId'],
      _sum: { accessCount: true },
      ...(signIds ? { where: { signId: { in: signIds } } } : {}),
    });
    return new Map(rows.map((r) => [r.signId, r._sum.accessCount ?? 0]));
  }

  async findByUser(userId: string, limit: number) {
    const rows = await this.prisma.history.findMany({
      where: { userId },
      select: { ...slimSignSelect, accessedAt: true },
      orderBy: { accessedAt: 'desc' },
      take: limit,
    });
    return rows.map((r) => ({ ...r.sign, accessedAt: r.accessedAt }));
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
