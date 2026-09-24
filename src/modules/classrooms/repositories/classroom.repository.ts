import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { CreateClassroomDto } from '../dto/create-classroom.dto';
import { UpdateClassroomDto } from '../dto/update-classroom.dto';
import { ClassRole } from '@common/enums/enum';

const classroomCardSelect = {
  id: true,
  name: true,
  colorBackground: true,
  classCode: true,
  isActive: true,
  isContext: true,
  teacherId: true,
  teacher: {
    select: { name: true, avatar: true },
  },
  _count: {
    select: { enrollments: true },
  },
};

const classroomDetailSelect = {
  id: true,
  name: true,
  description: true,
  colorBackground: true,
  classCode: true,
  isActive: true,
  isContext: true,
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
export class ClassroomRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(teacherId: string, dto: CreateClassroomDto, classCode: string) {
    return this.prisma.classroom.create({
      data: {
        name: dto.name,
        description: dto.description,
        colorBackground: dto.colorBackground,
        classCode,
        teacherId,
      },
      select: classroomDetailSelect,
    });
  }

  async findAllByTeacher(teacherId: string) {
    return this.prisma.classroom.findMany({
      where: { teacherId },
      select: classroomCardSelect,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllByStudent(userId: string) {
    return this.prisma.classroomEnrollment.findMany({
      where: { userId },
      select: {
        roleInClass: true,
        createdAt: true,
        classroom: { select: classroomCardSelect },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    return this.prisma.classroom.findUnique({
      where: { id },
      select: classroomDetailSelect,
    });
  }

  async findByClassCode(classCode: string) {
    return this.prisma.classroom.findUnique({
      where: { classCode },
      select: classroomDetailSelect,
    });
  }

  async update(id: string, dto: UpdateClassroomDto) {
    return this.prisma.classroom.update({
      where: { id },
      data: dto,
      select: classroomDetailSelect,
    });
  }

  async delete(id: string) {
    return this.prisma.classroom.delete({ where: { id } });
  }

  async enroll(userId: string, classroomId: string, roleInClass: ClassRole) {
    return this.prisma.classroomEnrollment.create({
      data: { userId, classroomId, roleInClass },
    });
  }

  // Turma Contexto (matrícula automática de alunos e educadores)
  async findContextClassroom() {
    return this.prisma.classroom.findFirst({
      where: { isContext: true },
      select: { id: true },
    });
  }

  // Matrícula idempotente — não falha se o usuário já estiver na turma
  async enrollIfAbsent(userId: string, classroomId: string, roleInClass: ClassRole) {
    return this.prisma.classroomEnrollment.upsert({
      where: { userId_classroomId: { userId, classroomId } },
      create: { userId, classroomId, roleInClass },
      update: {},
    });
  }

  async findEnrollment(userId: string, classroomId: string) {
    return this.prisma.classroomEnrollment.findUnique({
      where: { userId_classroomId: { userId, classroomId } },
    });
  }

  async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      select: { id: true, roles: true },
    });
  }

  async findMembers(classroomId: string) {
    return this.prisma.classroomEnrollment.findMany({
      where: { classroomId },
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

  async unenroll(userId: string, classroomId: string) {
    return this.prisma.classroomEnrollment.delete({
      where: { userId_classroomId: { userId, classroomId } },
    });
  }

  async findSignsByClassroom(classroomId: string) {
    return this.prisma.sign.findMany({
      where: { classrooms: { some: { id: classroomId } } },
      select: {
        id: true,
        name: true,
        slug: true,
        videoUrl: true,
        anotherUrl: true,
        createdAt: true,
        category: { select: { id: true, name: true, value: true } },
      },
      orderBy: { name: 'asc' },
    });
  }
}
