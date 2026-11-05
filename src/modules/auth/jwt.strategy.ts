import { JwtUser } from "@/common/interfaces/authenticated";
import { PrismaService } from "@/database/prisma.service";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET!,
    });
  }

  async validate(payload: JwtUser & { iat: number }) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.userId },
      select: { mustChangePassword: true, passwordChangedAt: true },
    });
    if (!user) throw new UnauthorizedException();

    // Trocar a senha derruba as sessões emitidas antes da troca (iat é em segundos)
    if (user.passwordChangedAt && payload.iat < Math.floor(user.passwordChangedAt.getTime() / 1000)) {
      throw new UnauthorizedException();
    }

    return {
      userId: payload.userId,
      email: payload.email,
      roles: payload.roles,
      mustChangePassword: user.mustChangePassword,
    };
  }
}
