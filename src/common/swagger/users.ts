import { UpdateUserDto } from '@modules/users/dto/update-user.dto';
import { UpdateRolesDto } from '@modules/users/dto/update-roles.dto';
import { CreateEducatorDto } from '@modules/users/dto/create-educator.dto';
import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';

export function FindEducatorsDocs() {
    return applyDecorators(
        ApiOperation({
            summary: 'Listar educadores',
            description: 'Apenas **MANAGER**. Lista usuários com a role EDUCATOR. Filtro opcional por nome ou email.',
        }),
        ApiQuery({ name: 'search', required: false, description: 'Busca parcial por nome ou email do educador' }),
        ApiResponse({ status: 200, description: 'Lista de educadores' }),
        ApiResponse({ status: 403, description: 'Apenas MANAGER' }),
    );
}

export function CreateEducatorDocs() {
    return applyDecorators(
        ApiOperation({
            summary: 'Cadastrar educador (professor/intérprete)',
            description:
                'Apenas **MANAGER**. Cria uma conta com a role EDUCATOR e o perfil de educador. ' +
                'O tipo (TEACHER ou INTERPRETER) e a senha inicial são definidos pelo gestor.',
        }),
        ApiBody({ type: CreateEducatorDto }),
        ApiResponse({ status: 201, description: 'Educador criado' }),
        ApiResponse({ status: 400, description: 'Dados inválidos ou email já registrado' }),
        ApiResponse({ status: 403, description: 'Apenas MANAGER' }),
    );
}

export function FindDocs() {
    return applyDecorators(
        ApiOperation({ summary: 'Listar todos os usuários', description: 'Apenas MANAGER.' }),
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
        ApiOperation({ summary: 'Remover usuário por ID', description: 'Apenas MANAGER.' }),
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
                'Apenas **MANAGER**. Define a lista de perfis do usuário. STUDENT é exclusivo (não combina com EDUCATOR/GUARDIAN); MANAGER combina com qualquer perfil.',
        }),
        ApiParam({ name: 'id', description: 'UUID do usuário' }),
        ApiBody({
            type: UpdateRolesDto,
            examples: {
                adminEducator: {
                    summary: 'Tornar Admin + Educador',
                    value: { roles: ['MANAGER', 'EDUCATOR'] },
                },
                educatorGuardian: {
                    summary: 'Educador + Familiar',
                    value: { roles: ['EDUCATOR', 'GUARDIAN'] },
                },
            },
        }),
        ApiResponse({ status: 200, description: 'Perfis atualizados' }),
        ApiResponse({ status: 400, description: 'Combinação de perfis inválida' }),
        ApiResponse({ status: 403, description: 'Apenas MANAGER' }),
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
