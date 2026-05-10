import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { HandConfigRepository } from './repositories/hand-config.repository';
import { CreateHandConfigDto } from './dto/create-hand-config.dto';
import { UpdateHandConfigDto } from './dto/update-hand-config.dto';

@Injectable()
export class HandConfigService {
  constructor(private readonly handConfigRepository: HandConfigRepository) {}

  async create(dto: CreateHandConfigDto) {
    const nameExists = await this.handConfigRepository.existsByName(dto.name);
    if (nameExists) {
      throw new BadRequestException('Já existe uma configuração de mão com este nome');
    }
    return this.handConfigRepository.create(dto);
  }

  async findAll() {
    return this.handConfigRepository.findAll();
  }

  async findByName(name: string) {
    const handConfig = await this.handConfigRepository.findByName(name);
    if (!handConfig) throw new NotFoundException('Configuração de mão não encontrada');
    return handConfig;
  }

  async update(id: string, dto: UpdateHandConfigDto) {
    const handConfig = await this.handConfigRepository.findById(id);
    if (!handConfig) throw new NotFoundException('Configuração de mão não encontrada');
    return this.handConfigRepository.update(id, dto);
  }

  async delete(id: string) {
    const handConfig = await this.handConfigRepository.findById(id);
    if (!handConfig) throw new NotFoundException('Configuração de mão não encontrada');
    return this.handConfigRepository.delete(id);
  }
}
