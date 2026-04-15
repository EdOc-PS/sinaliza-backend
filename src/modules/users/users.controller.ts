import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Req, UseGuards } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DeleteDocs, FindByIdDocs, FindDocs, UpdateDocs } from '@swagger/users';

//UseGuards(JwtAuthGuard) é usado para proteger as rotas, garantindo que apenas usuários autenticados possam acessá-las. 
//ApiBearerAuth é usado para indicar que as rotas deste controlador requerem autenticação via token Bearer (JWT).
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
@ApiTags('Users')

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) { }


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

    @FindByIdDocs()
    @Get(":id")
    async findUser(@Param("id", ParseIntPipe) id: number) {

        const user = await this.usersService.findUser(id);

        return {
            success: true,
            message: 'Usuário encontrado com sucesso!',
            object: user
        }
    }


    @DeleteDocs()
    @Delete(":id")
    async deleteUser(@Param("id", ParseIntPipe) id: number) {
        await this.usersService.delete(id);
        return {
            success: true,
            message: 'Usuário excluído com sucesso!'
        };
    }

    @UpdateDocs()
    @Patch(":id")
    async updateUser(@Param("id", ParseIntPipe) id: number, @Body() updatedUser: UpdateUserDto) {
        const user = await this.usersService.update(id, updatedUser);
        return {
            success: true,
            message: 'Usuário atualizado com sucesso!',
            object: user
        };
    }

}
