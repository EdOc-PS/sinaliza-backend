import { Module } from '@nestjs/common';
import { GlossaryDisciplineController } from './glossary-discipline.controller';
import { GlossaryDisciplineService } from './glossary-discipline.service';
import { GlossaryDisciplineRepository } from './repositories/glossary-discipline.repository';
import { PrismaModule } from '@/database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [GlossaryDisciplineController],
  providers: [GlossaryDisciplineService, GlossaryDisciplineRepository],
  exports: [GlossaryDisciplineService],
})
export class GlossaryDisciplineModule {}
