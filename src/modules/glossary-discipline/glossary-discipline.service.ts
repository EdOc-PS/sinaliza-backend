import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { GlossaryDisciplineRepository } from './repositories/glossary-discipline.repository';
import { CreateGlossaryDisciplineDto } from './dto/create-glossary-discipline.dto';
import { UpdateGlossaryDisciplineDto } from './dto/update-glossary-discipline.dto';

@Injectable()
export class GlossaryDisciplineService {
  constructor(private readonly repository: GlossaryDisciplineRepository) {}

  create(dto: CreateGlossaryDisciplineDto) {
    return this.repository.create({
      name: dto.name.trim(),
      description: dto.description?.trim() || null,
    });
  }

  findAll(search?: string) {
    return this.repository.findAll(search);
  }

  async update(id: string, dto: UpdateGlossaryDisciplineDto) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundException('Disciplina do glossário não encontrada.');

    return this.repository.update(id, {
      ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
      ...(dto.description !== undefined ? { description: dto.description.trim() || null } : {}),
    });
  }

  async delete(id: string) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundException('Disciplina do glossário não encontrada.');

    if (existing._count.signs > 0) {
      throw new ConflictException(
        `Esta disciplina está associada a ${existing._count.signs} sinal(is) e não pode ser excluída.`,
      );
    }

    return this.repository.delete(id);
  }
}
