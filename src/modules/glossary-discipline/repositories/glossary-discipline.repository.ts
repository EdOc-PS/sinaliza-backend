import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

const glossaryDisciplineSelect = {
  id: true,
  name: true,
  description: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { signs: true } },
};

@Injectable()
export class GlossaryDisciplineRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: { name: string; description?: string | null }) {
    return this.prisma.glossaryDiscipline.create({ data, select: glossaryDisciplineSelect });
  }

  findAll(search?: string) {
    return this.prisma.glossaryDiscipline.findMany({
      where: search ? { name: { contains: search, mode: 'insensitive' } } : undefined,
      select: glossaryDisciplineSelect,
      orderBy: { name: 'asc' },
    });
  }

  findById(id: string) {
    return this.prisma.glossaryDiscipline.findUnique({ where: { id }, select: glossaryDisciplineSelect });
  }

  update(id: string, data: { name?: string; description?: string | null }) {
    return this.prisma.glossaryDiscipline.update({ where: { id }, data, select: glossaryDisciplineSelect });
  }

  delete(id: string) {
    return this.prisma.glossaryDiscipline.delete({ where: { id } });
  }

  // Quantas das ids informadas realmente existem (validação ao promover um sinal)
  countByIds(ids: string[]) {
    return this.prisma.glossaryDiscipline.count({ where: { id: { in: ids } } });
  }
}
