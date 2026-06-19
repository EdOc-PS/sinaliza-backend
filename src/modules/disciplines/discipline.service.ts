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

// Deriva o papel na turma a partir das roles do usuário (maior privilégio primeiro)
const resolveClassRole = (roles: Role[]): ClassRole => {
  const priority: Role[] = [Role.EDUCATOR, Role.GUARDIAN, Role.STUDENT, Role.ADMIN];
  const role = priority.find((r) => roles.includes(r)) ?? Role.STUDENT;
  return ROLE_TO_CLASS_ROLE[role];
};

type LabelMap = Map<string, string>;

// Achata user.educator.educatorType -> user.educatorType
const flattenEducatorType = (user: any) => {
  if (!user) return user;
  const { educator, ...rest } = user;
  return { ...rest, educatorType: educator?.educatorType ?? null };
};

// Detalhe completo (/disciplines/:id, create, update) — mantém objeto teacher
const transformDiscipline = (discipline: any, labels?: LabelMap) => {
  const { _count, teacher, ...rest } = discipline;
  return {
    ...rest,
    teacher: flattenEducatorType(teacher),
    userCount: _count?.enrollments || 0,
    schoolLevelLabel: labels?.get(rest.schoolLevel) ?? rest.schoolLevel ?? null,
  };
};

// Card resumido (/disciplines/mine) — achata teacher.name → teacherName
const transformDisciplineCard = (discipline: any, labels?: LabelMap) => {
  const { _count, teacher, ...rest } = discipline;
  return {
    ...rest,
    teacherName: teacher?.name ?? null,
    userCount: _count?.enrollments || 0,
    schoolLevelLabel: labels?.get(rest.schoolLevel) ?? rest.schoolLevel ?? null,
  };
};

@Injectable()
export class DisciplineService {
  constructor(private readonly disciplineRepository: DisciplineRepository) {}

  async create(teacherId: string, dto: CreateDisciplineDto) {
    const classCode = this.generateClassCode();
    const discipline = await this.disciplineRepository.create(teacherId, dto, classCode);
    return transformDiscipline(discipline);
  }

  async findMine(userId: string) {
    const [created, enrollments, params] = await Promise.all([
      this.disciplineRepository.findAllByTeacher(userId),
      this.disciplineRepository.findAllByStudent(userId),
      this.disciplineRepository.findParams('SCHOOL_LEVEL'),
    ]);

    const labels: LabelMap = new Map(params.map(p => [p.value, p.label]));
    const map = new Map<string, any>();

    for (const d of created) {
      map.set(d.id, { ...transformDisciplineCard(d, labels), canManage: true });
    }

    for (const e of enrollments) {
      const d = e.discipline;
      if (!map.has(d.id)) {
        map.set(d.id, {
          ...transformDisciplineCard(d, labels),
          canManage: d.teacherId === userId,
        });
      }
    }

    return Array.from(map.values());
  }

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

  async findById(id: string) {
    const [discipline, params] = await Promise.all([
      this.disciplineRepository.findById(id),
      this.disciplineRepository.findParams('SCHOOL_LEVEL'),
    ]);
    if (!discipline) throw new NotFoundException('Disciplina não encontrada');
    const labels: LabelMap = new Map(params.map(p => [p.value, p.label]));
    return transformDiscipline(discipline, labels);
  }

  async update(id: string, teacherId: string, dto: UpdateDisciplineDto) {
    const discipline = await this.findById(id);

    if (discipline.teacher.id !== teacherId) {
      throw new ForbiddenException('Apenas o professor da disciplina pode editá-la');
    }

    return this.disciplineRepository.update(id, dto);
  }

  async delete(id: string, teacherId: string) {
    const discipline = await this.findById(id);

    if (discipline.teacher.id !== teacherId) {
      throw new ForbiddenException('Apenas o professor da disciplina pode excluí-la');
    }

    return this.disciplineRepository.delete(id);
  }

  async join(userId: string, userRoles: Role[], dto: JoinDisciplineDto) {
    const discipline = await this.disciplineRepository.findByClassCode(dto.classCode);

    if (!discipline) throw new NotFoundException('Código de disciplina inválido');
    if (!discipline.isActive) throw new ForbiddenException('Esta disciplina está arquivada');

    const alreadyEnrolled = await this.disciplineRepository.findEnrollment(userId, discipline.id);
    if (alreadyEnrolled) throw new ConflictException('Você já está matriculado nesta disciplina');

    const roleInClass = resolveClassRole(userRoles);
    await this.disciplineRepository.enroll(userId, discipline.id, roleInClass);
    return transformDiscipline(discipline);
  }

  async findMembers(id: string, requesterId: string) {
    const discipline = await this.findById(id);
    const members = await this.disciplineRepository.findMembers(id);
    return members.map((m) => ({ ...m, user: flattenEducatorType(m.user) }));
  }

  async leave(userId: string, disciplineId: string) {
    const enrollment = await this.disciplineRepository.findEnrollment(userId, disciplineId);
    if (!enrollment) throw new NotFoundException('Matrícula não encontrada');
    return this.disciplineRepository.unenroll(userId, disciplineId);
  }

  async findSigns(disciplineId: string) {
    const discipline = await this.disciplineRepository.findById(disciplineId);
    if (!discipline) throw new NotFoundException('Disciplina não encontrada');

    return this.disciplineRepository.findSignsByDiscipline(disciplineId);
  }

  async findSchoolLevels() {
    return this.disciplineRepository.findParams('SCHOOL_LEVEL');
  }

  private generateClassCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    return Array.from({ length: 6 }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length)),
    ).join('');
  }
}
