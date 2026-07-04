import { Controller, Get, Param, Query, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import type { GrammaticalClass } from '@prisma/client';

import { JwtAuthGuard } from '@modules/auth/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { Role } from '@common/enums/enum';
import { type AuthenticatedRequest } from '@common/interfaces/authenticated';

import { SearchService } from './search.service';
import { SearchSignsDocs, SearchDisciplineSignsDocs, RelatedSignsDocs } from '@common/swagger/search';

@ApiTags('Search')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  // GET /search/signs?search=&handConfigId=
  @SearchSignsDocs()
  @Roles(Role.STUDENT, Role.EDUCATOR, Role.GUARDIAN, Role.MANAGER)
  @Get('signs')
  async searchSigns(
    @Request() req: AuthenticatedRequest,
    @Query('search') search?: string,
    @Query('handConfigId') handConfigId?: string,
    @Query('grammaticalClass') grammaticalClass?: GrammaticalClass,
  ) {
    const signs = await this.searchService.searchSigns(req.user.userId, { search, handConfigId, grammaticalClass });
    return { success: true, message: 'Sinais obtidos com sucesso', object: signs };
  }

  // GET /search/disciplines/:disciplineId/signs?search=&handConfigId=
  @SearchDisciplineSignsDocs()
  @Roles(Role.STUDENT, Role.EDUCATOR, Role.GUARDIAN, Role.MANAGER)
  @Get('disciplines/:disciplineId/signs')
  async searchDisciplineSigns(
    @Request() req: AuthenticatedRequest,
    @Param('disciplineId') disciplineId: string,
    @Query('search') search?: string,
    @Query('handConfigId') handConfigId?: string,
    @Query('grammaticalClass') grammaticalClass?: GrammaticalClass,
  ) {
    const signs = await this.searchService.searchDisciplineSigns(
      req.user.userId,
      disciplineId,
      { search, handConfigId, grammaticalClass },
    );
    return { success: true, message: 'Sinais obtidos com sucesso', object: signs };
  }

  // GET /search/signs/:signId/related
  @RelatedSignsDocs()
  @Roles(Role.STUDENT, Role.EDUCATOR, Role.GUARDIAN, Role.MANAGER)
  @Get('signs/:signId/related')
  async findRelatedSigns(
    @Request() req: AuthenticatedRequest,
    @Param('signId') signId: string,
  ) {
    const signs = await this.searchService.findRelatedSigns(req.user.userId, signId);
    return { success: true, message: 'Sinais semelhantes obtidos com sucesso', object: signs };
  }
}
