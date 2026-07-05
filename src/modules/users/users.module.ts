import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersRepository } from './repositories/users.repository';
import { PrismaService } from '@/database/prisma.service';
import { JwtStrategy } from '../auth/jwt.strategy';
import { InstitutionsModule } from '../institutions/institutions.module';

@Module({
  imports: [InstitutionsModule],
  providers: [
    UsersService,
    UsersRepository,
    PrismaService,
    JwtStrategy
  ],
  controllers: [UsersController],
  exports: [UsersService]
})
export class UsersModule { }
