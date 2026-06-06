import { Module } from '@nestjs/common';
import { FavoriteController } from './favorite.controller';
import { FavoriteService } from './favorite.service';
import { FavoriteRepository } from './repositories/favorite.repository';
import { PrismaModule } from '@/database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FavoriteController],
  providers: [FavoriteService, FavoriteRepository],
  exports: [FavoriteService],
})
export class FavoriteModule {}
