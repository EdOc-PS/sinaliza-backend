import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { CreateClassroomDto } from '@modules/classrooms/dto/create-classroom.dto';
import { UpdateClassroomDto } from '@modules/classrooms/dto/update-classroom.dto';
import { JoinClassroomDto } from '@modules/classrooms/dto/join-classroom.dto';

export function CreateClassroomDocs() {
    return applyDecorators(
        ApiOperation({
            summary: 'Criar turma',
            description: 'Apenas **EDUCATOR**. O `classCode` é gerado automaticamente.',
        }),
        ApiBody({
            type: CreateClassroomDto,
            examples: {
                completo: {
                    summary: 'Com todas as informações',
                    value: {
                        name: 'Matemática Aplicada',
                        description: 'Turma de matemática do período da manhã',
                        colorBackground: '#BACA57',
                    },
                },
                minimo: {
                    summary: 'Apenas nome (mínimo obrigatório)',
                    value: {
                        name: 'Libras Básico',
                    },
                },
            },
        }),
        ApiResponse({ status: 201, description: 'Turma criada com classCode gerado' }),
        ApiResponse({ status: 400, description: 'Dados inválidos' }),
        ApiResponse({ status: 403, description: 'Apenas EDUCATOR pode criar turmas' }),
    );
}

export function FindMineDocs() {
    return applyDecorators(
        ApiOperation({
            summary: 'Minhas turmas',
            description:
                'Lista **todas** as turmas do usuário autenticado — independente da role:\n\n' +
                '- Turmas **criadas** pelo usuário (`canManage: true`)\n' +
                '- Turmas em que o usuário está **matriculado** (`canManage` depende de ser o criador)\n\n' +
                'Disponível para todas as roles: `STUDENT`, `EDUCATOR`, `MANAGER`.',
        }),
        ApiResponse({
            status: 200,
            description: 'Lista mesclada de turmas criadas + matriculadas com flag `canManage`',
        }),
    );
}

export function FindOneClassroomDocs() {
    return applyDecorators(
        ApiOperation({ summary: 'Buscar turma por ID' }),
        ApiParam({ name: 'id', description: 'UUID da turma' }),
        ApiResponse({ status: 200, description: 'Turma encontrada' }),
        ApiResponse({ status: 404, description: 'Turma não encontrada' }),
    );
}

export function FindMembersDocs() {
    return applyDecorators(
        ApiOperation({
            summary: 'Listar membros da turma',
            description: 'Apenas o **EDUCATOR dono** da turma pode ver os membros.',
        }),
        ApiParam({ name: 'id', description: 'UUID da turma' }),
        ApiResponse({ status: 200, description: 'Lista de membros matriculados' }),
        ApiResponse({ status: 403, description: 'Apenas o professor dono pode acessar' }),
        ApiResponse({ status: 404, description: 'Turma não encontrada' }),
    );
}

export function UpdateClassroomDocs() {
    return applyDecorators(
        ApiOperation({
            summary: 'Atualizar turma',
            description: 'Apenas o **EDUCATOR dono** pode editar. Use `isActive: false` para arquivar.',
        }),
        ApiParam({ name: 'id', description: 'UUID da turma' }),
        ApiBody({
            type: UpdateClassroomDto,
            examples: {
                renomear: {
                    summary: 'Renomear e mudar cor',
                    value: { name: 'Matemática — Turma B', colorBackground: '#56B2D4' },
                },
                arquivar: {
                    summary: 'Arquivar turma',
                    value: { isActive: false },
                },
            },
        }),
        ApiResponse({ status: 200, description: 'Turma atualizada' }),
        ApiResponse({ status: 403, description: 'Apenas o professor dono pode editar' }),
        ApiResponse({ status: 404, description: 'Turma não encontrada' }),
    );
}

export function DeleteClassroomDocs() {
    return applyDecorators(
        ApiOperation({
            summary: 'Excluir turma',
            description: 'Apenas o **EDUCATOR dono** pode excluir. Remove também todas as matrículas (cascade).',
        }),
        ApiParam({ name: 'id', description: 'UUID da turma' }),
        ApiResponse({ status: 200, description: 'Turma excluída' }),
        ApiResponse({ status: 403, description: 'Apenas o professor dono pode excluir' }),
        ApiResponse({ status: 404, description: 'Turma não encontrada' }),
    );
}

export function JoinClassroomDocs() {
    return applyDecorators(
        ApiOperation({
            summary: 'Entrar em uma turma',
            description:
                'Disponível para todas as roles. O `roleInClass` é derivado automaticamente da role do usuário logado:\n\n' +
                '- `STUDENT` → `STUDENT`\n' +
                '- `EDUCATOR` / `MANAGER` → `EDUCATOR`',
        }),
        ApiBody({
            type: JoinClassroomDto,
            examples: {
                aluno: {
                    summary: 'Aluno entrando na turma',
                    value: { classCode: 'ABC1D2' },
                },
                educador: {
                    summary: 'Educador entrando como membro',
                    value: { classCode: 'ABC1D2' },
                },
            },
        }),
        ApiResponse({ status: 201, description: 'Matriculado com sucesso' }),
        ApiResponse({ status: 403, description: 'Turma arquivada' }),
        ApiResponse({ status: 404, description: 'Código de turma inválido' }),
        ApiResponse({ status: 409, description: 'Usuário já matriculado nesta turma' }),
    );
}

export function FindClassroomSignsDocs() {
    return applyDecorators(
        ApiOperation({
            summary: 'Listar sinais da turma',
            description:
                'Retorna todos os sinais cadastrados para esta turma, ordenados por nome.\n\n' +
                'Cada sinal inclui: `id`, `name`, `category`, `videoUrl`, `anotherUrl`, `createdAt`.\n\n' +
                'Disponível para todas as roles — use para montar a tela de detalhe de uma turma.',
        }),
        ApiParam({ name: 'id', description: 'UUID da turma' }),
        ApiResponse({
            status: 200,
            description: 'Lista de sinais da turma ordenada por nome',
            schema: {
                example: {
                    success: true,
                    message: 'Sinais obtidos com sucesso',
                    object: [
                        {
                            id: 'uuid-do-sinal',
                            name: 'Bom dia',
                            category: { id: 'uuid-cat', name: 'Verbo', value: 'VERBO' },
                            videoUrl: 'https://r2.example.com/signs/videos/abc.mp4',
                            anotherUrl: null,
                            createdAt: '2026-05-01T10:00:00.000Z',
                        },
                    ],
                },
            },
        }),
        ApiResponse({ status: 404, description: 'Turma não encontrada' }),
    );
}

export function LeaveClassroomDocs() {
    return applyDecorators(
        ApiOperation({ summary: 'Sair de uma turma' }),
        ApiParam({ name: 'id', description: 'UUID da turma' }),
        ApiResponse({ status: 200, description: 'Saiu da turma com sucesso' }),
        ApiResponse({ status: 404, description: 'Matrícula não encontrada' }),
    );
}
