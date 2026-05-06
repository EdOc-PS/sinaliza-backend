import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { CreateDisciplineDto } from '../dto/create-discipline.dto';
import { UpdateDisciplineDto } from '../dto/update-discipline.dto';
import { ClassRole } from '@common/enums/enum';

// Campos públicos retornados da disciplina
const disciplineSelect = {
  id: true,
  name: true,
  colorBackground: true,
  classCode: true,
  schoolYear: true,
  schoolLevel: true,
  isActive: true,
  teacher: {
    select: { id: true, name: true, avatar: true },
  }
};

@Injectable()
export class DisciplineRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ── Criar disciplina ──────────────────────────────────────────────
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
      select: disciplineSelect,
    });
  }

  // ── Listar disciplinas do professor ───────────────────────────────
  async findAllByTeacher(teacherId: string) {
    return this.prisma.discipline.findMany({
      where: { teacherId },
      select: disciplineSelect,
      orderBy: { createdAt: 'desc' },
    });
  }

  // ── Listar disciplinas em que o usuário está matriculado ──────────
  async findAllByStudent(userId: string) {
    return this.prisma.disciplineEnrollment.findMany({
      where: { userId },
      select: {
        roleInClass: true,
        createdAt: true,
        discipline: { select: disciplineSelect },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ── Buscar disciplina por ID ──────────────────────────────────────
  async findById(id: string) {
    return this.prisma.discipline.findUnique({
      where: { id },
      select: disciplineSelect,
    });
  }

  // ── Buscar disciplina por classCode ───────────────────────────────
  async findByClassCode(classCode: string) {
    return this.prisma.discipline.findUnique({
      where: { classCode },
      select: disciplineSelect,
    });
  }

  // ── Atualizar disciplina ──────────────────────────────────────────
  async update(id: string, dto: UpdateDisciplineDto) {
    return this.prisma.discipline.update({
      where: { id },
      data: dto,
      select: disciplineSelect,
    });
  }

  // ── Deletar disciplina ────────────────────────────────────────────
  async delete(id: string) {
    return this.prisma.discipline.delete({ where: { id } });
  }

  // ── Matricular usuário na disciplina ─────────────────────────────
  async enroll(userId: string, disciplineId: string, roleInClass: ClassRole) {
    return this.prisma.disciplineEnrollment.create({
      data: { userId, disciplineId, roleInClass },
    });
  }

  // ── Verificar se usuário já está matriculado ──────────────────────
  async findEnrollment(userId: string, disciplineId: string) {
    return this.prisma.disciplineEnrollment.findUnique({
      where: { userId_disciplineId: { userId, disciplineId } },
    });
  }

  // ── Listar membros de uma disciplina ─────────────────────────────
  async findMembers(disciplineId: string) {
    return this.prisma.disciplineEnrollment.findMany({
      where: { disciplineId },
      select: {
        roleInClass: true,
        createdAt: true,
        user: {
          select: { id: true, name: true, avatar: true, role: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  // ── Remover matrícula ─────────────────────────────────────────────
  async unenroll(userId: string, disciplineId: string) {
    return this.prisma.disciplineEnrollment.delete({
      where: { userId_disciplineId: { userId, disciplineId } },
    });
  }

  // ── Listar parâmetros por tipo ────────────────────────────────────
  async findParams(type: string) {
    return this.prisma.param.findMany({
      where: { type, isActive: true },
      select: { label: true, value: true },
      orderBy: { order: 'asc' },
    });
  }
}
