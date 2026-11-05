import { Controller, Delete, Get, Param, Patch, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/jwt-auth.guard';
import type { AuthenticatedRequest } from '@common/interfaces/authenticated';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // GET /notifications
  @Get()
  async findAll(@Request() req: AuthenticatedRequest) {
    const notifications = await this.notificationsService.findByUser(req.user.userId);
    return { success: true, message: 'Notificações obtidas com sucesso', object: notifications };
  }

  // PATCH /notifications/read-all
  @Patch('read-all')
  async markAllRead(@Request() req: AuthenticatedRequest) {
    await this.notificationsService.markAllRead(req.user.userId);
    return { success: true, message: 'Notificações marcadas como lidas' };
  }

  // DELETE /notifications
  @Delete()
  async removeAll(@Request() req: AuthenticatedRequest) {
    await this.notificationsService.removeAll(req.user.userId);
    return { success: true, message: 'Notificações apagadas' };
  }

  // DELETE /notifications/:id
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    await this.notificationsService.remove(req.user.userId, id);
    return { success: true, message: 'Notificação apagada' };
  }
}
