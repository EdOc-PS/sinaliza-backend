import { Module } from '@nestjs/common';
import { DisciplineController } from './discipline.controller';
import { DisciplineService } from './discipline.service';
import { DisciplineRepository } from './repositories/discipline.repository';
import { PrismaModule } from '@/database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DisciplineController],
  providers: [DisciplineService, DisciplineRepository],
  exports: [DisciplineService],
})
export class DisciplineModule {}
