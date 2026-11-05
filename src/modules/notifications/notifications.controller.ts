import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/jwt-auth.guard';
import type { AuthenticatedRequest } from '@common/interfaces/authenticated';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { Role } from '@common/enums/enum';
import { NotificationsService } from './notifications.service';
import { PasswordRequestService } from './password-request.service';
import { DecidePasswordRequestDto } from './dto/decide-password-request.dto';

@ApiTags('Notifications')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly passwordRequestService: PasswordRequestService,
  ) {}

  // POST /notifications/password-requests — pede ao gestor a troca da senha
  @Throttle({ default: { ttl: 60_000, limit: 3 } })
  @Post('password-requests')
  async requestPasswordChange(@Request() req: AuthenticatedRequest) {
    await this.passwordRequestService.create(req.user.userId);
    return { success: true, message: 'Pedido enviado ao gestor' };
  }

  // PATCH /notifications/password-requests/:id — gestor aprova ou recusa
  @UseGuards(RolesGuard)
  @Roles(Role.MANAGER)
  @Patch('password-requests/:id')
  async decidePasswordRequest(
    @Param('id') id: string,
    @Body() dto: DecidePasswordRequestDto,
    @Request() req: AuthenticatedRequest,
  ) {
    await this.passwordRequestService.decide(id, req.user.userId, dto.approve);
    return { success: true, message: dto.approve ? 'Pedido aprovado' : 'Pedido recusado' };
  }

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
