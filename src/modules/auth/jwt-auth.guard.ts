import { ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { ALLOW_PASSWORD_PENDING_KEY } from '@common/decorators/allow-password-pending.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  // Trata a resposta do Passport
  handleRequest<TUser = any>(err: any, user: any, _info: any, context: ExecutionContext): TUser {
    if (err || !user) {
      throw new UnauthorizedException('Token inválido ou expirado');
    }

    // Senha temporária: o resto da API só libera depois da troca
    const allowed = this.reflector.getAllAndOverride<boolean>(ALLOW_PASSWORD_PENDING_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (user.mustChangePassword && !allowed) {
      throw new ForbiddenException('Defina uma nova senha para continuar.');
    }

    return user;
  }
}
