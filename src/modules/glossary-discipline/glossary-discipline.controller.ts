import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '@modules/auth/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { Role } from '@common/enums/enum';

import { GlossaryDisciplineService } from './glossary-discipline.service';
import { CreateGlossaryDisciplineDto } from './dto/create-glossary-discipline.dto';
import { UpdateGlossaryDisciplineDto } from './dto/update-glossary-discipline.dto';

@ApiTags('GlossaryDiscipline')
@Controller('glossary-discipline')
export class GlossaryDisciplineController {
  constructor(private readonly service: GlossaryDisciplineService) {}

  // GET /glossary-discipline?search= — público (glossário aberto e área logada)
  @Get()
  async findAll(@Query('search') search?: string) {
    const disciplines = await this.service.findAll(search);
    return { success: true, message: 'Disciplinas do glossário obtidas com sucesso', object: disciplines };
  }

  // POST /glossary-discipline — apenas gestor
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MANAGER)
  @Post()
  async create(@Body() dto: CreateGlossaryDisciplineDto) {
    const discipline = await this.service.create(dto);
    return { success: true, message: 'Disciplina do glossário criada com sucesso', object: discipline };
  }

  // PATCH /glossary-discipline/:id — apenas gestor
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MANAGER)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateGlossaryDisciplineDto) {
    const discipline = await this.service.update(id, dto);
    return { success: true, message: 'Disciplina do glossário atualizada com sucesso', object: discipline };
  }

  // DELETE /glossary-discipline/:id — apenas gestor
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MANAGER)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.service.delete(id);
    return { success: true, message: 'Disciplina do glossário excluída com sucesso' };
  }
}
