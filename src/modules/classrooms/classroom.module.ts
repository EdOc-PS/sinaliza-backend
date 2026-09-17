import { Module } from '@nestjs/common';
import { ClassroomController } from './classroom.controller';
import { ClassroomService } from './classroom.service';
import { ClassroomRepository } from './repositories/classroom.repository';
import { PrismaModule } from '@/database/prisma.module';
import { FavoriteModule } from '@modules/favorite/favorite.module';
import { HistoryModule } from '@modules/history/history.module';

@Module({
  imports: [PrismaModule, FavoriteModule, HistoryModule],
  controllers: [ClassroomController],
  providers: [ClassroomService, ClassroomRepository],
  exports: [ClassroomService],
})
export class ClassroomModule {}
