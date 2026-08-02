import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AuthModule } from '@modules/auth/auth.module';
import { CategoryModule } from '@modules/category/category.module';
import { DisciplineModule } from '@modules/disciplines/discipline.module';
import { EssayModule } from '@modules/essay/essay.module';
import { FavoriteModule } from '@modules/favorite/favorite.module';
import { GlossaryDisciplineModule } from '@modules/glossary-discipline/glossary-discipline.module';
import { HandConfigModule } from '@modules/hand-config/hand-config.module';
import { HistoryModule } from '@modules/history/history.module';
import { R2Module } from '@modules/r2/r2.module';
import { SearchModule } from '@modules/search/search.module';
import { SignModule } from '@modules/sign/sign.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Rate limiting global: no máx. 100 requisições / minuto por IP.
    // Rotas sensíveis (login/register) têm limite mais rígido via @Throttle no controller.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    AuthModule,
    CategoryModule,
    DisciplineModule,
    EssayModule,
    FavoriteModule,
    GlossaryDisciplineModule,
    HandConfigModule,
    HistoryModule,
    R2Module,
    SearchModule,
    SignModule,
  ],
  controllers: [],
  providers: [
    // Aplica o rate limit em todas as rotas
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
