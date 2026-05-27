import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { GrammaticalClass } from '@prisma/client';

export function CreateSignDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Criar sinal',
      description: 'Apenas **EDUCATOR** e **ADMIN**. Faz upload de vídeo (opcional) e imagem (opcional) para o R2. É necessário enviar um vídeo OU informar `anotherUrl`.',
    }),
    ApiResponse({ status: 201, description: 'Sinal criado' }),
    ApiResponse({ status: 400, description: 'Dados inválidos ou nome duplicado' }),
    ApiResponse({ status: 403, description: 'Apenas EDUCATOR ou ADMIN' }),
  );
}

export function FindAllSignsDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Listar sinais',
      description: 'Lista todos os sinais. Suporta filtros via query string.',
    }),
    ApiQuery({ name: 'search', required: false, description: 'Busca parcial no nome do sinal' }),
    ApiQuery({ name: 'grammaticalClass', required: false, enum: GrammaticalClass }),
    ApiQuery({ name: 'handConfigId', required: false, description: 'Filtrar por configuração de mão' }),
    ApiQuery({ name: 'tag', required: false, description: 'Filtrar por tag específica' }),
    ApiResponse({ status: 200, description: 'Lista de sinais' }),
  );
}

export function FindOneSignDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Buscar sinal por ID' }),
    ApiParam({ name: 'id', description: 'UUID do sinal' }),
    ApiResponse({ status: 200, description: 'Sinal encontrado' }),
    ApiResponse({ status: 404, description: 'Sinal não encontrado' }),
  );
}

export function UpdateSignDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Atualizar sinal',
      description: 'Apenas **EDUCATOR** e **ADMIN**. Aceita upload de novos vídeo/imagem que substituem os antigos no R2.',
    }),
    ApiParam({ name: 'id', description: 'UUID do sinal' }),
    ApiResponse({ status: 200, description: 'Sinal atualizado' }),
    ApiResponse({ status: 404, description: 'Sinal não encontrado' }),
  );
}

export function FindSignOptionsDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Listar classes gramaticais',
      description: 'Retorna as opções de classes gramaticais disponíveis para uso nos sinais.',
    }),
    ApiResponse({ status: 200, description: 'Lista de classes gramaticais' }),
  );
}

export function DeleteSignDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Excluir sinal',
      description: 'Apenas **EDUCATOR** e **ADMIN**. Remove vídeo e imagem do R2 junto com o registro.',
    }),
    ApiParam({ name: 'id', description: 'UUID do sinal' }),
    ApiResponse({ status: 200, description: 'Sinal excluído' }),
    ApiResponse({ status: 404, description: 'Sinal não encontrado' }),
  );
}
