import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from '@/database/prisma.service';

import { UsersModule } from '../users/users.module';
import { AuthRepository } from './repositories/auth.repository';

@Module({
  imports: [JwtModule.register({
    secret: 'my-secret-key',
    signOptions: { expiresIn: '2h' },
  }), UsersModule ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, AuthRepository]
})
export class AuthModule { }
