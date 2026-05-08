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
import { ClassRole, Role } from '@common/enums/enum';

const ROLE_TO_CLASS_ROLE: Record<Role, ClassRole> = {
  [Role.STUDENT]:  ClassRole.STUDENT,
  [Role.GUARDIAN]: ClassRole.FAMILY,
  [Role.EDUCATOR]: ClassRole.EDUCATOR,
  [Role.ADMIN]:    ClassRole.EDUCATOR,
};

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

  // ── Listar todas as disciplinas do usuário (criadas + matriculadas) ─
  async findMine(userId: string) {
    const [created, enrollments] = await Promise.all([
      this.disciplineRepository.findAllByTeacher(userId),
      this.disciplineRepository.findAllByStudent(userId),
    ]);

    const map = new Map<string, any>();

    for (const d of created) {
      map.set(d.id, { ...transformDisciplineCard(d), canManage: true });
    }

    for (const e of enrollments) {
      const d = e.discipline;
      if (!map.has(d.id)) {
        map.set(d.id, {
          ...transformDisciplineCard(d),
          canManage: d.teacherId === userId,
        });
      }
    }

    return Array.from(map.values());
  }

  // ── @deprecated — mantidos para retrocompatibilidade ─────────────
  async findAllByTeacher(teacherId: string) {
    const disciplines = await this.disciplineRepository.findAllByTeacher(teacherId);
    return disciplines.map(d => ({ ...transformDisciplineCard(d), canManage: true }));
  }

  async findAllByStudent(userId: string) {
    const enrollments = await this.disciplineRepository.findAllByStudent(userId);
    return enrollments.map(e => ({
      ...transformDisciplineCard(e.discipline),
      canManage: e.discipline.teacherId === userId,
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
  async join(userId: string, userRole: Role, dto: JoinDisciplineDto) {
    const discipline = await this.disciplineRepository.findByClassCode(dto.classCode);

    if (!discipline) throw new NotFoundException('Código de disciplina inválido');
    if (!discipline.isActive) throw new ForbiddenException('Esta disciplina está arquivada');

    const alreadyEnrolled = await this.disciplineRepository.findEnrollment(userId, discipline.id);
    if (alreadyEnrolled) throw new ConflictException('Você já está matriculado nesta disciplina');

    const roleInClass = ROLE_TO_CLASS_ROLE[userRole];
    await this.disciplineRepository.enroll(userId, discipline.id, roleInClass);
    return transformDiscipline(discipline);
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
