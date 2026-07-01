import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { Prisma, GrammaticalClass } from '@prisma/client';

interface SearchFilters {
  search?: string;
  handConfigId?: string;
  grammaticalClass?: GrammaticalClass;
}

// Card resumido (mesmo shape consumido pelo SignCard no front) + disciplina de origem
const signCardSelect = {
  id: true,
  name: true,
  grammaticalClass: true,
  videoUrl: true,
  anotherUrl: true,
  createdAt: true,
  handConfig: { select: { id: true, name: true, imgUrl: true } },
  discipline: { select: { id: true, name: true } },
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
    const { search, handConfigId, grammaticalClass } = filters;
    return {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { tags: { has: search } },
        ],
      }),
      ...(handConfigId && { handConfigId }),
      ...(grammaticalClass && { grammaticalClass }),
    };
  }

  // Busca global: sinais de todas as disciplinas que o usuário tem acesso
  async searchAccessibleSigns(userId: string, filters: SearchFilters) {
    return this.prisma.sign.findMany({
      where: {
        discipline: { is: this.accessibleDisciplineFilter(userId) },
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
        disciplineId,
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
      select: { handConfigId: true, grammaticalClass: true },
    });
  }

  // Candidatos a "semelhante": mesma config de mão OU mesma classe gramatical,
  // acessíveis ao usuário (disciplina que participa) e excluindo o próprio sinal
  async findRelatedCandidates(
    userId: string,
    signId: string,
    handConfigId: string,
    grammaticalClass: GrammaticalClass,
  ) {
    return this.prisma.sign.findMany({
      where: {
        id: { not: signId },
        discipline: { is: this.accessibleDisciplineFilter(userId) },
        OR: [{ handConfigId }, { grammaticalClass }],
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
