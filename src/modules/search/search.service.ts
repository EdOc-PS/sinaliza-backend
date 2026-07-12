import { Injectable, NotFoundException } from '@nestjs/common';
import { SearchRepository } from './repositories/search.repository';

interface SearchFilters {
  search?: string;
  handConfigId?: string;
  categoryId?: string;
}

@Injectable()
export class SearchService {
  constructor(private readonly searchRepository: SearchRepository) {}

  // Busca global — apenas sinais de disciplinas que o usuário leciona ou está matriculado
  async searchSigns(userId: string, filters: SearchFilters) {
    return this.searchRepository.searchAccessibleSigns(userId, filters);
  }

  // Busca dentro de uma disciplina específica (valida acesso do usuário)
  async searchDisciplineSigns(userId: string, disciplineId: string, filters: SearchFilters) {
    const hasAccess = await this.searchRepository.hasDisciplineAccess(userId, disciplineId);
    if (!hasAccess) {
      throw new NotFoundException('Disciplina não encontrada ou sem acesso');
    }
    return this.searchRepository.searchSignsInDiscipline(disciplineId, filters);
  }

  // Sinais semelhantes ao informado, acessíveis ao usuário.
  // Ordena por relevância: mesma config + classe (3) > mesma config (2) > mesma classe (1)
  async findRelatedSigns(userId: string, signId: string) {
    const base = await this.searchRepository.findSignBasics(signId);
    if (!base) throw new NotFoundException('Sinal não encontrado');

    const candidates = await this.searchRepository.findRelatedCandidates(
      userId,
      signId,
      base.handConfigId,
      base.categoryId,
    );

    const relevance = (candidate: (typeof candidates)[number]) => {
      const sameConfig = candidate.handConfig?.id === base.handConfigId;
      const sameCategory = candidate.categoryId === base.categoryId;
      if (sameConfig && sameCategory) return 3;
      if (sameConfig) return 2;
      return 1;
    };

    return [...candidates].sort((a, b) => {
      const diff = relevance(b) - relevance(a);
      return diff !== 0 ? diff : a.name.localeCompare(b.name);
    });
  }
}
