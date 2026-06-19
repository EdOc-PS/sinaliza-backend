import { Controller, Delete, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { Role } from '@common/enums/enum';
import type { AuthenticatedRequest } from '@common/interfaces/authenticated';
import { HistoryService } from './history.service';
import { ClearHistoryDocs, FindAllHistoryDocs, RegisterHistoryDocs, RemoveHistoryItemDocs } from '@/common/swagger/history';

@ApiTags('History')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  // POST /history/:signId
  @RegisterHistoryDocs()
  @Roles(Role.STUDENT, Role.EDUCATOR, Role.GUARDIAN, Role.ADMIN)
  @Post(':signId')
  async register(
    @Param('signId') signId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    const history = await this.historyService.register(req.user.userId, signId);
    return { success: true, message: 'Acesso registrado no histórico', object: history };
  }

  // GET /history
  @FindAllHistoryDocs()
  @Roles(Role.STUDENT, Role.EDUCATOR, Role.GUARDIAN, Role.ADMIN)
  @Get()
  async findAll(@Request() req: AuthenticatedRequest) {
    const history = await this.historyService.findByUser(req.user.userId);
    return { success: true, message: 'Histórico obtido com sucesso', object: history };
  }

  // DELETE /history
  @ClearHistoryDocs()
  @Roles(Role.STUDENT, Role.EDUCATOR, Role.GUARDIAN, Role.ADMIN)
  @Delete()
  async clear(@Request() req: AuthenticatedRequest) {
    await this.historyService.clear(req.user.userId);
    return { success: true, message: 'Histórico limpo com sucesso' };
  }

  // DELETE /history/:signId
  @RemoveHistoryItemDocs()
  @Roles(Role.STUDENT, Role.EDUCATOR, Role.GUARDIAN, Role.ADMIN)
  @Delete(':signId')
  async remove(
    @Param('signId') signId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    await this.historyService.remove(req.user.userId, signId);
    return { success: true, message: 'Sinal removido do histórico' };
  }
}
