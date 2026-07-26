import { Injectable, NotFoundException, BadRequestException, ForbiddenException, ConflictException } from '@nestjs/common';
import { SignRepository } from './repositories/sign.repository';
import { CreateSignDto } from './dto/create-sign.dto';
import { UpdateSignDto } from './dto/update-sign.dto';
import { R2Service } from '@modules/r2/r2.service';
import { PrismaService } from '@/database/prisma.service';
import { DisciplineService } from '@modules/disciplines/discipline.service';
import { assertValidImage, assertValidVideo } from '@common/security/file-validation';
import { GlobalStatus, Role } from '@common/enums/enum';

interface SignFiles {
  video?: Express.Multer.File;
  image?: Express.Multer.File;
}

@Injectable()
export class SignService {
  constructor(
    private readonly signRepository: SignRepository,
    private readonly r2Service: R2Service,
    private readonly prisma: PrismaService,
    private readonly disciplineService: DisciplineService,
  ) {}

  async create(dto: CreateSignDto, creatorId: string, files: SignFiles) {
    // Validações de negócio
    if (!files.video && !dto.anotherUrl) {
      throw new BadRequestException(
        'É necessário enviar um vídeo ou informar uma URL alternativa (anotherUrl).',
      );
    }

    const handConfigExists = await this.prisma.handConfig.findUnique({
      where: { id: dto.handConfigId },
    });
    if (!handConfigExists) {
      throw new BadRequestException('Configuração de mão não encontrada.');
    }

    const categoryExists = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    });
    if (!categoryExists) {
      throw new BadRequestException('Categoria não encontrada.');
    }

    await this.assertDisciplinesExist(dto.disciplineIds);

    const nameExists = await this.signRepository.existsByName(dto.name);
    if (nameExists) {
      throw new BadRequestException('Já existe um sinal com este nome.');
    }

    // Valida o conteúdo real dos arquivos antes de subir ao R2
    if (files.video) assertValidVideo(files.video);
    if (files.image) assertValidImage(files.image);

    // Uploads no R2
    let videoUrl: string | null = null;
    let imgUrl: string | null = null;

    if (files.video) {
      videoUrl = await this.r2Service.uploadVideo(files.video, 'signs/videos');
    }
    if (files.image) {
      imgUrl = await this.r2Service.uploadImage(files.image, 'signs/images');
    }

    return this.signRepository.create({
      name: dto.name,
      categoryId: dto.categoryId,
      handConfigId: dto.handConfigId,
      creatorId,
      disciplineIds: dto.disciplineIds ?? [],
      videoUrl,
      anotherUrl: dto.anotherUrl ?? null,
      imgUrl,
      examplePt: dto.examplePt ?? null,
      exampleLibras: dto.exampleLibras ?? null,
      movementDescription: dto.movementDescription ?? null,
      tags: dto.tags ?? [],
    });
  }

  // Garante que todas as disciplinas informadas existem
  private async assertDisciplinesExist(disciplineIds?: string[]) {
    if (!disciplineIds || disciplineIds.length === 0) return;
    const count = await this.prisma.discipline.count({
      where: { id: { in: disciplineIds } },
    });
    if (count !== disciplineIds.length) {
      throw new BadRequestException('Uma ou mais disciplinas não foram encontradas.');
    }
  }

  async findAll(filters: {
    search?: string;
    categoryId?: string;
    handConfigId?: string;
    glossaryDisciplineId?: string;
    tag?: string;
  }) {
    return this.signRepository.findAll(filters);
  }

  async findById(id: string) {
    const sign = await this.signRepository.findById(id);
    if (!sign) throw new NotFoundException('Sinal não encontrado.');
    return sign;
  }

  async update(id: string, dto: UpdateSignDto, files: SignFiles) {
    const sign = await this.signRepository.findById(id);
    if (!sign) throw new NotFoundException('Sinal não encontrado.');

    // Se mudou handConfigId, valida existência
    if (dto.handConfigId && dto.handConfigId !== sign.handConfigId) {
      const handConfigExists = await this.prisma.handConfig.findUnique({
        where: { id: dto.handConfigId },
      });
      if (!handConfigExists) {
        throw new BadRequestException('Configuração de mão não encontrada.');
      }
    }

    // Se mudou a categoria, valida existência
    if (dto.categoryId && dto.categoryId !== sign.categoryId) {
      const categoryExists = await this.prisma.category.findUnique({
        where: { id: dto.categoryId },
      });
      if (!categoryExists) {
        throw new BadRequestException('Categoria não encontrada.');
      }
    }

    await this.assertDisciplinesExist(dto.disciplineIds);

    // Valida o conteúdo real dos arquivos antes de substituir
    if (files.video) assertValidVideo(files.video);
    if (files.image) assertValidImage(files.image);

    let videoUrl = sign.videoUrl;
    let imgUrl = sign.imgUrl;

    // Substituir vídeo
    if (files.video) {
      if (sign.videoUrl) await this.r2Service.delete(sign.videoUrl);
      videoUrl = await this.r2Service.uploadVideo(files.video, 'signs/videos');
    }

    // Substituir imagem
    if (files.image) {
      if (sign.imgUrl) await this.r2Service.delete(sign.imgUrl);
      imgUrl = await this.r2Service.uploadImage(files.image, 'signs/images');
    }

    return this.signRepository.update(id, {
      name: dto.name,
      categoryId: dto.categoryId,
      handConfigId: dto.handConfigId,
      disciplineIds: dto.disciplineIds,
      videoUrl,
      anotherUrl: dto.anotherUrl,
      imgUrl,
      examplePt: dto.examplePt,
      exampleLibras: dto.exampleLibras,
      movementDescription: dto.movementDescription,
      tags: dto.tags,
    });
  }

  async findOptions(userId: string) {
    const [categories, disciplines] = await Promise.all([
      this.prisma.category.findMany({
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      }),
      this.disciplineService.findMine(userId),
    ]);

    return {
      categories: categories.map((c) => ({ value: c.id, label: c.name })),
      disciplines: disciplines.map((d: any) => ({ value: d.id, label: d.name })),
    };
  }

  async delete(id: string) {
    const sign = await this.signRepository.findById(id);
    if (!sign) throw new NotFoundException('Sinal não encontrado.');

    // Remove arquivos do R2
    if (sign.videoUrl) await this.r2Service.delete(sign.videoUrl);
    if (sign.imgUrl) await this.r2Service.delete(sign.imgUrl);

    return this.signRepository.delete(id);
  }

  // Educador promove o sinal — entra na fila de aprovação do gestor.
  // Pode associar o sinal a nenhuma, uma ou várias disciplinas do glossário.
  async promote(id: string, userId: string, userRoles: Role[], glossaryDisciplineIds?: string[]) {
    const sign = await this.signRepository.findById(id);
    if (!sign) throw new NotFoundException('Sinal não encontrado.');

    const isManager = userRoles.includes(Role.MANAGER);
    if (sign.creatorId !== userId && !isManager) {
      throw new ForbiddenException('Apenas o criador do sinal pode promovê-lo.');
    }

    if (sign.globalStatus === GlobalStatus.PUBLIC) {
      throw new ConflictException('Este sinal já é público.');
    }
    if (sign.globalStatus === GlobalStatus.PENDING) {
      throw new ConflictException('Este sinal já está aguardando aprovação.');
    }

    await this.assertGlossaryDisciplinesExist(glossaryDisciplineIds);

    return this.signRepository.promote(id, glossaryDisciplineIds);
  }

  // Garante que todas as disciplinas do glossário informadas existem
  private async assertGlossaryDisciplinesExist(ids?: string[]) {
    if (!ids || ids.length === 0) return;
    const count = await this.prisma.glossaryDiscipline.count({ where: { id: { in: ids } } });
    if (count !== ids.length) {
      throw new BadRequestException('Uma ou mais disciplinas do glossário não foram encontradas.');
    }
  }

  // Gestor aprova ou recusa a promoção de um sinal pendente
  async reviewPromotion(id: string, approve: boolean) {
    const sign = await this.signRepository.findById(id);
    if (!sign) throw new NotFoundException('Sinal não encontrado.');

    if (sign.globalStatus !== GlobalStatus.PENDING) {
      throw new ConflictException('Este sinal não está aguardando aprovação.');
    }

    return this.signRepository.updateGlobalStatus(
      id,
      approve ? GlobalStatus.PUBLIC : GlobalStatus.REJECTED,
    );
  }

  // Promoções pendentes (área de trabalho do gestor)
  async findPendingPromotions() {
    return this.signRepository.findPendingPromotions();
  }

  // Filtros do glossário público — categorias, configurações de mão e disciplinas.
  // Endpoint aberto: o glossário público não tem token para chamar /category e /hand-config.
  async findGlobalFilters() {
    const [categories, handConfigs, glossaryDisciplines] = await Promise.all([
      this.prisma.category.findMany({
        select: { id: true, name: true, value: true },
        orderBy: { name: 'asc' },
      }),
      this.prisma.handConfig.findMany({
        select: { id: true, name: true, imgUrl: true },
        orderBy: { name: 'asc' },
      }),
      this.prisma.glossaryDiscipline.findMany({
        select: { id: true, name: true, description: true, _count: { select: { signs: true } } },
        orderBy: { name: 'asc' },
      }),
    ]);

    return { categories, handConfigs, glossaryDisciplines };
  }

  // Glossário global — sinais públicos, endpoint aberto
  async findGlobal(filters: {
    search?: string;
    categoryId?: string;
    handConfigId?: string;
    glossaryDisciplineId?: string;
    tag?: string;
  }) {
    return this.signRepository.findGlobal(filters);
  }
}
