import { Body, Controller, Delete, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateRolesDto } from './dto/update-roles.dto';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { Role } from '@common/enums/enum';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DeleteDocs, FindByIdDocs, FindDocs, UpdateDocs, UpdateRolesDocs } from '@swagger/users';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
@ApiTags('Users')
@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) { }

    // GET /users
    @FindDocs()
    @Get()
    async findAll() {
        const users = await this.usersService.findAll();

        return {
            success: true,
            message: 'Usuários encontrados com sucesso!',
            object: users
        }
    }

    // GET /users/:id
    @FindByIdDocs()
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
    @Roles(Role.ADMIN)
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
    @Delete(":id")
    async deleteUser(@Param("id") id: string) {
        await this.usersService.delete(id);
        return {
            success: true,
            message: 'Usuário excluído com sucesso!'
        };
    }

    // PATCH /users/:id
    @UpdateDocs()
    @Patch(":id")
    async updateUser(@Param("id") id: string, @Body() updatedUser: UpdateUserDto) {
        const user = await this.usersService.update(id, updatedUser);
        return {
            success: true,
            message: 'Usuário atualizado com sucesso!',
            object: user
        };
    }

}
