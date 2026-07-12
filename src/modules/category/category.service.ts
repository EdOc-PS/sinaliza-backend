import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CategoryRepository } from './repositories/category.repository';
import { CreateCategoryDto } from './dto/create-category.dto';

// Gera o value em UPPER_SNAKE a partir do nome (remove acentos, espaços viram "_")
export function toCategoryValue(name: string): string {
  return name
    .trim()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // remove acentos (marcas diacríticas)
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async create(dto: CreateCategoryDto) {
    const name = dto.name.trim();
    const value = toCategoryValue(name);

    if (!value) {
      throw new BadRequestException('Nome de categoria inválido.');
    }

    const existing = await this.categoryRepository.findByValue(value);
    if (existing) {
      throw new ConflictException('Já existe uma categoria equivalente.');
    }

    return this.categoryRepository.create({ name, value });
  }

  findAll(search?: string) {
    return this.categoryRepository.findAll(search);
  }

  async delete(id: string) {
    const category = await this.categoryRepository.findById(id);
    if (!category) throw new NotFoundException('Categoria não encontrada.');

    const inUse = await this.categoryRepository.countSigns(id);
    if (inUse > 0) {
      throw new ConflictException(
        `Esta categoria está em uso por ${inUse} sinal(is) e não pode ser excluída.`,
      );
    }

    return this.categoryRepository.delete(id);
  }
}
