import { Module } from '@nestjs/common';
import { EssayController } from './essay.controller';
import { EssayService } from './essay.service';
import { EssayRepository } from './repositories/essay.repository';
import { PrismaModule } from '@/database/prisma.module';
import { R2Module } from '@modules/r2/r2.module';

@Module({
  imports: [PrismaModule, R2Module],
  controllers: [EssayController],
  providers: [EssayService, EssayRepository],
  exports: [EssayService],
})
export class EssayModule {}
