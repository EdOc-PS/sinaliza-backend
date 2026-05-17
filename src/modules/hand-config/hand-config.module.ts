import { Module } from '@nestjs/common';
import { HandConfigController } from './hand-config.controller';
import { HandConfigService } from './hand-config.service';
import { HandConfigRepository } from './repositories/hand-config.repository';
import { PrismaModule } from '@/database/prisma.module';
import { R2Module } from '@modules/r2/r2.module';

@Module({
  imports: [PrismaModule, R2Module],
  controllers: [HandConfigController],
  providers: [HandConfigService, HandConfigRepository],
  exports: [HandConfigService],
})
export class HandConfigModule {}
