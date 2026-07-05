import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { UsersRepository } from "./repositories/users.repository";
import { UpdateUserDto } from "./dto/update-user.dto";
import { CreateEducatorDto } from "./dto/create-educator.dto";
import { Role } from "@common/enums/enum";
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

  // Cadastro de educador (professor/intérprete) feito por um MANAGER
  async createEducator(dto: CreateEducatorDto) {
    const existing = await this.usersRepository.findByEmail(dto.email);
    if (existing) {
      throw new BadRequestException('Email já registrado, utilize outro email');
    }

    const hashPassword = await bcrypt.hash(dto.password, 10);
    const institutionId = await this.institutionsService.getDefaultInstitutionId();
    const profile = dto.dataProfile;

    return this.usersRepository.createEducatorAccount(
      {
        name: dto.name,
        email: dto.email,
        password: hashPassword,
        phone: dto.phone,
        bio: dto.bio,
        institutionId,
      },
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