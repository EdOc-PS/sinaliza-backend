import { UpdateUserDto } from '@modules/users/dto/update-user.dto';
import { UpdateRolesDto } from '@modules/users/dto/update-roles.dto';
import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export function FindDocs() {
    return applyDecorators(
        ApiOperation({ summary: 'Listar todos os usuários', description: 'Apenas ADMIN.' }),
        ApiResponse({ status: 200, description: 'Lista de usuários' }),
        ApiResponse({ status: 403, description: 'Acesso negado' }),
    );
}

export function FindByIdDocs() {
    return applyDecorators(
        ApiOperation({ summary: 'Buscar usuário por ID' }),
        ApiParam({ name: 'id', description: 'UUID do usuário' }),
        ApiResponse({ status: 200, description: 'Usuário encontrado' }),
        ApiResponse({ status: 404, description: 'Usuário não encontrado' }),
    );
}

export function DeleteDocs() {
    return applyDecorators(
        ApiOperation({ summary: 'Remover usuário por ID', description: 'Apenas ADMIN.' }),
        ApiParam({ name: 'id', description: 'UUID do usuário' }),
        ApiResponse({ status: 200, description: 'Usuário removido' }),
        ApiResponse({ status: 404, description: 'Usuário não encontrado' }),
    );
}

export function UpdateRolesDocs() {
    return applyDecorators(
        ApiOperation({
            summary: 'Atualizar perfis (roles) do usuário',
            description:
                'Apenas **ADMIN**. Define a lista de perfis do usuário. STUDENT é exclusivo (não combina com EDUCATOR/GUARDIAN); ADMIN combina com qualquer perfil.',
        }),
        ApiParam({ name: 'id', description: 'UUID do usuário' }),
        ApiBody({
            type: UpdateRolesDto,
            examples: {
                adminEducator: {
                    summary: 'Tornar Admin + Educador',
                    value: { roles: ['ADMIN', 'EDUCATOR'] },
                },
                educatorGuardian: {
                    summary: 'Educador + Familiar',
                    value: { roles: ['EDUCATOR', 'GUARDIAN'] },
                },
            },
        }),
        ApiResponse({ status: 200, description: 'Perfis atualizados' }),
        ApiResponse({ status: 400, description: 'Combinação de perfis inválida' }),
        ApiResponse({ status: 403, description: 'Apenas ADMIN' }),
        ApiResponse({ status: 404, description: 'Usuário não encontrado' }),
    );
}

export function UpdateDocs() {
    return applyDecorators(
        ApiOperation({ summary: 'Atualizar dados do usuário' }),
        ApiParam({ name: 'id', description: 'UUID do usuário' }),
        ApiBody({
            type: UpdateUserDto,
            examples: {
                updateUser: {
                    summary: 'Atualizar nome e telefone',
                    value: {
                        name: 'João Silva Atualizado',
                        phone: '+5531988887777',
                    },
                },
                updateAvatar: {
                    summary: 'Atualizar avatar',
                    value: {
                        avatar: 'https://example.com/novo-avatar.jpg',
                    },
                },
            },
        }),
        ApiResponse({ status: 200, description: 'Usuário atualizado' }),
        ApiResponse({ status: 404, description: 'Usuário não encontrado' }),
    );
}
