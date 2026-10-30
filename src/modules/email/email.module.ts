import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@/database/prisma.module';
import { EmailService } from './email.service';
import { NotificationService } from './notification.service';

@Module({
  imports: [ConfigModule, PrismaModule],
  providers: [EmailService, NotificationService],
  exports: [EmailService, NotificationService],
})
export class EmailModule {}
