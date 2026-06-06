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
export class FavoriteRepository {
  constructor(private readonly prisma: PrismaService) {}

  async add(userId: string, signId: string) {
    return this.prisma.favorite.create({
      data: { userId, signId },
      select: { userId: true, signId: true, createdAt: true },
    });
  }

  async remove(userId: string, signId: string) {
    return this.prisma.favorite.delete({
      where: { userId_signId: { userId, signId } },
    });
  }

  async findByUser(userId: string) {
    const rows = await this.prisma.favorite.findMany({
      where: { userId },
      select: slimSignSelect,
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => r.sign);
  }

  async findByUserAndDiscipline(userId: string, disciplineId: string) {
    const rows = await this.prisma.favorite.findMany({
      where: { userId, sign: { disciplineId } },
      select: slimSignSelect,
      orderBy: { sign: { name: 'asc' } },
    });
    return rows.map((r) => r.sign);
  }

  async exists(userId: string, signId: string) {
    return this.prisma.favorite.findUnique({
      where: { userId_signId: { userId, signId } },
      select: { userId: true },
    });
  }
}
