import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class InstitutionsService {
  constructor(private readonly prisma: PrismaService) {}

  // Sem seleção de instituição no cadastro ainda: associa à única instituição existente.
  // Preparado para expansão futura (múltiplas instituições) sem quebrar os fluxos atuais.
  async getDefaultInstitutionId(): Promise<string | null> {
    const institution = await this.prisma.institution.findFirst({
      orderBy: { createdAt: 'asc' },
      select: { id: true },
    });
    return institution?.id ?? null;
  }
}
