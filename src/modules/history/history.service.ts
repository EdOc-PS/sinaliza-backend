import { Injectable } from '@nestjs/common';
import { HistoryRepository } from './repositories/history.repository';

@Injectable()
export class HistoryService {
  constructor(private readonly historyRepository: HistoryRepository) {}

  async register(userId: string, signId: string) {
    return this.historyRepository.register(userId, signId);
  }

  async findByUser(userId: string, limit = 35) {
    return this.historyRepository.findByUser(userId, limit);
  }

  async remove(userId: string, signId: string) {
    return this.historyRepository.remove(userId, signId);
  }

  async clear(userId: string) {
    return this.historyRepository.clear(userId);
  }
}
