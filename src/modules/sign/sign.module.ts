import { Module } from '@nestjs/common';
import { SignController } from './sign.controller';
import { GlossaryController } from './glossary.controller';
import { SignService } from './sign.service';
import { SignRepository } from './repositories/sign.repository';
import { PrismaModule } from '@/database/prisma.module';
import { R2Module } from '@modules/r2/r2.module';
import { ClassroomModule } from '@modules/classrooms/classroom.module';
import { EmailModule } from '@modules/email/email.module';

@Module({
  imports: [PrismaModule, R2Module, ClassroomModule, EmailModule],
  controllers: [SignController, GlossaryController],
  providers: [SignService, SignRepository],
  exports: [SignService],
})
export class SignModule {}
