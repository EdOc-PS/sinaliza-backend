import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { UsersRepository } from "./repositories/users.repository";
import { UpdateUserDto } from "./dto/update-user.dto";
import { CreateEducatorDto } from "./dto/create-educator.dto";
import { Role, ApprovalStatus } from "@common/enums/enum";
import { assertValidRoleCombination } from "@common/utils/roles";
import { InstitutionsService } from "../institutions/institutions.service";

@Injectable()
export class UsersService {

  constructor(
    private usersRepository: UsersRepository,
    private readonly institutionsService: InstitutionsService,
  ) {}

  findAll() {
    return this.usersRepository.findAll();
  }

  findEducators(search?: string) {
    return this.usersRepository.findEducators(search);
  }

  // Lista usuários por role — restrito às roles funcionais (uma por vez, nunca combinadas)
  findMembersByRole(role: Role, search?: string) {
    const allowed: Role[] = [Role.STUDENT, Role.EDUCATOR, Role.GUARDIAN];
    if (!allowed.includes(role)) {
      throw new BadRequestException('Role inválida. Use STUDENT, EDUCATOR ou GUARDIAN.');
    }
    return this.usersRepository.findByRole(role, search);
  }

  // Aprova ou recusa uma conta pendente (perfil student/guardian)
  async updateApproval(id: string, status: ApprovalStatus) {
    await this.findByIdOrFail(id);
    return this.usersRepository.updateApprovalStatus(id, status);
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

    return this.usersRepository.createEducatorAccount(
      {
        name: dto.name,
        email: dto.email,
        password: hashPassword,
        phone: dto.phone,
        bio: dto.bio,
        institutionId,
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

}