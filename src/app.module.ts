import { Module } from '@nestjs/common';
import { AuthModule } from '@modules/auth/auth.module';
import { DisciplineModule } from '@modules/disciplines/discipline.module';
import { HandConfigModule } from '@modules/hand-config/hand-config.module';

@Module({
  imports: [AuthModule, DisciplineModule, HandConfigModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
