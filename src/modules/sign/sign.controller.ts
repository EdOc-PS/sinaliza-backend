import {
  Body, Controller, Delete, Get, Param, Patch, Post, Query, Request,
  UploadedFiles, UseGuards, UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';

import { JwtAuthGuard } from '@modules/auth/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { Role } from '@common/enums/enum';

import { type AuthenticatedRequest } from '@common/interfaces/authenticated';

import { SignService } from './sign.service';
import { CreateSignDto } from './dto/create-sign.dto';
import { UpdateSignDto } from './dto/update-sign.dto';
import { ReviewPromotionDto } from './dto/review-promotion.dto';
import { PromoteSignDto } from './dto/promote-sign.dto';
import { signMulterOptions } from '@common/security/file-validation';
import {
  CreateSignDocs,
  DeleteSignDocs,
  FindAllSignsDocs,
  FindOneSignDocs,
  FindSignOptionsDocs,
  UpdateSignDocs,
} from '@/common/swagger/sign';

type SignUploads = {
  video?: Express.Multer.File[];
  image?: Express.Multer.File[];
};

@ApiTags('Sign')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('sign')
export class SignController {
  constructor(private readonly signService: SignService) {}

  // POST /sign
  @CreateSignDocs()
  @Roles(Role.EDUCATOR, Role.MANAGER)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'video', maxCount: 1 },
    { name: 'image', maxCount: 1 },
  ], signMulterOptions))
  @Post()
  async create(
    @Request() req: AuthenticatedRequest,
    @Body() dto: CreateSignDto,
    @UploadedFiles() files: SignUploads,
  ) {
    const sign = await this.signService.create(dto, req.user.userId, {
      video: files?.video?.[0],
      image: files?.image?.[0],
    });
    return { success: true, message: 'Sinal criado com sucesso', object: sign };
  }

  // GET /sign/options
  @FindSignOptionsDocs()
  @Roles(Role.STUDENT, Role.EDUCATOR, Role.GUARDIAN, Role.MANAGER)
  @Get('options')
  async findOptions(@Request() req: AuthenticatedRequest) {
    const options = await this.signService.findOptions(req.user.userId);
    return { success: true, message: 'Opções obtidas com sucesso', object: options };
  }

  // GET /sign?search=&categoryId=&handConfigId=&tag=
  @FindAllSignsDocs()
  @Roles(Role.STUDENT, Role.EDUCATOR, Role.GUARDIAN, Role.MANAGER)
  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('handConfigId') handConfigId?: string,
    @Query('tag') tag?: string,
  ) {
    const signs = await this.signService.findAll({ search, categoryId, handConfigId, tag });
    return { success: true, message: 'Sinais obtidos com sucesso', object: signs };
  }

  // GET /sign/promotions — sinais aguardando aprovação (educador visualiza, só gestor aprova/recusa)
  @Roles(Role.EDUCATOR, Role.MANAGER)
  @Get('promotions')
  async findPendingPromotions() {
    const signs = await this.signService.findPendingPromotions();
    return { success: true, message: 'Promoções pendentes obtidas com sucesso', object: signs };
  }

  // GET /sign/:id
  @FindOneSignDocs()
  @Roles(Role.STUDENT, Role.EDUCATOR, Role.GUARDIAN, Role.MANAGER)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const sign = await this.signService.findById(id);
    return { success: true, message: 'Sinal obtido com sucesso', object: sign };
  }

  // PATCH /sign/:id/promote — educador envia o sinal para aprovação do gestor
  @Roles(Role.EDUCATOR, Role.MANAGER)
  @Patch(':id/promote')
  async promote(
    @Param('id') id: string,
    @Body() dto: PromoteSignDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const sign = await this.signService.promote(id, req.user.userId, req.user.roles, dto.glossaryDisciplineIds);
    return { success: true, message: 'Sinal enviado para aprovação do gestor', object: sign };
  }

  // PATCH /sign/:id/promotion — gestor aprova ou recusa a promoção
  @Roles(Role.MANAGER)
  @Patch(':id/promotion')
  async reviewPromotion(
    @Param('id') id: string,
    @Body() dto: ReviewPromotionDto,
  ) {
    const sign = await this.signService.reviewPromotion(id, dto.approve);
    return {
      success: true,
      message: dto.approve ? 'Sinal aprovado — agora é público!' : 'Promoção recusada',
      object: sign,
    };
  }

  // PATCH /sign/:id
  @UpdateSignDocs()
  @Roles(Role.EDUCATOR, Role.MANAGER)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'video', maxCount: 1 },
    { name: 'image', maxCount: 1 },
  ], signMulterOptions))
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateSignDto,
    @UploadedFiles() files: SignUploads,
  ) {
    const sign = await this.signService.update(id, dto, {
      video: files?.video?.[0],
      image: files?.image?.[0],
    });
    return { success: true, message: 'Sinal atualizado com sucesso', object: sign };
  }

  // DELETE /sign/:id
  @DeleteSignDocs()
  @Roles(Role.EDUCATOR, Role.MANAGER)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.signService.delete(id);
    return { success: true, message: 'Sinal excluído com sucesso' };
  }
}
