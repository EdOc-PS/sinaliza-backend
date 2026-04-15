import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// Deixa o PrismaService disponível globalmente para toda a aplicação, evitando a necessidade de importá-lo em cada módulo que precise acessar o banco de dados.
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}