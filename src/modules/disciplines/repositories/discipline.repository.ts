import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { CreateDisciplineDto } from '../dto/create-discipline.dto';
import { UpdateDisciplineDto } from '../dto/update-discipline.dto';
import { ClassRole } from '@common/enums/enum';

const disciplineCardSelect = {
  id: true,
  name: true,
  colorBackground: true,
  classCode: true,
  schoolYear: true,
  schoolLevel: true,
  isActive: true,
  teacherId: true,
  teacher: {
    select: { name: true },
  },
  _count: {
    select: { enrollments: true },
  },
};

const disciplineDetailSelect = {
  id: true,
  name: true,
  description: true,
  colorBackground: true,
  classCode: true,
  schoolYear: true,
  schoolLevel: true,
  isActive: true,
  teacherId: true,
  createdAt: true,
  updatedAt: true,
  teacher: {
    select: {
      id: true,
      name: true,
      avatar: true,
      educator: { select: { educatorType: true } },
    },
  },
  _count: {
    select: { enrollments: true },
  },
};

@Injectable()
export class DisciplineRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(teacherId: string, dto: CreateDisciplineDto, classCode: string) {
    return this.prisma.discipline.create({
      data: {
        name: dto.name,
        description: dto.description,
        colorBackground: dto.colorBackground,
        classCode,
        schoolYear: dto.schoolYear,
        schoolLevel: dto.schoolLevel,
        teacherId,
      },
      select: disciplineDetailSelect,
    });
  }

  async findAllByTeacher(teacherId: string) {
    return this.prisma.discipline.findMany({
      where: { teacherId },
      select: disciplineCardSelect,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllByStudent(userId: string) {
    return this.prisma.disciplineEnrollment.findMany({
      where: { userId },
      select: {
        roleInClass: true,
        createdAt: true,
        discipline: { select: disciplineCardSelect },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    return this.prisma.discipline.findUnique({
      where: { id },
      select: disciplineDetailSelect,
    });
  }

  async findByClassCode(classCode: string) {
    return this.prisma.discipline.findUnique({
      where: { classCode },
      select: disciplineDetailSelect,
    });
  }

  async update(id: string, dto: UpdateDisciplineDto) {
    return this.prisma.discipline.update({
      where: { id },
      data: dto,
      select: disciplineDetailSelect,
    });
  }

  async delete(id: string) {
    return this.prisma.discipline.delete({ where: { id } });
  }

  async enroll(userId: string, disciplineId: string, roleInClass: ClassRole) {
    return this.prisma.disciplineEnrollment.create({
      data: { userId, disciplineId, roleInClass },
    });
  }

  async findEnrollment(userId: string, disciplineId: string) {
    return this.prisma.disciplineEnrollment.findUnique({
      where: { userId_disciplineId: { userId, disciplineId } },
    });
  }

  async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      select: { id: true, roles: true },
    });
  }

  async findMembers(disciplineId: string) {
    return this.prisma.disciplineEnrollment.findMany({
      where: { disciplineId },
      select: {
        roleInClass: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            roles: true,
            educator: { select: { educatorType: true } },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async unenroll(userId: string, disciplineId: string) {
    return this.prisma.disciplineEnrollment.delete({
      where: { userId_disciplineId: { userId, disciplineId } },
    });
  }

  async findSignsByDiscipline(disciplineId: string) {
    return this.prisma.sign.findMany({
      where: { disciplines: { some: { id: disciplineId } } },
      select: {
        id: true,
        name: true,
        videoUrl: true,
        anotherUrl: true,
        createdAt: true,
        category: { select: { id: true, name: true, value: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findParams(type: string) {
    return this.prisma.param.findMany({
      where: { type, isActive: true },
      select: { label: true, value: true },
      orderBy: { order: 'asc' },
    });
  }
}
