import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

const categorySelect = {
  id: true,
  name: true,
  value: true,
  createdAt: true,
  updatedAt: true,
};

@Injectable()
export class CategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: { name: string; value: string }) {
    return this.prisma.category.create({ data, select: categorySelect });
  }

  findAll(search?: string) {
    return this.prisma.category.findMany({
      where: search ? { name: { contains: search, mode: 'insensitive' } } : undefined,
      select: categorySelect,
      orderBy: { name: 'asc' },
    });
  }

  findById(id: string) {
    return this.prisma.category.findUnique({ where: { id }, select: categorySelect });
  }

  findByValue(value: string) {
    return this.prisma.category.findUnique({ where: { value } });
  }

  countSigns(id: string) {
    return this.prisma.sign.count({ where: { categoryId: id } });
  }

  delete(id: string) {
    return this.prisma.category.delete({ where: { id } });
  }
}
