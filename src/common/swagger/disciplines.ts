import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { CreateDisciplineDto } from '@modules/disciplines/dto/create-discipline.dto';
import { UpdateDisciplineDto } from '@modules/disciplines/dto/update-discipline.dto';
import { JoinDisciplineDto } from '@modules/disciplines/dto/join-discipline.dto';

export function CreateDisciplineDocs() {
    return applyDecorators(
        ApiOperation({
            summary: 'Criar disciplina',
            description: 'Apenas **EDUCATOR**. O `classCode` é gerado automaticamente.',
        }),
        ApiBody({
            type: CreateDisciplineDto,
            examples: {
                completo: {
                    summary: 'Com todas as informações',
                    value: {
                        name: 'Matemática Aplicada',
                        description: 'Turma de matemática para 1º ano do ensino médio',
                        colorBackground: '#BACA57',
                        schoolYear: 2026,
                        schoolLevel: 'ENSINO_MEDIO_1',
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
        ApiResponse({ status: 201, description: 'Disciplina criada com classCode gerado' }),
        ApiResponse({ status: 400, description: 'Dados inválidos' }),
        ApiResponse({ status: 403, description: 'Apenas EDUCATOR pode criar disciplinas' }),
    );
}

export function FindMineDocs() {
    return applyDecorators(
        ApiOperation({
            summary: 'Minhas disciplinas (professor)',
            description: 'Lista todas as disciplinas criadas pelo **EDUCATOR** autenticado.',
        }),
        ApiResponse({ status: 200, description: 'Lista de disciplinas do professor' }),
    );
}

export function FindEnrolledDocs() {
    return applyDecorators(
        ApiOperation({
            summary: 'Disciplinas matriculadas (aluno/familiar)',
            description: 'Lista as disciplinas em que o **STUDENT** ou **GUARDIAN** está matriculado.',
        }),
        ApiResponse({ status: 200, description: 'Lista de matrículas com disciplinas' }),
    );
}

export function FindOneDisciplineDocs() {
    return applyDecorators(
        ApiOperation({ summary: 'Buscar disciplina por ID' }),
        ApiParam({ name: 'id', description: 'UUID da disciplina' }),
        ApiResponse({ status: 200, description: 'Disciplina encontrada' }),
        ApiResponse({ status: 404, description: 'Disciplina não encontrada' }),
    );
}

export function FindMembersDocs() {
    return applyDecorators(
        ApiOperation({
            summary: 'Listar membros da disciplina',
            description: 'Apenas o **EDUCATOR dono** da disciplina pode ver os membros.',
        }),
        ApiParam({ name: 'id', description: 'UUID da disciplina' }),
        ApiResponse({ status: 200, description: 'Lista de membros matriculados' }),
        ApiResponse({ status: 403, description: 'Apenas o professor dono pode acessar' }),
        ApiResponse({ status: 404, description: 'Disciplina não encontrada' }),
    );
}

export function UpdateDisciplineDocs() {
    return applyDecorators(
        ApiOperation({
            summary: 'Atualizar disciplina',
            description: 'Apenas o **EDUCATOR dono** pode editar. Use `isActive: false` para arquivar.',
        }),
        ApiParam({ name: 'id', description: 'UUID da disciplina' }),
        ApiBody({
            type: UpdateDisciplineDto,
            examples: {
                renomear: {
                    summary: 'Renomear e mudar cor',
                    value: { name: 'Matemática — Turma B', colorBackground: '#56B2D4' },
                },
                arquivar: {
                    summary: 'Arquivar disciplina',
                    value: { isActive: false },
                },
            },
        }),
        ApiResponse({ status: 200, description: 'Disciplina atualizada' }),
        ApiResponse({ status: 403, description: 'Apenas o professor dono pode editar' }),
        ApiResponse({ status: 404, description: 'Disciplina não encontrada' }),
    );
}

export function DeleteDisciplineDocs() {
    return applyDecorators(
        ApiOperation({
            summary: 'Excluir disciplina',
            description: 'Apenas o **EDUCATOR dono** pode excluir. Remove também todas as matrículas (cascade).',
        }),
        ApiParam({ name: 'id', description: 'UUID da disciplina' }),
        ApiResponse({ status: 200, description: 'Disciplina excluída' }),
        ApiResponse({ status: 403, description: 'Apenas o professor dono pode excluir' }),
        ApiResponse({ status: 404, description: 'Disciplina não encontrada' }),
    );
}

export function JoinDisciplineDocs() {
    return applyDecorators(
        ApiOperation({
            summary: 'Entrar em uma disciplina',
            description: 'Disponível para **STUDENT** e **GUARDIAN**. Use o `classCode` fornecido pelo professor.',
        }),
        ApiBody({
            type: JoinDisciplineDto,
            examples: {
                aluno: {
                    summary: 'Aluno entrando na turma',
                    value: { classCode: 'ABC1D2', roleInClass: 'STUDENT' },
                },
                familiar: {
                    summary: 'Familiar acompanhando',
                    value: { classCode: 'ABC1D2', roleInClass: 'FAMILY' },
                },
            },
        }),
        ApiResponse({ status: 201, description: 'Matriculado com sucesso' }),
        ApiResponse({ status: 404, description: 'Código de disciplina inválido' }),
        ApiResponse({ status: 409, description: 'Usuário já matriculado nesta disciplina' }),
    );
}

export function LeaveDisciplineDocs() {
    return applyDecorators(
        ApiOperation({ summary: 'Sair de uma disciplina' }),
        ApiParam({ name: 'id', description: 'UUID da disciplina' }),
        ApiResponse({ status: 200, description: 'Saiu da disciplina com sucesso' }),
        ApiResponse({ status: 404, description: 'Matrícula não encontrada' }),
    );
}
