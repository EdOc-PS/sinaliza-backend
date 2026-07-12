import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

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
  createdAt: true,
  updatedAt: true,
  category: { select: { id: true, name: true, value: true } },
  handConfig: { select: { id: true, name: true, imgUrl: true } },
  disciplines: { select: { id: true, name: true } },
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
    const { search, categoryId, handConfigId, tag } = filters;

    return this.prisma.sign.findMany({
      where: {
        ...(search && { name: { contains: search, mode: 'insensitive' } }),
        ...(categoryId && { categoryId }),
        ...(handConfigId && { handConfigId }),
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
}
