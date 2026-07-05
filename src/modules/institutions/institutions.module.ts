import { Module } from '@nestjs/common';
import { InstitutionsService } from './institutions.service';
import { PrismaService } from '@/database/prisma.service';

@Module({
  providers: [InstitutionsService, PrismaService],
  exports: [InstitutionsService],
})
export class InstitutionsModule {}
