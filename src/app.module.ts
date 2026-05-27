import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@modules/auth/auth.module';
import { DisciplineModule } from '@modules/disciplines/discipline.module';
import { HandConfigModule } from '@modules/hand-config/hand-config.module';
import { R2Module } from '@modules/r2/r2.module';
import { SignModule } from '@modules/sign/sign.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    DisciplineModule,
    HandConfigModule,
    R2Module,
    SignModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
