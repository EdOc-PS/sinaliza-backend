import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { PrismaService } from '@/database/prisma.service';

import { UsersModule } from '../users/users.module';
import { InstitutionsModule } from '../institutions/institutions.module';
import { AuthRepository } from './repositories/auth.repository';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PassportModule,
    // Assina e verifica com o MESMO secret vindo do .env (JWT_SECRET).
    // Falha o boot se o secret não estiver definido — nunca cai num valor default.
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.get<string>('JWT_SECRET');
        if (!secret) {
          throw new Error('JWT_SECRET não definido no ambiente (.env).');
        }
        const expiresIn = config.get<string>('JWT_EXPIRE') ?? '2h';
        return {
          secret,
          signOptions: { expiresIn: expiresIn as unknown as number },
        };
      },
    }),
    UsersModule,
    InstitutionsModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, AuthRepository, JwtStrategy],
})
export class AuthModule { }
