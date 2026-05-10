import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { CreateHandConfigDto } from '../dto/create-hand-config.dto';
import { UpdateHandConfigDto } from '../dto/update-hand-config.dto';

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

  async create(dto: CreateHandConfigDto) {
    return this.prisma.handConfig.create({
      data: dto,
      select: handConfigSelect,
    });
  }

  async findAll() {
    return this.prisma.handConfig.findMany({
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

  async update(id: string, dto: UpdateHandConfigDto) {
    return this.prisma.handConfig.update({
      where: { id },
      data: dto,
      select: handConfigSelect,
    });
  }

  async delete(id: string) {
    return this.prisma.handConfig.delete({ where: { id } });
  }
}
