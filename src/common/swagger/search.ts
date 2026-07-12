import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';

export function SearchSignsDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Buscar sinais (global)',
      description:
        'Lista cards de sinais de **todas as disciplinas** em que o usuário está matriculado ou que leciona. ' +
        'Suporta busca por texto (nome/tag) e por configuração de mão (`handConfigId`). ' +
        'Sinais sem disciplina (glossário global) não são retornados.',
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
        'Lista cards de sinais semelhantes ao informado, acessíveis ao usuário (das disciplinas em que participa). ' +
        'Ordenados por relevância: mesma configuração de mão **e** classe gramatical primeiro, ' +
        'depois só mesma configuração de mão, por fim só mesma classe gramatical. Exclui o próprio sinal.',
    }),
    ApiParam({ name: 'signId', description: 'UUID do sinal de referência' }),
    ApiResponse({ status: 200, description: 'Lista de sinais semelhantes' }),
    ApiResponse({ status: 404, description: 'Sinal não encontrado' }),
  );
}

export function SearchDisciplineSignsDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Buscar sinais dentro de uma disciplina',
      description:
        'Lista cards de sinais de uma disciplina específica. O usuário precisa lecionar ou estar matriculado nela. ' +
        'Suporta busca por texto (nome/tag) e por configuração de mão (`handConfigId`).',
    }),
    ApiParam({ name: 'disciplineId', description: 'UUID da disciplina' }),
    ApiQuery({ name: 'search', required: false, description: 'Busca parcial no nome ou tags do sinal' }),
    ApiQuery({ name: 'handConfigId', required: false, description: 'Filtrar pela configuração de mão (teclado visual)' }),
    ApiQuery({ name: 'categoryId', required: false, description: 'Filtrar por categoria (UUID)' }),
    ApiResponse({ status: 200, description: 'Lista de sinais da disciplina' }),
    ApiResponse({ status: 404, description: 'Disciplina não encontrada ou sem acesso' }),
  );
}
