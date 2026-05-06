import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { DisciplineRepository } from './repositories/discipline.repository';
import { CreateDisciplineDto } from './dto/create-discipline.dto';
import { UpdateDisciplineDto } from './dto/update-discipline.dto';
import { JoinDisciplineDto } from './dto/join-discipline.dto';

// Detalhe completo (/disciplines/:id, create, update) — mantém objeto teacher
const transformDiscipline = (discipline: any) => {
  const { _count, ...rest } = discipline;
  return {
    ...rest,
    userCount: _count?.enrollments || 0,
  };
};

// Card resumido (/disciplines/mine, /enrolled) — achata teacher.name → teacherName
const transformDisciplineCard = (discipline: any) => {
  const { _count, teacher, ...rest } = discipline;
  return {
    ...rest,
    teacherName: teacher?.name ?? null,
    userCount: _count?.enrollments || 0,
  };
};

@Injectable()
export class DisciplineService {
  constructor(private readonly disciplineRepository: DisciplineRepository) {}

  // ── Criar disciplina ──────────────────────────────────────────────
  async create(teacherId: string, dto: CreateDisciplineDto) {
    const classCode = this.generateClassCode();
    const discipline = await this.disciplineRepository.create(teacherId, dto, classCode);
    return transformDiscipline(discipline);
  }

  // ── Listar disciplinas do professor logado ────────────────────────
  async findAllByTeacher(teacherId: string) {
    const disciplines = await this.disciplineRepository.findAllByTeacher(teacherId);
    return disciplines.map(transformDisciplineCard);
  }

  // ── Listar disciplinas em que o aluno está matriculado ────────────
  async findAllByStudent(userId: string) {
    const enrollments = await this.disciplineRepository.findAllByStudent(userId);
    return enrollments.map(e => ({
      ...e,
      discipline: transformDisciplineCard(e.discipline),
    }));
  }

  // ── Buscar disciplina por ID (validando acesso) ───────────────────
  async findById(id: string) {
    const discipline = await this.disciplineRepository.findById(id);
    if (!discipline) throw new NotFoundException('Disciplina não encontrada');
    return transformDiscipline(discipline);
  }

  // ── Atualizar disciplina (apenas o professor dono) ────────────────
  async update(id: string, teacherId: string, dto: UpdateDisciplineDto) {
    const discipline = await this.findById(id);

    if (discipline.teacher.id !== teacherId) {
      throw new ForbiddenException('Apenas o professor da disciplina pode editá-la');
    }

    return this.disciplineRepository.update(id, dto);
  }

  // ── Deletar disciplina (apenas o professor dono) ──────────────────
  async delete(id: string, teacherId: string) {
    const discipline = await this.findById(id);

    if (discipline.teacher.id !== teacherId) {
      throw new ForbiddenException('Apenas o professor da disciplina pode excluí-la');
    }

    return this.disciplineRepository.delete(id);
  }

  // ── Entrar na disciplina pelo classCode ───────────────────────────
  async join(userId: string, dto: JoinDisciplineDto) {
    const discipline = await this.disciplineRepository.findByClassCode(dto.classCode);

    if (!discipline) throw new NotFoundException('Código de disciplina inválido');
    if (!discipline.isActive) throw new ForbiddenException('Esta disciplina está arquivada');

    const alreadyEnrolled = await this.disciplineRepository.findEnrollment(
      userId,
      discipline.id,
    );
    if (alreadyEnrolled) throw new ConflictException('Você já está matriculado nesta disciplina');

    await this.disciplineRepository.enroll(userId, discipline.id, dto.roleInClass);
    return discipline;
  }

  // ── Listar membros de uma disciplina ─────────────────────────────
  async findMembers(id: string, requesterId: string) {
    const discipline = await this.findById(id);

    return this.disciplineRepository.findMembers(id);
  }

  // ── Sair da disciplina ────────────────────────────────────────────
  async leave(userId: string, disciplineId: string) {
    const enrollment = await this.disciplineRepository.findEnrollment(userId, disciplineId);
    if (!enrollment) throw new NotFoundException('Matrícula não encontrada');

    return this.disciplineRepository.unenroll(userId, disciplineId);
  }

  // ── Listar níveis escolares ───────────────────────────────────────
  async findSchoolLevels() {
    return this.disciplineRepository.findParams('SCHOOL_LEVEL');
  }

  // ── Gerar classCode aleatório ─────────────────────────────────────
  private generateClassCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    return Array.from({ length: 6 }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length)),
    ).join('');
  }
}
