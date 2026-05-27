import { Module } from '@nestjs/common';
import { SignController } from './sign.controller';
import { SignService } from './sign.service';
import { SignRepository } from './repositories/sign.repository';
import { PrismaModule } from '@/database/prisma.module';
import { R2Module } from '@modules/r2/r2.module';

@Module({
  imports: [PrismaModule, R2Module],
  controllers: [SignController],
  providers: [SignService, SignRepository],
  exports: [SignService],
})
export class SignModule {}
