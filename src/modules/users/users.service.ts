import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { NotificationService } from "@modules/email/notification.service";
import { UsersRepository } from "./repositories/users.repository";
import { UpdateUserDto, getRandomAvatarKey } from "./dto/update-user.dto";
import { CreateEducatorDto } from "./dto/create-educator.dto";
import { Role, ApprovalStatus } from "@common/enums/enum";
import { assertValidRoleCombination } from "@common/utils/roles";
import { InstitutionsService } from "../institutions/institutions.service";
import { ClassroomService } from '../classrooms/classroom.service';

@Injectable()
export class UsersService {
  constructor(
    private usersRepository: UsersRepository,
    private readonly institutionsService: InstitutionsService,
    private readonly classroomService: ClassroomService,
    private readonly notifications: NotificationService,
  ) {}

  findAll() {
    return this.usersRepository.findAll();
  }

  findEducators(search?: string) {
    return this.usersRepository.findEducators(search);
  }

  // Lista usuários por role — restrito às roles funcionais (uma por vez, nunca combinadas)
  findMembersByRole(role: Role, search?: string) {
    const allowed: Role[] = [Role.STUDENT, Role.EDUCATOR];
    if (!allowed.includes(role)) {
      throw new BadRequestException('Role inválida. Use STUDENT ou EDUCATOR.');
    }
    return this.usersRepository.findByRole(role, search);
  }

  // Aprova ou recusa uma conta (perfil de aluno). Também serve para o gestor
  // rever uma recusa. O aluno é notificado da decisão.
  async updateApproval(id: string, status: ApprovalStatus) {
    const user = await this.findByIdOrFail(id);
    const updated = await this.usersRepository.updateApprovalStatus(id, status);

    if (status === ApprovalStatus.APPROVED || status === ApprovalStatus.REJECTED) {
      await this.notifications.approvalDecided(user.id, status === ApprovalStatus.APPROVED);
    }

    return updated;
  }

  // Cadastro de educador (professor/intérprete) feito por um MANAGER
  async createEducator(dto: CreateEducatorDto) {
    const existing = await this.usersRepository.findByEmail(dto.email);
    if (existing) {
      throw new BadRequestException('Email já registrado, utilize outro email');
    }

    const hashPassword = await bcrypt.hash(dto.password, 10);
    const institutionId = await this.institutionsService.getDefaultInstitutionId();
    const profile = dto.dataProfile;

    // Gestor opcional: educador pode nascer com o perfil de MANAGER
    const roles = dto.isManager ? [Role.EDUCATOR, Role.MANAGER] : [Role.EDUCATOR];

    const educator = await this.usersRepository.createEducatorAccount(
      {
        name: dto.name,
        email: dto.email,
        password: hashPassword,
        phone: dto.phone,
        bio: dto.bio,
        institutionId,
        avatar: getRandomAvatarKey(),
      },
      roles,
      {
        educatorType: dto.educatorType,
        department: profile.department,
        specialty: profile.specialty,
        certificate: profile.certificate,
        areaAtuacao: profile.areaAtuacao,
        proficienciaLibras: profile.proficienciaLibras,
      },
    );

    // Educador também entra automaticamente na turma Contexto
    if (educator) {
      await this.classroomService.enrollInContext(educator.id, roles);
      await this.notifications.educatorWelcome(educator.id, dto.name, dto.email);
    }

    return educator;
  }

  markOnboardingSeen(userId: string) {
    return this.usersRepository.markOnboardingSeen(userId);
  }

  findUser(id: string) {
    return this.findByIdOrFail(id);
  }

  findByEmail (email: string) {
    return this.usersRepository.findByEmail(email);
  }

  async findByIdOrFail(id: string) {

    const user = await this.usersRepository.findOne(id);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }

  async validateActiveUser(id: string) {
    const user = await this.findByIdOrFail(id);

    if (!user.status) {
      throw new ForbiddenException('Usuário inativo');
    }

    return user;
  }

  async update(id: string, updatedUser: UpdateUserDto) {
    await this.findByIdOrFail(id);

    return this.usersRepository.update(id, updatedUser);
  }

  async updateRoles(id: string, roles: Role[]) {
    await this.findByIdOrFail(id);
    assertValidRoleCombination(roles);

    return this.usersRepository.updateRoles(id, roles);
  }

  async delete(id: string) {
    await this.findByIdOrFail(id);

    return this.usersRepository.delete(id);
  }

  // Ativar/desativar conta — o desativado não passa mais pelo login (ver AuthService.login)
  async updateStatus(id: string, status: boolean) {
    await this.findByIdOrFail(id);

    return this.usersRepository.update(id, { status });
  }

  // PATCH /users/:id é usado tanto por autoedição de perfil quanto pelo gestor
  // editando um educador — sem essa checagem, qualquer usuário logado poderia
  // alterar (ou excluir) a conta de qualquer outro só sabendo o id.
  assertSelfOrManager(requesterId: string, requesterRoles: Role[], targetId: string) {
    if (requesterId === targetId) return;
    if (requesterRoles.includes(Role.MANAGER)) return;
    throw new ForbiddenException('Você só pode editar a própria conta.');
  }

}