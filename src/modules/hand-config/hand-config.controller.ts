import {
  Body, Controller, Delete, Get, Param, Patch, Post, Query,
  UploadedFile, UseGuards, UseInterceptors, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { Role } from '@common/enums/enum';
import { HandConfigService } from './hand-config.service';
import { CreateHandConfigDto } from './dto/create-hand-config.dto';
import { UpdateHandConfigDto } from './dto/update-hand-config.dto';
import {
  CreateHandConfigDocs,
  DeleteHandConfigDocs,
  FindAllHandConfigsDocs,
  FindOneHandConfigDocs,
  UpdateHandConfigDocs,
} from '@/common/swagger/hand-config';

@ApiTags('Hand Config')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('hand-config')
export class HandConfigController {
  constructor(private readonly handConfigService: HandConfigService) {}

  // POST /hand-config
  @CreateHandConfigDocs()
  @Roles(Role.EDUCATOR, Role.ADMIN)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  @Post()
  async create(
    @Body() dto: CreateHandConfigDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Imagem é obrigatória');
    const handConfig = await this.handConfigService.create(dto, file);
    return { success: true, message: 'Configuração de mão criada com sucesso', object: handConfig };
  }

  // GET /hand-config?search=
  @FindAllHandConfigsDocs()
  @Roles(Role.STUDENT, Role.EDUCATOR, Role.GUARDIAN, Role.ADMIN)
  @Get()
  async findAll(@Query('search') search?: string) {
    const handConfigs = await this.handConfigService.findAll(search);
    return { success: true, message: 'Configurações de mão obtidas com sucesso', object: handConfigs };
  }

  // GET /hand-config/search/:name
  @FindOneHandConfigDocs()
  @Roles(Role.STUDENT, Role.EDUCATOR, Role.GUARDIAN, Role.ADMIN)
  @Get('search/:name')
  async findOne(@Param('name') name: string) {
    const handConfig = await this.handConfigService.findByName(name);
    return { success: true, message: 'Configuração de mão obtida com sucesso', object: handConfig };
  }

  // PATCH /hand-config/:id
  @UpdateHandConfigDocs()
  @Roles(Role.EDUCATOR, Role.ADMIN)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateHandConfigDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const handConfig = await this.handConfigService.update(id, dto, file);
    return { success: true, message: 'Configuração de mão atualizada com sucesso', object: handConfig };
  }

  // DELETE /hand-config/:id
  @DeleteHandConfigDocs()
  @Roles(Role.EDUCATOR, Role.ADMIN)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.handConfigService.delete(id);
    return { success: true, message: 'Configuração de mão excluída com sucesso' };
  }
}
