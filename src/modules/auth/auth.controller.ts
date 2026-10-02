import { Body, Controller, Get, HttpCode, Post, UseGuards, Request } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { PasswordResetService } from './password-reset.service';
import { ApiResponse } from '@common/dto/response.dto';
import { ApiTags } from '@nestjs/swagger';
import { GetMeDocs, LoginDocs, RegisterDocs } from '@/common/swagger/auth';
import { JwtAuthGuard } from './jwt-auth.guard';
import type { AuthenticatedRequest } from '@common/interfaces/authenticated';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private passwordResetService: PasswordResetService,
    ) { }

    // POST /auth/login — limite por IP (10/min) + bloqueio da conta após 6 senhas
    // erradas seguidas (30 min), aplicado no AuthService
    @Throttle({ default: { ttl: 60_000, limit: 10 } })
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

    // POST /auth/register — limita criação de contas em massa: máx. 10 / minuto por IP
    @Throttle({ default: { ttl: 60_000, limit: 10 } })
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

    // GET /auth/me
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

    // POST /auth/forgot-password — envia o link de recuperação. Resposta sempre igual,
    // exista ou não a conta (não revela quais emails estão cadastrados)
    @Throttle({ default: { ttl: 60_000, limit: 3 } })
    @HttpCode(200)
    @Post('forgot-password')
    async forgotPassword(@Body() dto: ForgotPasswordDto) {
        await this.passwordResetService.requestReset(dto.email);
        return {
            success: true,
            message: 'Se o email estiver cadastrado, você receberá um link para redefinir a senha.',
        };
    }

    // POST /auth/reset-password — troca a senha usando o token do email
    @Throttle({ default: { ttl: 60_000, limit: 5 } })
    @HttpCode(200)
    @Post('reset-password')
    async resetPassword(@Body() dto: ResetPasswordDto) {
        await this.passwordResetService.resetPassword(dto.token, dto.password);
        return { success: true, message: 'Senha redefinida com sucesso!' };
    }
}
