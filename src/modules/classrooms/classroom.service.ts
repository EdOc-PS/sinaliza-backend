import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { ClassroomRepository } from './repositories/classroom.repository';
import { CreateClassroomDto } from './dto/create-classroom.dto';
import { UpdateClassroomDto } from './dto/update-classroom.dto';
import { JoinClassroomDto } from './dto/join-classroom.dto';
import { ClassRole, Role } from '@common/enums/enum';
import { HistoryService } from '@modules/history/history.service';

// Deriva o papel na turma a partir das roles do usuário.
// Educador (inclusive gestor, que é sempre educador) ensina; o resto aprende.
const resolveClassRole = (roles: Role[]): ClassRole =>
  roles.includes(Role.EDUCATOR) ? ClassRole.EDUCATOR : ClassRole.STUDENT;

// Achata user.educator.educatorType -> user.educatorType
const flattenEducatorType = (user: any) => {
  if (!user) return user;
  const { educator, ...rest } = user;
  return { ...rest, educatorType: educator?.educatorType ?? null };
};

// +1 porque quem criou a turma (teacherId) não tem uma linha própria em
// ClassroomEnrollment — sem isso o dono nunca entrava na contagem de membros.
const countMembers = (count: any) => (count?.enrollments || 0) + 1;

// Detalhe completo (/classrooms/:id, create, update) — mantém objeto teacher
const transformClassroom = (classroom: any) => {
  const { _count, teacher, ...rest } = classroom;
  return {
    ...rest,
    teacher: flattenEducatorType(teacher),
    userCount: countMembers(_count),
  };
};

// Card resumido (/classrooms/mine) — achata teacher.name → teacherName
const transformClassroomCard = (classroom: any) => {
  const { _count, teacher, ...rest } = classroom;
  return {
    ...rest,
    teacherName: teacher?.name ?? null,
    teacherAvatar: teacher?.avatar ?? null,
    userCount: countMembers(_count),
  };
};

@Injectable()
export class ClassroomService {
  constructor(
    private readonly classroomRepository: ClassroomRepository,
    private readonly historyService: HistoryService,
  ) {}

  async create(teacherId: string, dto: CreateClassroomDto) {
    const classCode = this.generateClassCode();
    const classroom = await this.classroomRepository.create(teacherId, dto, classCode);
    return transformClassroom(classroom);
  }

  // Matricula o usuário na turma Contexto, se ela existir.
  // Chamado no cadastro (register e criação de educador) — silencioso de propósito:
  // uma falha aqui não pode impedir a criação da conta.
  async enrollInContext(userId: string, roles: Role[]) {
    try {
      const context = await this.classroomRepository.findContextClassroom();
      if (!context) return null;
      return await this.classroomRepository.enrollIfAbsent(
        userId,
        context.id,
        resolveClassRole(roles),
      );
    } catch {
      return null;
    }
  }

  async findMine(userId: string) {
    const [created, enrollments] = await Promise.all([
      this.classroomRepository.findAllByTeacher(userId),
      this.classroomRepository.findAllByStudent(userId),
    ]);

    const map = new Map<string, any>();

    for (const c of created) {
      map.set(c.id, { ...transformClassroomCard(c), canManage: true });
    }

    for (const e of enrollments) {
      const c = e.classroom;
      if (!map.has(c.id)) {
        map.set(c.id, {
          ...transformClassroomCard(c),
          canManage: c.teacherId === userId,
        });
      }
    }

    return Array.from(map.values());
  }

  async findAllByTeacher(teacherId: string) {
    const classrooms = await this.classroomRepository.findAllByTeacher(teacherId);
    return classrooms.map(c => ({ ...transformClassroomCard(c), canManage: true }));
  }

  async findAllByStudent(userId: string) {
    const enrollments = await this.classroomRepository.findAllByStudent(userId);
    return enrollments.map(e => ({
      ...transformClassroomCard(e.classroom),
      canManage: e.classroom.teacherId === userId,
    }));
  }

  async findById(id: string) {
    const classroom = await this.classroomRepository.findById(id);
    if (!classroom) throw new NotFoundException('Turma não encontrada');
    return transformClassroom(classroom);
  }

  async update(id: string, teacherId: string, dto: UpdateClassroomDto) {
    const classroom = await this.findById(id);

    if (classroom.teacher.id !== teacherId) {
      throw new ForbiddenException('Apenas o professor da turma pode editá-la');
    }
    if (classroom.isContext) {
      throw new ForbiddenException('A turma Contexto não pode ser editada');
    }

    return this.classroomRepository.update(id, dto);
  }

  async delete(id: string, teacherId: string) {
    const classroom = await this.findById(id);

    if (classroom.teacher.id !== teacherId) {
      throw new ForbiddenException('Apenas o professor da turma pode excluí-la');
    }
    if (classroom.isContext) {
      throw new ForbiddenException('A turma Contexto não pode ser excluída');
    }

    return this.classroomRepository.delete(id);
  }

  async join(userId: string, userRoles: Role[], dto: JoinClassroomDto) {
    const classroom = await this.classroomRepository.findByClassCode(dto.classCode);

    if (!classroom) throw new NotFoundException('Código de turma inválido');
    if (!classroom.isActive) throw new ForbiddenException('Esta turma está arquivada');

    const alreadyEnrolled = await this.classroomRepository.findEnrollment(userId, classroom.id);
    if (alreadyEnrolled) throw new ConflictException('Você já está matriculado nesta turma');

    const roleInClass = resolveClassRole(userRoles);
    await this.classroomRepository.enroll(userId, classroom.id, roleInClass);
    return transformClassroom(classroom);
  }

  async findMembers(id: string, requesterId: string) {
    await this.findById(id);
    const members = await this.classroomRepository.findMembers(id);
    return members.map((m) => ({ ...m, user: flattenEducatorType(m.user) }));
  }

  // Professor adiciona um participante pelo email
  async addMember(classroomId: string, teacherId: string, email: string) {
    const classroom = await this.findById(classroomId);
    if (classroom.teacher.id !== teacherId) {
      throw new ForbiddenException('Apenas o professor da turma pode adicionar participantes');
    }

    const user = await this.classroomRepository.findUserByEmail(email);
    if (!user) throw new NotFoundException('Nenhum usuário encontrado com este email');

    if (user.id === classroom.teacher.id) {
      throw new ConflictException('O professor já faz parte da turma');
    }

    const alreadyEnrolled = await this.classroomRepository.findEnrollment(user.id, classroomId);
    if (alreadyEnrolled) throw new ConflictException('Este usuário já participa da turma');

    const roleInClass = resolveClassRole(user.roles as Role[]);
    await this.classroomRepository.enroll(user.id, classroomId, roleInClass);

    const members = await this.classroomRepository.findMembers(classroomId);
    const added = members.find((m) => m.user.id === user.id);
    return added ? { ...added, user: flattenEducatorType(added.user) } : null;
  }

  // Professor remove um participante da turma
  async removeMember(classroomId: string, teacherId: string, userId: string) {
    const classroom = await this.findById(classroomId);
    if (classroom.teacher.id !== teacherId) {
      throw new ForbiddenException('Apenas o professor da turma pode remover participantes');
    }
    if (userId === classroom.teacher.id) {
      throw new ForbiddenException('O professor da turma não pode ser removido');
    }

    const enrollment = await this.classroomRepository.findEnrollment(userId, classroomId);
    if (!enrollment) throw new NotFoundException('Participante não encontrado nesta turma');

    return this.classroomRepository.unenroll(userId, classroomId);
  }

  async leave(userId: string, classroomId: string) {
    const enrollment = await this.classroomRepository.findEnrollment(userId, classroomId);
    if (!enrollment) throw new NotFoundException('Matrícula não encontrada');
    return this.classroomRepository.unenroll(userId, classroomId);
  }

  async findSigns(classroomId: string) {
    const classroom = await this.classroomRepository.findById(classroomId);
    if (!classroom) throw new NotFoundException('Turma não encontrada');

    return this.classroomRepository.findSignsByClassroom(classroomId);
  }

  // Sinais mais/menos usados dentro da turma — visualização compacta pro
  // educador (dono da turma) ou gestor, sem precisar abrir o dashboard geral.
  async findUsageStats(classroomId: string, requesterId: string, requesterRoles: Role[], limit = 5) {
    const classroom = await this.findById(classroomId);

    const isManager = requesterRoles.includes(Role.MANAGER);
    if (classroom.teacher.id !== requesterId && !isManager) {
      throw new ForbiddenException('Apenas o professor da turma pode ver estas estatísticas');
    }

    const signs = await this.classroomRepository.findSignsByClassroom(classroomId);
    const usageBySign = await this.historyService.sumAccessBySign(signs.map((s) => s.id));

    const withUsage = signs.map((sign) => ({
      ...sign,
      usageCount: usageBySign.get(sign.id) ?? 0,
    }));

    const mostUsed = [...withUsage].sort((a, b) => b.usageCount - a.usageCount).slice(0, limit);
    const leastUsed = [...withUsage].sort((a, b) => a.usageCount - b.usageCount).slice(0, limit);

    return { mostUsed, leastUsed };
  }

  private generateClassCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    return Array.from({ length: 6 }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length)),
    ).join('');
  }
}
