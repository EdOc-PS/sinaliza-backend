import { UpdateUserDto } from '@modules/users/dto/update-user.dto';
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
