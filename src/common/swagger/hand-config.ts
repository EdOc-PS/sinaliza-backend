import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { CreateHandConfigDto } from '@modules/hand-config/dto/create-hand-config.dto';
import { UpdateHandConfigDto } from '@modules/hand-config/dto/update-hand-config.dto';

export function CreateHandConfigDocs() {
    return applyDecorators(
        ApiOperation({
            summary: 'Criar configuração de mão',
            description: 'Apenas **EDUCATOR** e **ADMIN**. Cadastra uma nova configuração de mão com nome e URL da imagem.',
        }),
        ApiBody({
            type: CreateHandConfigDto,
            examples: {
                exemplo: {
                    summary: 'Letra A',
                    value: { name: 'Letra A', imgUrl: 'https://storage.example.com/hands/letra-a.png' },
                },
            },
        }),
        ApiResponse({ status: 201, description: 'Configuração de mão criada' }),
        ApiResponse({ status: 400, description: 'Dados inválidos ou nome duplicado' }),
        ApiResponse({ status: 403, description: 'Apenas EDUCATOR ou ADMIN' }),
    );
}

export function FindAllHandConfigsDocs() {
    return applyDecorators(
        ApiOperation({
            summary: 'Listar configurações de mão',
            description: 'Retorna todas as configurações de mão ordenadas por nome. Disponível para todos os usuários autenticados.',
        }),
        ApiResponse({ status: 200, description: 'Lista de configurações de mão' }),
    );
}

export function FindOneHandConfigDocs() {
    return applyDecorators(
        ApiOperation({
            summary: 'Buscar configuração de mão por nome',
            description: 'Busca case-insensitive e parcial. Ex: `letra` retorna "Letra A", "Letra B".',
        }),
        ApiParam({ name: 'name', description: 'Nome (parcial) da configuração de mão' }),
        ApiResponse({ status: 200, description: 'Configuração de mão encontrada' }),
        ApiResponse({ status: 404, description: 'Configuração de mão não encontrada' }),
    );
}

export function UpdateHandConfigDocs() {
    return applyDecorators(
        ApiOperation({
            summary: 'Atualizar configuração de mão',
            description: 'Apenas **EDUCATOR** e **ADMIN**.',
        }),
        ApiParam({ name: 'id', description: 'UUID da configuração de mão' }),
        ApiBody({
            type: UpdateHandConfigDto,
            examples: {
                renomear: { summary: 'Renomear', value: { name: 'Letra B' } },
                trocarImagem: { summary: 'Trocar imagem', value: { imgUrl: 'https://storage.example.com/hands/letra-b.png' } },
            },
        }),
        ApiResponse({ status: 200, description: 'Configuração de mão atualizada' }),
        ApiResponse({ status: 404, description: 'Configuração de mão não encontrada' }),
    );
}

export function DeleteHandConfigDocs() {
    return applyDecorators(
        ApiOperation({
            summary: 'Excluir configuração de mão',
            description: 'Apenas **EDUCATOR** e **ADMIN**.',
        }),
        ApiParam({ name: 'id', description: 'UUID da configuração de mão' }),
        ApiResponse({ status: 200, description: 'Configuração de mão excluída' }),
        ApiResponse({ status: 404, description: 'Configuração de mão não encontrada' }),
    );
}
