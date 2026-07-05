import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaService } from '@/database/prisma.service';

import { UsersModule } from '../users/users.module';
import { InstitutionsModule } from '../institutions/institutions.module';
import { AuthRepository } from './repositories/auth.repository';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: 'my-secret-key',
      signOptions: { expiresIn: '2h' },
    }),
    UsersModule,
    InstitutionsModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, AuthRepository, JwtStrategy],
})
export class AuthModule { }
