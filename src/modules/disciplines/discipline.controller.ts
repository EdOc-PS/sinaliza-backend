import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { Role } from '@common/enums/enum';
import { DisciplineService } from './discipline.service';
import { CreateDisciplineDto } from './dto/create-discipline.dto';
import { UpdateDisciplineDto } from './dto/update-discipline.dto';
import { JoinDisciplineDto } from './dto/join-discipline.dto';
import type { AuthenticatedRequest } from '@common/interfaces/authenticated';
import {
  CreateDisciplineDocs,
  DeleteDisciplineDocs,
  FindEnrolledDocs,
  FindMembersDocs,
  FindMineDocs,
  FindOneDisciplineDocs,
  JoinDisciplineDocs,
  LeaveDisciplineDocs,
  UpdateDisciplineDocs,
} from '@common/swagger/disciplines';

@ApiTags('Disciplines')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('disciplines')
export class DisciplineController {
  constructor(private readonly disciplineService: DisciplineService) {}

  // ── POST /disciplines ─────────────────────────────────────────────
  @CreateDisciplineDocs()
  @Roles(Role.EDUCATOR, Role.ADMIN)
  @Post()
  async create(
    @Request() req: AuthenticatedRequest,
    @Body() dto: CreateDisciplineDto,
  ) {
    const discipline = await this.disciplineService.create(req.user.userId, dto);
    return { success: true, message: 'Disciplina criada com sucesso', object: discipline };
  }

  // ── GET /disciplines/mine ─────────────────────────────────────────
  @FindMineDocs()
  @Roles(Role.EDUCATOR, Role.ADMIN)
  @Get('mine')
  async findMine(@Request() req: AuthenticatedRequest) {
    const disciplines = await this.disciplineService.findAllByTeacher(req.user.userId);
    return { success: true, message: 'Disciplinas obtidas com sucesso', object: disciplines };
  }

  // ── GET /disciplines/enrolled ──────────────────────────────────────
  @FindEnrolledDocs()
  @Roles(Role.STUDENT, Role.GUARDIAN)
  @Get('enrolled')
  async findEnrolled(@Request() req: AuthenticatedRequest) {
    const disciplines = await this.disciplineService.findAllByStudent(req.user.userId);
    return { success: true, message: 'Disciplinas obtidas com sucesso', object: disciplines };
  }

  // ── POST /disciplines/join ─────────────────────────────────────────
  @JoinDisciplineDocs()
  @Roles(Role.STUDENT, Role.GUARDIAN)
  @Post('join')
  async join(
    @Request() req: AuthenticatedRequest,
    @Body() dto: JoinDisciplineDto,
  ) {
    const discipline = await this.disciplineService.join(req.user.userId, dto);
    return { success: true, message: 'Matriculado com sucesso', object: discipline };
  }

  // ── GET /disciplines/:id ──────────────────────────────────────────
  @FindOneDisciplineDocs()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const discipline = await this.disciplineService.findById(id);
    return { success: true, message: 'Disciplina obtida com sucesso', object: discipline };
  }

  // ── GET /disciplines/:id/members ──────────────────────────────────
  @FindMembersDocs()
  @Roles(Role.EDUCATOR, Role.ADMIN)
  @Get(':id/members')
  async findMembers(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    const members = await this.disciplineService.findMembers(id, req.user.userId);
    return { success: true, message: 'Membros obtidos com sucesso', object: members };
  }

  // ── PATCH /disciplines/:id ────────────────────────────────────────
  @UpdateDisciplineDocs()
  @Roles(Role.EDUCATOR, Role.ADMIN)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
    @Body() dto: UpdateDisciplineDto,
  ) {
    const discipline = await this.disciplineService.update(id, req.user.userId, dto);
    return { success: true, message: 'Disciplina atualizada com sucesso', object: discipline };
  }

  // ── DELETE /disciplines/:id ───────────────────────────────────────
  @DeleteDisciplineDocs()
  @Roles(Role.EDUCATOR, Role.ADMIN)
  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    await this.disciplineService.delete(id, req.user.userId);
    return { success: true, message: 'Disciplina excluída com sucesso' };
  }

  // ── DELETE /disciplines/:id/leave ────────────────────────────────
  @LeaveDisciplineDocs()
  @Roles(Role.STUDENT, Role.GUARDIAN)
  @Delete(':id/leave')
  async leave(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    await this.disciplineService.leave(req.user.userId, id);
    return { success: true, message: 'Você saiu da disciplina' };
  }
}
