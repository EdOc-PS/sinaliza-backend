import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export function RegisterHistoryDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Registrar acesso ao sinal',
      description: 'Registra que o usuário autenticado visualizou um sinal. Se o sinal já estiver no histórico, atualiza o timestamp de acesso.',
    }),
    ApiParam({ name: 'signId', description: 'UUID do sinal acessado' }),
    ApiResponse({ status: 201, description: 'Acesso registrado no histórico' }),
    ApiResponse({ status: 404, description: 'Sinal não encontrado' }),
  );
}

export function FindAllHistoryDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Listar histórico',
      description: 'Retorna o histórico de sinais acessados pelo usuário autenticado, ordenado pelo mais recente.',
    }),
    ApiResponse({ status: 200, description: 'Histórico do usuário' }),
  );
}

export function ClearHistoryDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Limpar histórico',
      description: 'Remove todos os registros de histórico do usuário autenticado.',
    }),
    ApiResponse({ status: 200, description: 'Histórico limpo com sucesso' }),
  );
}

export function RemoveHistoryItemDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Remover sinal do histórico',
      description: 'Remove um sinal específico do histórico do usuário autenticado.',
    }),
    ApiParam({ name: 'signId', description: 'UUID do sinal a ser removido do histórico' }),
    ApiResponse({ status: 200, description: 'Sinal removido do histórico' }),
    ApiResponse({ status: 404, description: 'Registro não encontrado no histórico' }),
  );
}
