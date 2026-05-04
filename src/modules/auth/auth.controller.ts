import { Body, Controller, Get, Post, UseGuards, Request } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { ApiResponse } from '@common/dto/response.dto';
import { ApiTags } from '@nestjs/swagger';
import { GetMeDocs, LoginDocs, RegisterDocs } from '@/common/swagger/auth';
import { JwtAuthGuard } from './jwt-auth.guard';
import type { AuthenticatedRequest } from '@common/interfaces/authenticated';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }



    // Decoradores personalizados para documentação Swagger
    @LoginDocs()
    @Post('login')
    async login(@Body() loginRequest: LoginDto) {
        const response = await this.authService.login(loginRequest);

        return {
            success: true,
            message: 'Login realizado com sucesso',
            object: response
        }
    }

    // Decoradores personalizados para documentação Swagger
    @RegisterDocs()
    @Post('register')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async createUser(@Body() dto: RegisterDto): Promise<ApiResponse<any>> {
        const user = await this.authService.register(dto);

        return {
            success: true,
            message: 'Usuário criado com sucesso',
            object: user,
        };
    }

    @GetMeDocs()
    @UseGuards(JwtAuthGuard)
    @Get('me')
    async getMe(@Request() req: AuthenticatedRequest) {
        const user = await this.authService.getMe(req.user.userId);

        return {
            success: true,
            message: 'Usuário obtido com sucesso',
            object: user,
        };
    }
}
