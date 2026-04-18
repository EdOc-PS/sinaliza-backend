import * as bcrypt from 'bcrypt'

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from '../users/users.service';
import { AuthRepository } from './repositories/auth.repository';
import { Role } from '@common/enums/enum';


@Injectable()
export class AuthService {

    constructor(
        private readonly usersService: UsersService,
        private readonly authRepository: AuthRepository,
        private jwtService: JwtService
    ) { }

    // ──  login do usuário ──────────────────────────────────────────
    async login(loginRequest: LoginDto) {
        const user = await this.usersService.findByEmail(loginRequest.email);

        if (!user) throw new UnauthorizedException('Email não encontrado, verifique e tente novamente');
        if (!user.status) throw new UnauthorizedException('Usuário inativo');

        const isPasswordValid = await bcrypt.compare(loginRequest.password, user.password);
        if (!isPasswordValid) throw new UnauthorizedException('Credenciais inválidas');

        const token = this.jwtService.sign({ userId: user.id, email: user.email });

        return { access_token: token, user };
    }

    // ──  registro de novo usuário ──────────────────────────────────────────
    async register(dto: RegisterDto) {
        const existingUser = await this.usersService.findByEmail(dto.email);
        if (existingUser) throw new UnauthorizedException('Email já registrado, por favor utilize outro email');

        const hashPassword = await bcrypt.hash(dto.password, 10);

        // ── Dados base do usuário ──────────────────────────────────────────
        const userData = {
            name: dto.name,
            email: dto.email,
            password: hashPassword,
            phone: dto.phone,
            birthdate: dto.birthdate,
            bio: dto.bio,
            role: dto.role,
        };

        // ── Regra de negócio: monta o perfil conforme o role ──────────────
        const profileData = this.buildProfileData(dto);

        return this.authRepository.createAccount(userData, profileData);
    }

    private buildProfileData(dto: RegisterDto) {
        const profile = dto.dataProfile;

        switch (dto.role) {
            case Role.STUDENT:
                return {
                    type: Role.STUDENT as const,
                    data: {
                        institute: profile.institute,
                        grauEscolar: profile.grauEscolar ?? '',
                        necessidadesEspeciais: profile.necessidadesEspeciais ?? '',
                    },
                };

            case Role.EDUCATOR:
                return {
                    type: Role.EDUCATOR as const,
                    data: {
                        institute: profile.institute ?? '',
                        department: profile.department ?? '',
                        specialty: profile.specialty ?? '',
                    },
                };

            case Role.INTERPRETER:
                return {
                    type: Role.INTERPRETER as const,
                    data: {
                        institute: profile.institute ?? '',
                        certificate: profile.certificate ?? '',
                        areaAtuacao: profile.areaAtuacao ?? '',
                        proficienciaLibras: profile.proficienciaLibras ?? 'BASICO',
                        specialty: '',
                        department: '',
                    },
                };

            case Role.GUARDIAN:
                return {
                    type: Role.GUARDIAN as const,
                    data: {
                        parentesco: profile.parentesco ?? '',
                        studentEmail: profile.studentEmail,
                    },
                };

            default:
                return null;
        }
    }
}
