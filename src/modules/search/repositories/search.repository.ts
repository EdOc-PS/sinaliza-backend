import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { Prisma } from '@prisma/client';

interface SearchFilters {
  search?: string;
  handConfigId?: string;
  categoryId?: string;
}

// Card resumido (mesmo shape consumido pelo SignCard no front) + disciplinas de origem
const signCardSelect = {
  id: true,
  name: true,
  categoryId: true,
  videoUrl: true,
  anotherUrl: true,
  createdAt: true,
  category: { select: { id: true, name: true, value: true } },
  handConfig: { select: { id: true, name: true, imgUrl: true } },
  disciplines: { select: { id: true, name: true } },
};

@Injectable()
export class SearchRepository {
  constructor(private readonly prisma: PrismaService) {}

  // Disciplinas que o usuário leciona OU está matriculado
  private accessibleDisciplineFilter(userId: string): Prisma.DisciplineWhereInput {
    return {
      OR: [
        { teacherId: userId },
        { enrollments: { some: { userId } } },
      ],
    };
  }

  private buildSignFilter(filters: SearchFilters): Prisma.SignWhereInput {
    const { search, handConfigId, categoryId } = filters;
    return {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { tags: { has: search } },
        ],
      }),
      ...(handConfigId && { handConfigId }),
      ...(categoryId && { categoryId }),
    };
  }

  // Busca global: sinais de todas as disciplinas que o usuário tem acesso
  async searchAccessibleSigns(userId: string, filters: SearchFilters) {
    return this.prisma.sign.findMany({
      where: {
        disciplines: { some: this.accessibleDisciplineFilter(userId) },
        ...this.buildSignFilter(filters),
      },
      select: signCardSelect,
      orderBy: { name: 'asc' },
    });
  }

  // Busca dentro de uma disciplina específica
  async searchSignsInDiscipline(disciplineId: string, filters: SearchFilters) {
    return this.prisma.sign.findMany({
      where: {
        disciplines: { some: { id: disciplineId } },
        ...this.buildSignFilter(filters),
      },
      select: signCardSelect,
      orderBy: { name: 'asc' },
    });
  }

  // Dados mínimos do sinal base (para calcular semelhança)
  async findSignBasics(signId: string) {
    return this.prisma.sign.findUnique({
      where: { id: signId },
      select: { handConfigId: true, categoryId: true },
    });
  }

  // Candidatos a "semelhante": mesma config de mão OU mesma categoria,
  // acessíveis ao usuário (disciplina que participa) e excluindo o próprio sinal
  async findRelatedCandidates(
    userId: string,
    signId: string,
    handConfigId: string,
    categoryId: string,
  ) {
    return this.prisma.sign.findMany({
      where: {
        id: { not: signId },
        disciplines: { some: this.accessibleDisciplineFilter(userId) },
        OR: [{ handConfigId }, { categoryId }],
      },
      select: signCardSelect,
      orderBy: { name: 'asc' },
    });
  }

  // Verifica se o usuário tem acesso à disciplina (leciona ou matriculado)
  async hasDisciplineAccess(userId: string, disciplineId: string): Promise<boolean> {
    const discipline = await this.prisma.discipline.findFirst({
      where: {
        id: disciplineId,
        ...this.accessibleDisciplineFilter(userId),
      },
      select: { id: true },
    });
    return !!discipline;
  }
}
