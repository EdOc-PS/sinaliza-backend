import { Module } from '@nestjs/common';
import { AuthModule } from '@modules/auth/auth.module';
import { DisciplineModule } from '@modules/disciplines/discipline.module';

@Module({
  imports: [AuthModule, DisciplineModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
