import { PrismaService } from '@/database/prisma.service';
import { Injectable } from '@nestjs/common';

import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class UsersRepository {
  constructor(private prisma: PrismaService) { }

  findAll() {
    return this.prisma.user.findMany();
  }

  async findOne(id: number) {
    return this.prisma.user.findUnique({
      where: { id: Number(id) },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email: email},
    });
  }

  async delete(id: number) {
    return this.prisma.user.delete({
      where: { id: Number(id) },
    });
  }

  async update(id: number, updatedUser: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id: Number(id) },
      data: updatedUser,
    });
  }
}