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
            summary: 'Minhas disciplinas',
            description:
                'Lista **todas** as disciplinas do usuário autenticado — independente da role:\n\n' +
                '- Disciplinas **criadas** pelo usuário (`canManage: true`)\n' +
                '- Disciplinas em que o usuário está **matriculado** (`canManage` depende de ser o criador)\n\n' +
                'Disponível para todas as roles: `STUDENT`, `EDUCATOR`, `GUARDIAN`, `MANAGER`.',
        }),
        ApiResponse({
            status: 200,
            description: 'Lista mesclada de disciplinas criadas + matriculadas com flag `canManage` e `schoolLevelLabel`',
        }),
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
            description:
                'Disponível para todas as roles. O `roleInClass` é derivado automaticamente da role do usuário logado:\n\n' +
                '- `STUDENT` → `STUDENT`\n' +
                '- `GUARDIAN` → `FAMILY`\n' +
                '- `EDUCATOR` → `EDUCATOR`\n' +
                '- `MANAGER` → `EDUCATOR`',
        }),
        ApiBody({
            type: JoinDisciplineDto,
            examples: {
                aluno: {
                    summary: 'Aluno entrando na turma',
                    value: { classCode: 'ABC1D2' },
                },
                familiar: {
                    summary: 'Familiar acompanhando',
                    value: { classCode: 'ABC1D2' },
                },
                educador: {
                    summary: 'Educador/Intérprete entrando como membro',
                    value: { classCode: 'ABC1D2' },
                },
            },
        }),
        ApiResponse({ status: 201, description: 'Matriculado com sucesso' }),
        ApiResponse({ status: 403, description: 'Disciplina arquivada' }),
        ApiResponse({ status: 404, description: 'Código de disciplina inválido' }),
        ApiResponse({ status: 409, description: 'Usuário já matriculado nesta disciplina' }),
    );
}

export function FindSchoolLevelsDocs() {
    return applyDecorators(
        ApiOperation({
            summary: 'Listar níveis escolares',
            description: 'Retorna as opções de nível escolar disponíveis para popular o select de criação de disciplina.',
        }),
        ApiResponse({
            status: 200,
            description: 'Lista de níveis escolares ativos ordenados',
            schema: {
                example: {
                    success: true,
                    message: 'Níveis escolares obtidos com sucesso',
                    object: [
                        { label: '1o Ano do Ensino Medio', value: 'ENSINO_MEDIO_1' },
                        { label: '2o Ano do Ensino Medio', value: 'ENSINO_MEDIO_2' },
                        { label: '3o Ano do Ensino Medio', value: 'ENSINO_MEDIO_3' },
                    ],
                },
            },
        }),
    );
}

export function FindDisciplineSignsDocs() {
    return applyDecorators(
        ApiOperation({
            summary: 'Listar sinais da disciplina',
            description:
                'Retorna todos os sinais cadastrados para esta disciplina, ordenados por nome.\n\n' +
                'Cada sinal inclui: `id`, `name`, `grammaticalClass`, `videoUrl`, `anotherUrl`, `imgUrl`, `tags` e `handConfig`.\n\n' +
                'Disponível para todas as roles — use para montar a tela de detalhe de uma disciplina.',
        }),
        ApiParam({ name: 'id', description: 'UUID da disciplina' }),
        ApiResponse({
            status: 200,
            description: 'Lista de sinais da disciplina ordenada por nome',
            schema: {
                example: {
                    success: true,
                    message: 'Sinais obtidos com sucesso',
                    object: [
                        {
                            id: 'uuid-do-sinal',
                            name: 'Bom dia',
                            grammaticalClass: 'VERB',
                            videoUrl: 'https://r2.example.com/signs/videos/abc.mp4',
                            anotherUrl: null,
                            imgUrl: 'https://r2.example.com/signs/images/abc.jpg',
                            tags: ['saudação', 'cotidiano'],
                            handConfig: {
                                id: 'uuid-da-config',
                                name: 'Letra A',
                                imgUrl: 'https://r2.example.com/hand-configs/a.png',
                            },
                            createdAt: '2026-05-01T10:00:00.000Z',
                        },
                    ],
                },
            },
        }),
        ApiResponse({ status: 404, description: 'Disciplina não encontrada' }),
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
