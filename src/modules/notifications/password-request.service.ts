import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { Role } from '@common/enums/enum';
import { NotificationService } from '@modules/email/notification.service';

@Injectable()
export class PasswordRequestService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationService,
  ) {}

  async create(userId: string) {
    const pending = await this.prisma.passwordChangeRequest.findFirst({
      where: { userId, status: 'PENDING' },
      select: { id: true },
    });
    if (pending) throw new ConflictException('Você já tem um pedido aguardando o gestor');

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { name: true, institutionId: true },
    });
    const request = await this.prisma.passwordChangeRequest.create({ data: { userId } });
    await this.notifications.passwordChangeRequested(request.id, user.name, user.institutionId);
    return request;
  }

  async decide(id: string, managerId: string, approve: boolean) {
    const request = await this.prisma.passwordChangeRequest.findUnique({ where: { id } });
    if (!request) throw new NotFoundException('Pedido não encontrado');

    // Quem pediu não aprova o próprio pedido, a não ser que seja o único gestor
    if (request.userId === managerId) {
      const otherManagers = await this.prisma.user.count({
        where: { roles: { has: Role.MANAGER }, status: true, id: { not: managerId } },
      });
      if (otherManagers > 0) {
        throw new ForbiddenException('Outro gestor precisa decidir o seu pedido');
      }
    }

    // O filtro por PENDING impede dois gestores de decidirem o mesmo pedido
    const { count } = await this.prisma.passwordChangeRequest.updateMany({
      where: { id, status: 'PENDING' },
      data: {
        status: approve ? 'APPROVED' : 'REJECTED',
        decidedById: managerId,
        decidedAt: new Date(),
      },
    });
    if (count === 0) throw new ConflictException('Este pedido já foi decidido');

    if (approve) {
      await this.prisma.user.update({
        where: { id: request.userId },
        data: { passwordChangeApproved: true },
      });
    }
    await this.notifications.passwordChangeDecided(request.userId, approve);
  }
}
