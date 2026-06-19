import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { GrammaticalClass } from '@prisma/client';

interface CreateSignData {
  name: string;
  grammaticalClass: GrammaticalClass;
  handConfigId: string;
  creatorId: string;
  disciplineId?: string | null;
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
  grammaticalClass?: GrammaticalClass;
  handConfigId?: string;
  disciplineId?: string | null;
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
  grammaticalClass?: GrammaticalClass;
  handConfigId?: string;
  tag?: string;
}

const signSelect = {
  id: true,
  name: true,
  grammaticalClass: true,
  handConfigId: true,
  videoUrl: true,
  anotherUrl: true,
  imgUrl: true,
  examplePt: true,
  exampleLibras: true,
  movementDescription: true,
  tags: true,
  disciplineId: true,
  creatorId: true,
  createdAt: true,
  updatedAt: true,
  handConfig: { select: { id: true, name: true, imgUrl: true } },
  discipline: { select: { id: true, name: true } },
};

@Injectable()
export class SignRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateSignData) {
    return this.prisma.sign.create({
      data: {
        ...data,
        tags: data.tags ?? [],
      },
      select: signSelect,
    });
  }

  async findAll(filters: FindAllFilters = {}) {
    const { search, grammaticalClass, handConfigId, tag } = filters;

    return this.prisma.sign.findMany({
      where: {
        ...(search && { name: { contains: search, mode: 'insensitive' } }),
        ...(grammaticalClass && { grammaticalClass }),
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
    return this.prisma.sign.update({
      where: { id },
      data,
      select: signSelect,
    });
  }

  async delete(id: string) {
    return this.prisma.sign.delete({ where: { id } });
  }
}
