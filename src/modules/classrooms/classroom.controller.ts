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
import { ClassroomService } from './classroom.service';
import { FavoriteService } from '@modules/favorite/favorite.service';
import { CreateClassroomDto } from './dto/create-classroom.dto';
import { UpdateClassroomDto } from './dto/update-classroom.dto';
import { JoinClassroomDto } from './dto/join-classroom.dto';
import { AddMemberDto } from './dto/add-member.dto';
import type { AuthenticatedRequest } from '@common/interfaces/authenticated';
import {
  CreateClassroomDocs,
  DeleteClassroomDocs,
  FindClassroomSignsDocs,
  FindMembersDocs,
  FindMineDocs,
  FindOneClassroomDocs,
  JoinClassroomDocs,
  LeaveClassroomDocs,
  UpdateClassroomDocs,
} from '@common/swagger/classrooms';

@ApiTags('Classrooms')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('classrooms')
export class ClassroomController {
  constructor(
    private readonly classroomService: ClassroomService,
    private readonly favoriteService: FavoriteService,
  ) { }

  // POST /classrooms
  @CreateClassroomDocs()
  @Roles(Role.EDUCATOR, Role.MANAGER)
  @Post()
  async create(
    @Request() req: AuthenticatedRequest,
    @Body() dto: CreateClassroomDto,
  ) {
    const classroom = await this.classroomService.create(req.user.userId, dto);
    return { success: true, message: 'Turma criada com sucesso', object: classroom };
  }

  // GET /classrooms/mine
  @FindMineDocs()
  @Roles(Role.STUDENT, Role.EDUCATOR, Role.MANAGER)
  @Get('mine')
  async findMine(@Request() req: AuthenticatedRequest) {
    const classrooms = await this.classroomService.findMine(req.user.userId);
    return { success: true, message: 'Turmas obtidas com sucesso', object: classrooms };
  }

  // POST /classrooms/join
  @JoinClassroomDocs()
  @Roles(Role.STUDENT, Role.EDUCATOR, Role.MANAGER)
  @Post('join')
  async join(
    @Request() req: AuthenticatedRequest,
    @Body() dto: JoinClassroomDto,
  ) {
    const classroom = await this.classroomService.join(req.user.userId, req.user.roles, dto);
    return { success: true, message: 'Matriculado com sucesso', object: classroom };
  }

  // GET /classrooms/:id
  @FindOneClassroomDocs()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const classroom = await this.classroomService.findById(id);
    return { success: true, message: 'Turma obtida com sucesso', object: classroom };
  }

  // GET /classrooms/:id/signs
  @FindClassroomSignsDocs()
  @Roles(Role.STUDENT, Role.EDUCATOR, Role.MANAGER)
  @Get(':id/signs')
  async findSigns(@Param('id') id: string) {
    const signs = await this.classroomService.findSigns(id);
    return { success: true, message: 'Sinais obtidos com sucesso', object: signs };
  }

  // GET /classrooms/:id/signs/favorites
  @Roles(Role.STUDENT, Role.EDUCATOR, Role.MANAGER)
  @Get(':id/signs/favorites')
  async findFavoriteSigns(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    const favorites = await this.favoriteService.findByUserAndClassroom(req.user.userId, id);
    return { success: true, message: 'Favoritos da turma obtidos com sucesso', object: favorites };
  }

  // GET /classrooms/:id/members
  @FindMembersDocs()
  @Roles(Role.STUDENT, Role.EDUCATOR, Role.MANAGER)
  @Get(':id/members')
  async findMembers(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    const members = await this.classroomService.findMembers(id, req.user.userId);
    return { success: true, message: 'Membros obtidos com sucesso', object: members };
  }

  // POST /classrooms/:id/members — professor adiciona participante pelo email
  @Roles(Role.EDUCATOR, Role.MANAGER)
  @Post(':id/members')
  async addMember(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
    @Body() dto: AddMemberDto,
  ) {
    const member = await this.classroomService.addMember(id, req.user.userId, dto.email);
    return { success: true, message: 'Participante adicionado com sucesso', object: member };
  }

  // DELETE /classrooms/:id/members/:userId — professor remove participante
  @Roles(Role.EDUCATOR, Role.MANAGER)
  @Delete(':id/members/:userId')
  async removeMember(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    await this.classroomService.removeMember(id, req.user.userId, userId);
    return { success: true, message: 'Participante removido com sucesso' };
  }

  // PATCH /classrooms/:id
  @UpdateClassroomDocs()
  @Roles(Role.EDUCATOR, Role.MANAGER)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
    @Body() dto: UpdateClassroomDto,
  ) {
    const classroom = await this.classroomService.update(id, req.user.userId, dto);
    return { success: true, message: 'Turma atualizada com sucesso', object: classroom };
  }

  // DELETE /classrooms/:id
  @DeleteClassroomDocs()
  @Roles(Role.EDUCATOR, Role.MANAGER)
  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    await this.classroomService.delete(id, req.user.userId);
    return { success: true, message: 'Turma excluída com sucesso' };
  }

  // DELETE /classrooms/:id/leave
  @LeaveClassroomDocs()
  @Roles(Role.STUDENT)
  @Delete(':id/leave')
  async leave(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    await this.classroomService.leave(req.user.userId, id);
    return { success: true, message: 'Você saiu da turma' };
  }
}
