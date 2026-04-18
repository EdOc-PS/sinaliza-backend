import { RegisterDto } from '@modules/auth/dto/register.dto';
import { LoginDto } from '@modules/auth/dto/login.dto';
import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation } from '@nestjs/swagger';


export function RegisterDocs() {
    return applyDecorators(
        ApiOperation({
            summary: 'Cria uma nova conta de usuário',
            description:
                'Endpoint único de registro. Envie `role` + os campos específicos do perfil escolhido.',
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
                educator: {
                    summary: 'Educador',
                    value: {
                        name: 'Maria Souza',
                        email: 'maria@email.com',
                        password: 'senha123',
                        role: 'EDUCATOR',
                        dataProfile: {
                            institute: 'IFMG Ouro Preto',
                            department: 'Pedagogia',
                            specialty: 'Libras e Inclusão',
                        },
                    },
                },
                interpreter: {
                    summary: 'Intérprete',
                    value: {
                        name: 'Carlos Lima',
                        email: 'carlos@email.com',
                        password: 'senha123',
                        role: 'INTERPRETER',
                        dataProfile: {
                            institute: 'IFMG Ouro Preto',
                            certificate: 'ProLibras 2023',
                            areaAtuacao: 'Interpretação em sala de aula',
                            proficienciaLibras: 'FLUENTE',
                        },
                    },
                },
                guardian: {
                    summary: 'Responsável',
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