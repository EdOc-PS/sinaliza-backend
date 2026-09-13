import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '@/database/prisma.service';
import { R2Service } from '@modules/r2/r2.service';
import { assertValidDocument } from '@common/security/file-validation';

import { EssayRepository } from './repositories/essay.repository';
import {
  CreateEssayExampleDto,
  CreateEssayPromptDto,
  UpdateEssayPromptDto,
} from './dto/essay.dto';

@Injectable()
export class EssayService {
  constructor(
    private readonly essayRepository: EssayRepository,
    private readonly prisma: PrismaService,
    private readonly r2Service: R2Service,
  ) {}

  // Propostas e exemplos só existem na turma Contexto
  private async assertContextClassroom(classroomId: string) {
    const classroom = await this.prisma.classroom.findUnique({
      where: { id: classroomId },
      select: { id: true, isContext: true },
    });

    if (!classroom) throw new NotFoundException('Turma não encontrada.');
    if (!classroom.isContext) {
      throw new BadRequestException(
        'Propostas e exemplos de redação existem apenas na turma Contexto.',
      );
    }
  }

  // ── Propostas ──────────────────────────────────────────

  findPrompts(classroomId: string, userId: string) {
    return this.essayRepository.findPromptsByDiscipline(classroomId, userId);
  }

  async createPrompt(classroomId: string, creatorId: string, dto: CreateEssayPromptDto) {
    await this.assertContextClassroom(classroomId);

    return this.essayRepository.createPrompt(classroomId, creatorId, {
      title: dto.title.trim(),
      description: dto.description?.trim() || null,
    });
  }

  async updatePrompt(id: string, dto: UpdateEssayPromptDto) {
    const prompt = await this.essayRepository.findPromptById(id);
    if (!prompt) throw new NotFoundException('Proposta não encontrada.');

    return this.essayRepository.updatePrompt(id, {
      title: dto.title.trim(),
      description: dto.description?.trim() || null,
    });
  }

  async deletePrompt(id: string) {
    const prompt = await this.essayRepository.findPromptById(id);
    if (!prompt) throw new NotFoundException('Proposta não encontrada.');

    return this.essayRepository.deletePrompt(id);
  }

  // ── Conclusão individual ───────────────────────────────

  async setCompletion(id: string, userId: string, completed: boolean) {
    const prompt = await this.essayRepository.findPromptById(id);
    if (!prompt) throw new NotFoundException('Proposta não encontrada.');

    return completed
      ? this.essayRepository.markCompleted(userId, id)
      : this.essayRepository.unmarkCompleted(userId, id);
  }

  // ── Exemplos ───────────────────────────────────────────

  findExamples(classroomId: string) {
    return this.essayRepository.findExamplesByDiscipline(classroomId);
  }

  async createExample(
    classroomId: string,
    creatorId: string,
    dto: CreateEssayExampleDto,
    file?: Express.Multer.File,
  ) {
    await this.assertContextClassroom(classroomId);

    if (!file) throw new BadRequestException('Envie o arquivo da redação (PDF ou imagem).');
    assertValidDocument(file);

    const fileUrl = await this.r2Service.uploadDocument(file, 'essays/examples');

    return this.essayRepository.createExample(classroomId, creatorId, {
      title: dto.title.trim(),
      description: dto.description?.trim() || null,
      fileUrl,
    });
  }

  async deleteExample(id: string) {
    const example = await this.essayRepository.findExampleById(id);
    if (!example) throw new NotFoundException('Exemplo não encontrado.');

    if (example.fileUrl) await this.r2Service.delete(example.fileUrl);

    return this.essayRepository.deleteExample(id);
  }
}
