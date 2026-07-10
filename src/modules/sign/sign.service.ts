import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SignRepository } from './repositories/sign.repository';
import { CreateSignDto } from './dto/create-sign.dto';
import { UpdateSignDto } from './dto/update-sign.dto';
import { R2Service } from '@modules/r2/r2.service';
import { PrismaService } from '@/database/prisma.service';
import { DisciplineService } from '@modules/disciplines/discipline.service';
import { assertValidImage, assertValidVideo } from '@common/security/file-validation';

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

    if (dto.disciplineId) {
      const disciplineExists = await this.prisma.discipline.findUnique({
        where: { id: dto.disciplineId },
      });
      if (!disciplineExists) {
        throw new BadRequestException('Disciplina não encontrada.');
      }
    }

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
      grammaticalClass: dto.grammaticalClass,
      handConfigId: dto.handConfigId,
      creatorId,
      disciplineId: dto.disciplineId ?? null,
      videoUrl,
      anotherUrl: dto.anotherUrl ?? null,
      imgUrl,
      examplePt: dto.examplePt ?? null,
      exampleLibras: dto.exampleLibras ?? null,
      movementDescription: dto.movementDescription ?? null,
      tags: dto.tags ?? [],
    });
  }

  async findAll(filters: {
    search?: string;
    grammaticalClass?: any;
    handConfigId?: string;
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
      grammaticalClass: dto.grammaticalClass,
      handConfigId: dto.handConfigId,
      disciplineId: dto.disciplineId !== undefined ? (dto.disciplineId || null) : undefined,
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
    const [grammaticalClasses, disciplines] = await Promise.all([
      this.prisma.param.findMany({
        where: { type: 'GRAMMATICAL_CLASS', isActive: true },
        select: { label: true, value: true },
        orderBy: { order: 'asc' },
      }),
      this.disciplineService.findMine(userId),
    ]);

    return {
      grammaticalClasses,
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
}
