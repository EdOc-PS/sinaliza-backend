import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { Prisma } from '@prisma/client';

interface SearchFilters {
  search?: string;
  handConfigId?: string;
  categoryId?: string;
  glossaryDisciplineId?: string;
}

// Card resumido (mesmo shape consumido pelo SignCard no front) + turmas de origem
const signCardSelect = {
  id: true,
  name: true,
  slug: true,
  categoryId: true,
  videoUrl: true,
  anotherUrl: true,
  createdAt: true,
  category: { select: { id: true, name: true, value: true } },
  handConfig: { select: { id: true, name: true, imgUrl: true } },
  classrooms: { select: { id: true, name: true } },
};

@Injectable()
export class SearchRepository {
  constructor(private readonly prisma: PrismaService) {}

  // Turmas que o usuário leciona OU está matriculado
  private accessibleDisciplineFilter(userId: string): Prisma.ClassroomWhereInput {
    return {
      OR: [
        { teacherId: userId },
        { enrollments: { some: { userId } } },
      ],
    };
  }

  private buildSignFilter(filters: SearchFilters): Prisma.SignWhereInput {
    const { search, handConfigId, categoryId, glossaryDisciplineId } = filters;
    return {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { tags: { has: search } },
        ],
      }),
      ...(handConfigId && { handConfigId }),
      ...(categoryId && { categoryId }),
      ...(glossaryDisciplineId && { glossaryDisciplines: { some: { id: glossaryDisciplineId } } }),
    };
  }

  // Busca global: sinais de todas as turmas que o usuário tem acesso
  async searchAccessibleSigns(userId: string, filters: SearchFilters) {
    return this.prisma.sign.findMany({
      where: {
        classrooms: { some: this.accessibleDisciplineFilter(userId) },
        ...this.buildSignFilter(filters),
      },
      select: signCardSelect,
      orderBy: { name: 'asc' },
    });
  }

  // Busca dentro de uma turma específica
  async searchSignsInDiscipline(classroomId: string, filters: SearchFilters) {
    return this.prisma.sign.findMany({
      where: {
        classrooms: { some: { id: classroomId } },
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
  // acessíveis ao usuário (turma que participa) e excluindo o próprio sinal
  async findRelatedCandidates(
    userId: string,
    signId: string,
    handConfigId: string,
    categoryId: string,
  ) {
    return this.prisma.sign.findMany({
      where: {
        id: { not: signId },
        classrooms: { some: this.accessibleDisciplineFilter(userId) },
        OR: [{ handConfigId }, { categoryId }],
      },
      select: signCardSelect,
      orderBy: { name: 'asc' },
    });
  }

  // Verifica se o usuário tem acesso à turma (leciona ou matriculado)
  async hasDisciplineAccess(userId: string, classroomId: string): Promise<boolean> {
    const classroom = await this.prisma.classroom.findFirst({
      where: {
        id: classroomId,
        ...this.accessibleDisciplineFilter(userId),
      },
      select: { id: true },
    });
    return !!classroom;
  }
}
