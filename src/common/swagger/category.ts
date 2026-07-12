import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';

export function CreateCategoryDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Criar categoria',
      description: 'Apenas **EDUCATOR** e **MANAGER**. O `value` é gerado do nome em UPPER_SNAKE.',
    }),
    ApiResponse({ status: 201, description: 'Categoria criada' }),
    ApiResponse({ status: 409, description: 'Categoria equivalente já existe' }),
    ApiResponse({ status: 403, description: 'Apenas EDUCATOR ou MANAGER' }),
  );
}

export function FindAllCategoriesDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Listar categorias', description: 'Lista as categorias disponíveis. Filtro opcional por nome.' }),
    ApiQuery({ name: 'search', required: false, description: 'Busca parcial no nome' }),
    ApiResponse({ status: 200, description: 'Lista de categorias' }),
  );
}

export function DeleteCategoryDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Excluir categoria',
      description: 'Apenas **EDUCATOR** e **MANAGER**. Bloqueado se a categoria estiver em uso por algum sinal.',
    }),
    ApiParam({ name: 'id', description: 'UUID da categoria' }),
    ApiResponse({ status: 200, description: 'Categoria excluída' }),
    ApiResponse({ status: 409, description: 'Categoria em uso' }),
    ApiResponse({ status: 404, description: 'Categoria não encontrada' }),
  );
}
