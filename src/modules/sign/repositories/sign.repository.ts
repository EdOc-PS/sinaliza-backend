import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { GlobalStatus } from '@common/enums/enum';

interface CreateSignData {
  name: string;
  categoryId: string;
  handConfigId: string;
  creatorId: string;
  disciplineIds?: string[];
  institutionId?: string | null;
  videoUrl?: string | null;
  anotherUrl?: string | null;
  imgUrl?: string | null;
  examplePt?: string | null;
  exampleLibras?: string | null;
  movementDescription?: string | null;
  tags?: string[];
}

interface UpdateSignData {
  name?: string;
  categoryId?: string;
  handConfigId?: string;
  disciplineIds?: string[];
  videoUrl?: string | null;
  anotherUrl?: string | null;
  imgUrl?: string | null;
  examplePt?: string | null;
  exampleLibras?: string | null;
  movementDescription?: string | null;
  tags?: string[];
}

interface FindAllFilters {
  search?: string;
  categoryId?: string;
  handConfigId?: string;
  glossaryDisciplineId?: string;
  tag?: string;
}

const signSelect = {
  id: true,
  name: true,
  handConfigId: true,
  categoryId: true,
  videoUrl: true,
  anotherUrl: true,
  imgUrl: true,
  examplePt: true,
  exampleLibras: true,
  movementDescription: true,
  tags: true,
  creatorId: true,
  globalStatus: true,
  createdAt: true,
  updatedAt: true,
  category: { select: { id: true, name: true, value: true } },
  handConfig: { select: { id: true, name: true, imgUrl: true } },
  disciplines: { select: { id: true, name: true } },
  glossaryDisciplines: { select: { id: true, name: true } },
};

@Injectable()
export class SignRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateSignData) {
    const { disciplineIds, ...rest } = data;
    return this.prisma.sign.create({
      data: {
        ...rest,
        tags: data.tags ?? [],
        ...(disciplineIds && disciplineIds.length > 0
          ? { disciplines: { connect: disciplineIds.map((id) => ({ id })) } }
          : {}),
      },
      select: signSelect,
    });
  }

  async findAll(filters: FindAllFilters = {}) {
    const { search, categoryId, handConfigId, glossaryDisciplineId, tag } = filters;

    return this.prisma.sign.findMany({
      where: {
        ...(search && { name: { contains: search, mode: 'insensitive' } }),
        ...(categoryId && { categoryId }),
        ...(handConfigId && { handConfigId }),
        ...(glossaryDisciplineId && { glossaryDisciplines: { some: { id: glossaryDisciplineId } } }),
        ...(tag && { tags: { has: tag } }),
      },
      select: signSelect,
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string) {
    return this.prisma.sign.findUnique({
      where: { id },
      select: signSelect,
    });
  }

  async existsByName(name: string) {
    const sign = await this.prisma.sign.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    });
    return !!sign;
  }

  async update(id: string, data: UpdateSignData) {
    const { disciplineIds, ...rest } = data;
    return this.prisma.sign.update({
      where: { id },
      data: {
        ...rest,
        // Se disciplineIds veio, substitui o conjunto inteiro (set)
        ...(disciplineIds !== undefined
          ? { disciplines: { set: disciplineIds.map((did) => ({ id: did })) } }
          : {}),
      },
      select: signSelect,
    });
  }

  async delete(id: string) {
    return this.prisma.sign.delete({ where: { id } });
  }

  // Atualiza o status de promoção ao glossário global
  async updateGlobalStatus(id: string, globalStatus: GlobalStatus) {
    return this.prisma.sign.update({
      where: { id },
      data: { globalStatus },
      select: signSelect,
    });
  }

  // Promove o sinal (status PENDING) e associa às disciplinas do glossário informadas.
  // Se glossaryDisciplineIds vier, substitui o conjunto inteiro (set); [] limpa as associações.
  async promote(id: string, glossaryDisciplineIds?: string[]) {
    return this.prisma.sign.update({
      where: { id },
      data: {
        globalStatus: GlobalStatus.PENDING,
        ...(glossaryDisciplineIds !== undefined
          ? { glossaryDisciplines: { set: glossaryDisciplineIds.map((gid) => ({ id: gid })) } }
          : {}),
      },
      select: signSelect,
    });
  }

  // Sinais aguardando aprovação do gestor (promoções pendentes)
  async findPendingPromotions() {
    return this.prisma.sign.findMany({
      where: { globalStatus: GlobalStatus.PENDING },
      select: {
        id: true,
        name: true,
        videoUrl: true,
        anotherUrl: true,
        imgUrl: true,
        createdAt: true,
        category: { select: { id: true, name: true, value: true } },
        disciplines: { select: { id: true, name: true } },
      },
      orderBy: { updatedAt: 'asc' },
    });
  }

  // Sinais públicos (glossário global) — endpoint aberto, retorna dados slim
  async findGlobal(filters: FindAllFilters = {}) {
    const { search, categoryId, handConfigId, glossaryDisciplineId, tag } = filters;

    return this.prisma.sign.findMany({
      where: {
        globalStatus: GlobalStatus.PUBLIC,
        ...(search && { name: { contains: search, mode: 'insensitive' } }),
        ...(categoryId && { categoryId }),
        ...(handConfigId && { handConfigId }),
        ...(glossaryDisciplineId && { glossaryDisciplines: { some: { id: glossaryDisciplineId } } }),
        ...(tag && { tags: { has: tag } }),
      },
      select: {
        id: true,
        name: true,
        videoUrl: true,
        anotherUrl: true,
        imgUrl: true,
        createdAt: true,
        category: { select: { id: true, name: true, value: true } },
        glossaryDisciplines: { select: { id: true, name: true } },
      },
      orderBy: { name: 'asc' },
    });
  }
}
