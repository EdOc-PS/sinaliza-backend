import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';

export function SearchSignsDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Buscar sinais (global)',
      description:
        'Lista cards de sinais de **todas as turmas** em que o usuário está matriculado ou que leciona. ' +
        'Suporta busca por texto (nome/tag) e por configuração de mão (`handConfigId`). ' +
        'Sinais sem turma (glossário global) não são retornados.',
    }),
    ApiQuery({ name: 'search', required: false, description: 'Busca parcial no nome ou tags do sinal' }),
    ApiQuery({ name: 'handConfigId', required: false, description: 'Filtrar pela configuração de mão (teclado visual)' }),
    ApiQuery({ name: 'categoryId', required: false, description: 'Filtrar por categoria (UUID)' }),
    ApiResponse({ status: 200, description: 'Lista de sinais acessíveis ao usuário' }),
  );
}

export function RelatedSignsDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Sinais semelhantes',
      description:
        'Lista cards de sinais semelhantes ao informado, acessíveis ao usuário (das turmas em que participa). ' +
        'Ordenados por relevância: mesma configuração de mão **e** classe gramatical primeiro, ' +
        'depois só mesma configuração de mão, por fim só mesma classe gramatical. Exclui o próprio sinal.',
    }),
    ApiParam({ name: 'signId', description: 'UUID do sinal de referência' }),
    ApiResponse({ status: 200, description: 'Lista de sinais semelhantes' }),
    ApiResponse({ status: 404, description: 'Sinal não encontrado' }),
  );
}

export function SearchClassroomSignsDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Buscar sinais dentro de uma turma',
      description:
        'Lista cards de sinais de uma turma específica. O usuário precisa lecionar ou estar matriculado nela. ' +
        'Suporta busca por texto (nome/tag) e por configuração de mão (`handConfigId`).',
    }),
    ApiParam({ name: 'classroomId', description: 'UUID da turma' }),
    ApiQuery({ name: 'search', required: false, description: 'Busca parcial no nome ou tags do sinal' }),
    ApiQuery({ name: 'handConfigId', required: false, description: 'Filtrar pela configuração de mão (teclado visual)' }),
    ApiQuery({ name: 'categoryId', required: false, description: 'Filtrar por categoria (UUID)' }),
    ApiResponse({ status: 200, description: 'Lista de sinais da turma' }),
    ApiResponse({ status: 404, description: 'Turma não encontrada ou sem acesso' }),
  );
}
