import {
  Body, Controller, Delete, Get, Param, Patch, Post, Request,
  UploadedFile, UseGuards, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '@modules/auth/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { Role } from '@common/enums/enum';
import { documentMulterOptions } from '@common/security/file-validation';
import { type AuthenticatedRequest } from '@common/interfaces/authenticated';

import { EssayService } from './essay.service';
import {
  CreateEssayExampleDto,
  CreateEssayPromptDto,
  UpdateEssayPromptDto,
} from './dto/essay.dto';

const ALL_ROLES = [Role.STUDENT, Role.EDUCATOR, Role.GUARDIAN, Role.MANAGER] as const;

@ApiTags('Essay')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class EssayController {
  constructor(private readonly essayService: EssayService) {}

  // GET /disciplines/:id/essay-prompts — propostas com a marcação do próprio usuário
  @Roles(...ALL_ROLES)
  @Get('disciplines/:id/essay-prompts')
  async findPrompts(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    const prompts = await this.essayService.findPrompts(id, req.user.userId);
    return { success: true, message: 'Propostas obtidas com sucesso', object: prompts };
  }

  // POST /disciplines/:id/essay-prompts
  @Roles(Role.EDUCATOR, Role.MANAGER)
  @Post('disciplines/:id/essay-prompts')
  async createPrompt(
    @Param('id') id: string,
    @Body() dto: CreateEssayPromptDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const prompt = await this.essayService.createPrompt(id, req.user.userId, dto);
    return { success: true, message: 'Proposta criada com sucesso', object: prompt };
  }

  // PATCH /essay-prompts/:id
  @Roles(Role.EDUCATOR, Role.MANAGER)
  @Patch('essay-prompts/:id')
  async updatePrompt(@Param('id') id: string, @Body() dto: UpdateEssayPromptDto) {
    const prompt = await this.essayService.updatePrompt(id, dto);
    return { success: true, message: 'Proposta atualizada com sucesso', object: prompt };
  }

  // DELETE /essay-prompts/:id
  @Roles(Role.EDUCATOR, Role.MANAGER)
  @Delete('essay-prompts/:id')
  async deletePrompt(@Param('id') id: string) {
    await this.essayService.deletePrompt(id);
    return { success: true, message: 'Proposta excluída com sucesso' };
  }

  // POST /essay-prompts/:id/complete — aluno marca a própria proposta
  @Roles(...ALL_ROLES)
  @Post('essay-prompts/:id/complete')
  async complete(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    await this.essayService.setCompletion(id, req.user.userId, true);
    return { success: true, message: 'Proposta marcada como concluída' };
  }

  // DELETE /essay-prompts/:id/complete — desmarca
  @Roles(...ALL_ROLES)
  @Delete('essay-prompts/:id/complete')
  async uncomplete(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    await this.essayService.setCompletion(id, req.user.userId, false);
    return { success: true, message: 'Proposta desmarcada' };
  }

  // GET /disciplines/:id/essay-examples
  @Roles(...ALL_ROLES)
  @Get('disciplines/:id/essay-examples')
  async findExamples(@Param('id') id: string) {
    const examples = await this.essayService.findExamples(id);
    return { success: true, message: 'Exemplos obtidos com sucesso', object: examples };
  }

  // POST /disciplines/:id/essay-examples — upload de PDF/imagem
  @Roles(Role.EDUCATOR, Role.MANAGER)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', documentMulterOptions))
  @Post('disciplines/:id/essay-examples')
  async createExample(
    @Param('id') id: string,
    @Body() dto: CreateEssayExampleDto,
    @UploadedFile() file: Express.Multer.File,
    @Request() req: AuthenticatedRequest,
  ) {
    const example = await this.essayService.createExample(id, req.user.userId, dto, file);
    return { success: true, message: 'Exemplo adicionado com sucesso', object: example };
  }

  // DELETE /essay-examples/:id
  @Roles(Role.EDUCATOR, Role.MANAGER)
  @Delete('essay-examples/:id')
  async deleteExample(@Param('id') id: string) {
    await this.essayService.deleteExample(id);
    return { success: true, message: 'Exemplo excluído com sucesso' };
  }
}
