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

@Injectable()
export class DisciplineService {
  constructor(private readonly disciplineRepository: DisciplineRepository) {}

  // ── Criar disciplina ──────────────────────────────────────────────
  async create(teacherId: string, dto: CreateDisciplineDto) {
    const classCode = this.generateClassCode();
    return this.disciplineRepository.create(teacherId, dto, classCode);
  }

  // ── Listar disciplinas do professor logado ────────────────────────
  async findAllByTeacher(teacherId: string) {
    return this.disciplineRepository.findAllByTeacher(teacherId);
  }

  // ── Listar disciplinas em que o aluno está matriculado ────────────
  async findAllByStudent(userId: string) {
    return this.disciplineRepository.findAllByStudent(userId);
  }

  // ── Buscar disciplina por ID (validando acesso) ───────────────────
  async findById(id: string) {
    const discipline = await this.disciplineRepository.findById(id);
    if (!discipline) throw new NotFoundException('Disciplina não encontrada');
    return discipline;
  }

  // ── Atualizar disciplina (apenas o professor dono) ────────────────
  async update(id: string, teacherId: string, dto: UpdateDisciplineDto) {
    const discipline = await this.findById(id);

    if (discipline.teacherId !== teacherId) {
      throw new ForbiddenException('Apenas o professor da disciplina pode editá-la');
    }

    return this.disciplineRepository.update(id, dto);
  }

  // ── Deletar disciplina (apenas o professor dono) ──────────────────
  async delete(id: string, teacherId: string) {
    const discipline = await this.findById(id);

    if (discipline.teacherId !== teacherId) {
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

    // Apenas professor dono pode ver a lista completa de membros
    if (discipline.teacherId !== requesterId) {
      throw new ForbiddenException('Acesso negado');
    }

    return this.disciplineRepository.findMembers(id);
  }

  // ── Sair da disciplina ────────────────────────────────────────────
  async leave(userId: string, disciplineId: string) {
    const enrollment = await this.disciplineRepository.findEnrollment(userId, disciplineId);
    if (!enrollment) throw new NotFoundException('Matrícula não encontrada');

    return this.disciplineRepository.unenroll(userId, disciplineId);
  }

  // ── Gerar classCode aleatório ─────────────────────────────────────
  private generateClassCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    return Array.from({ length: 6 }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length)),
    ).join('');
  }
}
