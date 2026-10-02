import * as bcrypt from 'bcrypt'

import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from '../users/users.service';
import { InstitutionsService } from '../institutions/institutions.service';
import { AuthRepository } from './repositories/auth.repository';
import { ClassroomService } from '../classrooms/classroom.service';
import { Role } from '@common/enums/enum';
import { getRandomAvatarKey } from '../users/dto/update-user.dto';


const MAX_LOGIN_ATTEMPTS = 6;
const LOCK_MINUTES = 30;

@Injectable()
export class AuthService {

    constructor(
        private readonly usersService: UsersService,
        private readonly authRepository: AuthRepository,
        private readonly institutionsService: InstitutionsService,
        private readonly classroomService: ClassroomService,
        private jwtService: JwtService
    ) { }

    async login(loginRequest: LoginDto) {
        const user = await this.usersService.findByEmail(loginRequest.email);

        if (!user) throw new UnauthorizedException('Email não encontrado, verifique e tente novamente');
        if (!user.status) throw new UnauthorizedException('Usuário inativo');

        if (user.lockedUntil && user.lockedUntil > new Date()) {
            const minutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60_000);
            throw new ForbiddenException(
                `Conta bloqueada por excesso de tentativas. Tente novamente em ${minutes} minuto${minutes > 1 ? 's' : ''} ou redefina sua senha.`,
            );
        }

        const isPasswordValid = await bcrypt.compare(loginRequest.password, user.password);
        if (!isPasswordValid) {
            const { locked, remaining } = await this.authRepository.registerFailedLogin(
                user.id, MAX_LOGIN_ATTEMPTS, LOCK_MINUTES,
            );
            if (locked) {
                throw new ForbiddenException(
                    `Conta bloqueada por ${LOCK_MINUTES} minutos após ${MAX_LOGIN_ATTEMPTS} tentativas erradas. Você pode redefinir sua senha.`,
                );
            }
            throw new UnauthorizedException(
                `Senha inválida. ${remaining} tentativa${remaining > 1 ? 's' : ''} restante${remaining > 1 ? 's' : ''} antes do bloqueio.`,
            );
        }

        if (user.failedLoginAttempts > 0 || user.lockedUntil) {
            await this.authRepository.clearLoginLock(user.id);
        }

        const token = this.jwtService.sign({ userId: user.id, email: user.email, roles: user.roles });

        // Retorna o usuário enriquecido (inclui approvalStatus para o front decidir sobre pendência)
        const enrichedUser = await this.usersService.findUser(user.id);

        return { access_token: token, user: enrichedUser };
    }

    async register(dto: RegisterDto) {
        const existingUser = await this.usersService.findByEmail(dto.email);
        if (existingUser) throw new UnauthorizedException('Email já registrado, por favor utilize outro email');

        const hashPassword = await bcrypt.hash(dto.password, 10);
        const institutionId = await this.institutionsService.getDefaultInstitutionId();

        const userData = {
            name: dto.name,
            email: dto.email,
            password: hashPassword,
            phone: dto.phone,
            birthdate: dto.birthdate,
            bio: dto.bio,
            roles: [dto.role],
            institutionId,
            avatar: getRandomAvatarKey(),
        };

        const profileData = this.buildProfileData(dto);

        const account = await this.authRepository.createAccount(userData, profileData);

        // Todo usuário entra automaticamente na turma Contexto
        await this.classroomService.enrollInContext(account.id, [dto.role]);

        return account;
    }

    async getMe(userId: string) {
        return this.usersService.findUser(userId);
    }

    private buildProfileData(dto: RegisterDto) {
        const profile = dto.dataProfile;

        switch (dto.role) {
            case Role.STUDENT:
                return {
                    type: Role.STUDENT as const,
                    data: {
                        grauEscolar: profile.grauEscolar ?? '',
                        necessidadesEspeciais: profile.necessidadesEspeciais ?? '',
                    },
                };

            case Role.EDUCATOR:
                return {
                    type: Role.EDUCATOR as const,
                    data: {
                        educatorType: profile.educatorType ?? 'TEACHER',
                        department: profile.department,
                        specialty: profile.specialty,
                        // Campos do Intérprete (preenchidos apenas se educatorType = INTERPRETER)
                        certificate: profile.certificate,
                        areaAtuacao: profile.areaAtuacao,
                        proficienciaLibras: profile.proficienciaLibras,
                    },
                };

            default:
                return null;
        }
    }
}
