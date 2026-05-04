import { RegisterDto } from '@modules/auth/dto/register.dto';
import { LoginDto } from '@modules/auth/dto/login.dto';
import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';

export function RegisterDocs() {
    return applyDecorators(
        ApiOperation({
            summary: 'Criar nova conta',
            description:
                'Registro unificado. Envie `role` + os campos específicos do perfil em `dataProfile`.\n\n' +
                '- **STUDENT** → `grauEscolar`, `necessidadesEspeciais`\n' +
                '- **EDUCATOR (Professor)** → `educatorType: TEACHER`, `department`, `specialty`\n' +
                '- **EDUCATOR (Intérprete)** → `educatorType: INTERPRETER`, `certificate`, `areaAtuacao`, `proficienciaLibras`\n' +
                '- **GUARDIAN** → `parentesco`, `studentEmail`',
        }),
        ApiBody({
            type: RegisterDto,
            examples: {
                student: {
                    summary: 'Estudante',
                    value: {
                        name: 'João Silva',
                        email: 'joao@email.com',
                        password: 'senha123',
                        phone: '+5531999999999',
                        birthdate: '21/03/2001',
                        bio: 'Estudante de TI no IFMG.',
                        role: 'STUDENT',
                        dataProfile: {
                            institute: 'IFMG Ouro Preto',
                            grauEscolar: 'Ensino Médio',
                            necessidadesEspeciais: 'Surdez bilateral',
                        },
                    },
                },
                educator_professor: {
                    summary: 'Educador — Professor',
                    value: {
                        name: 'Maria Souza',
                        email: 'maria@email.com',
                        password: 'senha123',
                        role: 'EDUCATOR',
                        dataProfile: {
                            institute: 'IFMG Ouro Preto',
                            educatorType: 'TEACHER',
                            department: 'Pedagogia',
                            specialty: 'Libras e Inclusão',
                        },
                    },
                },
                educator_interprete: {
                    summary: 'Educador — Intérprete',
                    value: {
                        name: 'Carlos Lima',
                        email: 'carlos@email.com',
                        password: 'senha123',
                        role: 'EDUCATOR',
                        dataProfile: {
                            institute: 'IFMG Ouro Preto',
                            educatorType: 'INTERPRETER',
                            certificate: 'ProLibras 2023',
                            areaAtuacao: 'Interpretação em sala de aula',
                            proficienciaLibras: 'FLUENTE',
                        },
                    },
                },
                guardian: {
                    summary: 'Responsável (Familiar)',
                    value: {
                        name: 'Ana Pereira',
                        email: 'ana@email.com',
                        password: 'senha123',
                        role: 'GUARDIAN',
                        dataProfile: {
                            parentesco: 'mãe',
                            studentEmail: 'joao@email.com',
                        },
                    },
                },
            },
        }),
        ApiResponse({ status: 201, description: 'Conta criada com sucesso' }),
        ApiResponse({ status: 400, description: 'Dados inválidos' }),
        ApiResponse({ status: 401, description: 'Email já registrado' }),
    );
}

export function LoginDocs() {
    return applyDecorators(
        ApiOperation({
            summary: 'Login',
            description: 'Retorna `access_token` JWT e dados do usuário autenticado.',
        }),
        ApiBody({
            type: LoginDto,
            examples: {
                login: {
                    summary: 'Exemplo de login',
                    value: {
                        email: 'maria@email.com',
                        password: 'senha123',
                    },
                },
            },
        }),
        ApiResponse({ status: 200, description: 'Login realizado — retorna access_token + user' }),
        ApiResponse({ status: 401, description: 'Credenciais inválidas ou usuário inativo' }),
    );
}

export function GetMeDocs() {
    return applyDecorators(
        ApiOperation({
            summary: 'Dados do usuário autenticado',
            description: 'Retorna o perfil completo do usuário dono do token JWT.',
        }),
        ApiResponse({ status: 200, description: 'Usuário obtido com sucesso' }),
        ApiResponse({ status: 401, description: 'Token inválido ou expirado' }),
    );
}
