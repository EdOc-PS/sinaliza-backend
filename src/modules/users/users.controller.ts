import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateRolesDto } from './dto/update-roles.dto';
import { CreateEducatorDto } from './dto/create-educator.dto';
import { UpdateApprovalDto } from './dto/update-approval.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { Role } from '@common/enums/enum';
import type { AuthenticatedRequest } from '@common/interfaces/authenticated';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateEducatorDocs, DeleteDocs, FindByIdDocs, FindDocs, FindEducatorsDocs, FindMembersDocs, UpdateApprovalDocs, UpdateDocs, UpdateRolesDocs } from '@swagger/users';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
@ApiTags('Users')
@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) { }

    // GET /users
    @FindDocs()
    @UseGuards(RolesGuard)
    @Roles(Role.MANAGER)
    @Get()
    async findAll() {
        const users = await this.usersService.findAll();

        return {
            success: true,
            message: 'Usuários encontrados com sucesso!',
            object: users
        }
    }

    // POST /users/educator
    @CreateEducatorDocs()
    @UseGuards(RolesGuard)
    @Roles(Role.MANAGER)
    @Post("educator")
    async createEducator(@Body() dto: CreateEducatorDto) {
        const user = await this.usersService.createEducator(dto);
        return {
            success: true,
            message: 'Educador cadastrado com sucesso!',
            object: user
        };
    }

    // GET /users/educators?search=
    @FindEducatorsDocs()
    @UseGuards(RolesGuard)
    @Roles(Role.MANAGER)
    @Get("educators")
    async findEducators(@Query("search") search?: string) {
        const educators = await this.usersService.findEducators(search);
        return {
            success: true,
            message: 'Educadores encontrados com sucesso!',
            object: educators
        };
    }

    // GET /users/members?role=STUDENT|EDUCATOR&search=
    @FindMembersDocs()
    @UseGuards(RolesGuard)
    @Roles(Role.MANAGER)
    @Get("members")
    async findMembers(
        @Query("role") role: Role,
        @Query("search") search?: string,
    ) {
        const users = await this.usersService.findMembersByRole(role, search);
        return {
            success: true,
            message: 'Usuários encontrados com sucesso!',
            object: users
        };
    }

    // PATCH /users/me/onboarding — marca o tour inicial como visto
    @Patch("me/onboarding")
    async markOnboardingSeen(@Request() req: AuthenticatedRequest) {
        const user = await this.usersService.markOnboardingSeen(req.user.userId);
        return {
            success: true,
            message: 'Onboarding concluído',
            object: user,
        };
    }

    // PATCH /users/:id/approval
    @UpdateApprovalDocs()
    @UseGuards(RolesGuard)
    @Roles(Role.MANAGER)
    @Patch(":id/approval")
    async updateApproval(@Param("id") id: string, @Body() dto: UpdateApprovalDto) {
        const user = await this.usersService.updateApproval(id, dto.status);
        return {
            success: true,
            message: 'Status de aprovação atualizado com sucesso!',
            object: user
        };
    }

    // GET /users/:id
    @FindByIdDocs()
    @UseGuards(RolesGuard)
    @Roles(Role.MANAGER)
    @Get(":id")
    async findUser(@Param("id") id: string) {

        const user = await this.usersService.findUser(id);

        return {
            success: true,
            message: 'Usuário encontrado com sucesso!',
            object: user
        }
    }


    // PATCH /users/:id/roles
    @UpdateRolesDocs()
    @UseGuards(RolesGuard)
    @Roles(Role.MANAGER)
    @Patch(":id/roles")
    async updateRoles(@Param("id") id: string, @Body() dto: UpdateRolesDto) {
        const user = await this.usersService.updateRoles(id, dto.roles);
        return {
            success: true,
            message: 'Perfis do usuário atualizados com sucesso!',
            object: user
        };
    }

    // DELETE /users/:id
    @DeleteDocs()
    @UseGuards(RolesGuard)
    @Roles(Role.MANAGER)
    @Delete(":id")
    async deleteUser(@Param("id") id: string) {
        await this.usersService.delete(id);
        return {
            success: true,
            message: 'Usuário excluído com sucesso!'
        };
    }

    // PATCH /users/:id — a própria pessoa editando o perfil, ou o gestor editando um educador
    @UpdateDocs()
    @Patch(":id")
    async updateUser(
        @Param("id") id: string,
        @Body() updatedUser: UpdateUserDto,
        @Request() req: AuthenticatedRequest,
    ) {
        this.usersService.assertSelfOrManager(req.user.userId, req.user.roles, id);
        const user = await this.usersService.update(id, updatedUser);
        return {
            success: true,
            message: 'Usuário atualizado com sucesso!',
            object: user
        };
    }

    // PATCH /users/:id/status — ativar/desativar conta (apenas gestor)
    @UseGuards(RolesGuard)
    @Roles(Role.MANAGER)
    @Patch(":id/status")
    async updateStatus(@Param("id") id: string, @Body() dto: UpdateStatusDto) {
        const user = await this.usersService.updateStatus(id, dto.status);
        return {
            success: true,
            message: dto.status ? 'Conta reativada com sucesso!' : 'Conta desativada com sucesso!',
            object: user,
        };
    }

}
