import * as bcrypt from 'bcrypt'

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { AuthRepository } from './repositories/auth.repository';


@Injectable()
export class AuthService {

    constructor(
        private readonly usersService: UsersService,
        private readonly authRepository: AuthRepository,
        private jwtService: JwtService
    ) { }

    async login(loginRequest: LoginDto) {
        const user = await this.usersService.findByEmail(loginRequest.email);

        if (!user) throw new UnauthorizedException('Email não encontrado, verifique e tente novamente');
        if (!user.status) throw new UnauthorizedException('Usuário inativo');

        const isPasswordValid = await bcrypt.compare(loginRequest.password, user.password);
        if (!isPasswordValid) throw new UnauthorizedException('Credenciais inválidas');

        const token = this.jwtService.sign({ userId: user.id, email: user.email });

        return {
            access_token: token,
            user: user
        }
    }

    async create(newUser: CreateUserDto) {

        const existingUser = await this.usersService.findByEmail(newUser.email);
        if (existingUser) throw new UnauthorizedException('Email já registrado, por favor utilize outro email');

        const hashPassword = await bcrypt.hash(newUser.password, 10)

        const createdUser = await this.authRepository.createAccount(newUser, hashPassword);
        return createdUser;
    }
}
