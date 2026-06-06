import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { FavoriteRepository } from './repositories/favorite.repository';

@Injectable()
export class FavoriteService {
  constructor(private readonly favoriteRepository: FavoriteRepository) {}

  async add(userId: string, signId: string) {
    const already = await this.favoriteRepository.exists(userId, signId);
    if (already) throw new ConflictException('Sinal já está nos favoritos');

    return this.favoriteRepository.add(userId, signId);
  }

  async remove(userId: string, signId: string) {
    const exists = await this.favoriteRepository.exists(userId, signId);
    if (!exists) throw new NotFoundException('Favorito não encontrado');

    return this.favoriteRepository.remove(userId, signId);
  }

  async findByUser(userId: string) {
    return this.favoriteRepository.findByUser(userId);
  }

  async findByUserAndDiscipline(userId: string, disciplineId: string) {
    return this.favoriteRepository.findByUserAndDiscipline(userId, disciplineId);
  }
}
