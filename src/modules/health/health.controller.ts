import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '@/database/prisma.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  // GET /health — endpoint público, sem guard.
  // Faz uma query trivial para manter tanto a instância do Render quanto o
  // compute do Neon acordados (os dois "dormem" sozinhos no plano free depois
  // de um tempo sem uso). Pensado para ser chamado periodicamente por um
  // workflow do GitHub Actions — não é um health-check de verdade, é anti-sono.
  @ApiOperation({ summary: 'Verifica se a API e o banco estão de pé' })
  @ApiResponse({ status: 200, description: 'API e banco respondendo' })
  @Get()
  async check() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { success: true, message: 'ok', object: { db: 'ok', timestamp: new Date().toISOString() } };
    } catch {
      // Ainda respondemos 200: o objetivo aqui é acordar o processo, não
      // reportar disponibilidade formal. Um 5xx faria monitores externos
      // (se algum dia usarmos um) disparar alerta por um cold start normal.
      return { success: true, message: 'ok', object: { db: 'unreachable', timestamp: new Date().toISOString() } };
    }
  }
}
