import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersRepository } from './repositories/users.repository';
import { PrismaService } from '@/database/prisma.service';
import { JwtStrategy } from '../auth/jwt.strategy';
import { InstitutionsModule } from '../institutions/institutions.module';
import { DisciplineModule } from '../disciplines/discipline.module';

@Module({
  imports: [InstitutionsModule, DisciplineModule],
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
