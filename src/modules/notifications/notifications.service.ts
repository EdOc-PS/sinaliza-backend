import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

// Mostra só as mais recentes: o sino não precisa de paginação
const LIST_LIMIT = 50;

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  findByUser(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: LIST_LIMIT,
    });
  }

  markAllRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
  }

  // O filtro por userId impede apagar a notificação de outra pessoa
  remove(userId: string, id: string) {
    return this.prisma.notification.deleteMany({ where: { id, userId } });
  }

  removeAll(userId: string) {
    return this.prisma.notification.deleteMany({ where: { userId } });
  }
}
