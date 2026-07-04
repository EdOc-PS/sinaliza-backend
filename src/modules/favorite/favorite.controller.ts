import { Controller, Delete, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { Role } from '@common/enums/enum';
import type { AuthenticatedRequest } from '@common/interfaces/authenticated';
import { FavoriteService } from './favorite.service';
import { AddFavoriteDocs, FindAllFavoritesDocs, RemoveFavoriteDocs } from '@/common/swagger/favorite';

@ApiTags('Favorites')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('favorite')
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  // POST /favorite/:signId
  @AddFavoriteDocs()
  @Roles(Role.STUDENT, Role.EDUCATOR, Role.GUARDIAN, Role.MANAGER)
  @Post(':signId')
  async add(
    @Param('signId') signId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    const favorite = await this.favoriteService.add(req.user.userId, signId);
    return { success: true, message: 'Sinal adicionado aos favoritos', object: favorite };
  }

  // DELETE /favorite/:signId
  @RemoveFavoriteDocs()
  @Roles(Role.STUDENT, Role.EDUCATOR, Role.GUARDIAN, Role.MANAGER)
  @Delete(':signId')
  async remove(
    @Param('signId') signId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    await this.favoriteService.remove(req.user.userId, signId);
    return { success: true, message: 'Sinal removido dos favoritos' };
  }

  // GET /favorite
  @FindAllFavoritesDocs()
  @Roles(Role.STUDENT, Role.EDUCATOR, Role.GUARDIAN, Role.MANAGER)
  @Get()
  async findAll(@Request() req: AuthenticatedRequest) {
    const favorites = await this.favoriteService.findByUser(req.user.userId);
    return { success: true, message: 'Favoritos obtidos com sucesso', object: favorites };
  }
}
