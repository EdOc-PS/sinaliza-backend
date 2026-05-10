import { Module } from '@nestjs/common';
import { HandConfigController } from './hand-config.controller';
import { HandConfigService } from './hand-config.service';
import { HandConfigRepository } from './repositories/hand-config.repository';
import { PrismaModule } from '@/database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [HandConfigController],
  providers: [HandConfigService, HandConfigRepository],
  exports: [HandConfigService],
})
export class HandConfigModule {}
