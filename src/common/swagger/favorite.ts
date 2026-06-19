import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export function AddFavoriteDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Favoritar sinal',
      description: 'Adiciona um sinal à lista de favoritos do usuário autenticado.',
    }),
    ApiParam({ name: 'signId', description: 'UUID do sinal a ser favoritado' }),
    ApiResponse({ status: 201, description: 'Sinal adicionado aos favoritos' }),
    ApiResponse({ status: 404, description: 'Sinal não encontrado' }),
    ApiResponse({ status: 409, description: 'Sinal já está nos favoritos' }),
  );
}

export function RemoveFavoriteDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Desfavoritar sinal',
      description: 'Remove um sinal da lista de favoritos do usuário autenticado.',
    }),
    ApiParam({ name: 'signId', description: 'UUID do sinal a ser removido dos favoritos' }),
    ApiResponse({ status: 200, description: 'Sinal removido dos favoritos' }),
    ApiResponse({ status: 404, description: 'Favorito não encontrado' }),
  );
}

export function FindAllFavoritesDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Listar favoritos',
      description: 'Retorna todos os sinais favoritados pelo usuário autenticado.',
    }),
    ApiResponse({ status: 200, description: 'Lista de favoritos do usuário' }),
  );
}
