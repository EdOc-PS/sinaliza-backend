import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

interface PromptData {
  title: string;
  description?: string | null;
}

@Injectable()
export class EssayRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ── Propostas ──────────────────────────────────────────

  // Traz as propostas da turma já com a marcação de concluída pelo usuário
  async findPromptsByDiscipline(classroomId: string, userId: string) {
    const prompts = await this.prisma.essayPrompt.findMany({
      where: { classroomId },
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        completions: { where: { userId }, select: { completedAt: true } },
        _count: { select: { completions: true } },
      },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    });

    return prompts.map(({ completions, _count, ...rest }) => ({
      ...rest,
      completed: completions.length > 0,
      completedAt: completions[0]?.completedAt ?? null,
      completionCount: _count.completions,
    }));
  }

  findPromptById(id: string) {
    return this.prisma.essayPrompt.findUnique({ where: { id } });
  }

  createPrompt(classroomId: string, creatorId: string, data: PromptData) {
    return this.prisma.essayPrompt.create({
      data: { ...data, classroomId, creatorId },
    });
  }

  updatePrompt(id: string, data: PromptData) {
    return this.prisma.essayPrompt.update({ where: { id }, data });
  }

  deletePrompt(id: string) {
    return this.prisma.essayPrompt.delete({ where: { id } });
  }

  // ── Conclusão individual ───────────────────────────────

  markCompleted(userId: string, promptId: string) {
    return this.prisma.essayPromptCompletion.upsert({
      where: { userId_promptId: { userId, promptId } },
      create: { userId, promptId },
      update: {},
    });
  }

  unmarkCompleted(userId: string, promptId: string) {
    return this.prisma.essayPromptCompletion.deleteMany({ where: { userId, promptId } });
  }

  // ── Exemplos ───────────────────────────────────────────

  findExamplesByDiscipline(classroomId: string) {
    return this.prisma.essayExample.findMany({
      where: { classroomId },
      select: {
        id: true,
        title: true,
        description: true,
        fileUrl: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findExampleById(id: string) {
    return this.prisma.essayExample.findUnique({ where: { id } });
  }

  createExample(
    classroomId: string,
    creatorId: string,
    data: { title: string; description?: string | null; fileUrl: string },
  ) {
    return this.prisma.essayExample.create({ data: { ...data, classroomId, creatorId } });
  }

  deleteExample(id: string) {
    return this.prisma.essayExample.delete({ where: { id } });
  }
}
