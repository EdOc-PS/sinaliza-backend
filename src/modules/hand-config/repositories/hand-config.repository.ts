import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

interface CreateHandConfigData {
  name: string;
  imgUrl: string;
}

interface UpdateHandConfigData {
  name?: string;
  imgUrl?: string;
}

const handConfigSelect = {
  id: true,
  name: true,
  imgUrl: true,
  createdAt: true,
  updatedAt: true,
};

@Injectable()
export class HandConfigRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateHandConfigData) {
    return this.prisma.handConfig.create({
      data,
      select: handConfigSelect,
    });
  }

  async findAll(search?: string) {
    return this.prisma.handConfig.findMany({
      where: search
        ? { name: { contains: search, mode: 'insensitive' } }
        : undefined,
      select: handConfigSelect,
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string) {
    return this.prisma.handConfig.findUnique({
      where: { id },
      select: handConfigSelect,
    });
  }

  async findByName(name: string) {
    return this.prisma.handConfig.findFirst({
      where: { name: { contains: name, mode: 'insensitive' } },
      select: handConfigSelect,
    });
  }

  async existsByName(name: string) {
    const handConfig = await this.prisma.handConfig.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    });
    return !!handConfig;
  }

  async update(id: string, data: UpdateHandConfigData) {
    return this.prisma.handConfig.update({
      where: { id },
      data,
      select: handConfigSelect,
    });
  }

  async delete(id: string) {
    return this.prisma.handConfig.delete({ where: { id } });
  }
}
