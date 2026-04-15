import { CreateUserDto } from '@modules/auth/dto/create-user.dto';
import { LoginDto } from '@modules/auth/dto/login.dto';
import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation } from '@nestjs/swagger';


export function RegisterDocs() {
    return applyDecorators(
        ApiOperation({ summary: 'Cria uma nova conta de usuário' }),
        ApiBody({
            type: CreateUserDto,
            examples: {
                register: {
                    summary: 'Exemplo de criação de conta',
                    value: {
                        name: 'Joao Silva',
                        email: 'usuario@email.com',
                        password: 'senha123',
                        avatar: 'https://example.com/avatar.jpg',
                        birthdate: '21/03/2001',
                        phone: '+5511999999999',
                        role: 'STUDENT',
                    },
                },
            },
        }),
    );
}

export function LoginDocs() {
    return applyDecorators(
        ApiOperation({ summary: 'Realiza login do usuário' }),
        ApiBody({
            type: LoginDto,
            examples: {
                login: {
                    summary: 'Exemplo de login',
                    value: {
                        email: 'usuario@email.com',
                        password: 'senha123',
                    },
                },
            },
        }),
    );
}