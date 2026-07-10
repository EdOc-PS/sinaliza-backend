import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { HandConfigRepository } from './repositories/hand-config.repository';
import { CreateHandConfigDto } from './dto/create-hand-config.dto';
import { UpdateHandConfigDto } from './dto/update-hand-config.dto';
import { R2Service } from '@modules/r2/r2.service';
import { assertValidImage } from '@common/security/file-validation';

@Injectable()
export class HandConfigService {
  constructor(
    private readonly handConfigRepository: HandConfigRepository,
    private readonly r2Service: R2Service,
  ) {}

  async create(dto: CreateHandConfigDto, file: Express.Multer.File) {
    assertValidImage(file);

    const nameExists = await this.handConfigRepository.existsByName(dto.name);
    if (nameExists) {
      throw new BadRequestException('Já existe uma configuração de mão com este nome');
    }

    const imgUrl = await this.r2Service.uploadImage(file, 'hand-configs');
    return this.handConfigRepository.create({ name: dto.name, imgUrl });
  }

  async findAll(search?: string) {
    return this.handConfigRepository.findAll(search);
  }

  async findByName(name: string) {
    const handConfig = await this.handConfigRepository.findByName(name);
    if (!handConfig) throw new NotFoundException('Configuração de mão não encontrada');
    return handConfig;
  }

  async update(id: string, dto: UpdateHandConfigDto, file?: Express.Multer.File) {
    const handConfig = await this.handConfigRepository.findById(id);
    if (!handConfig) throw new NotFoundException('Configuração de mão não encontrada');

    let imgUrl = handConfig.imgUrl;

    if (file) {
      assertValidImage(file);
      // Deleta a imagem antiga do R2 e faz upload da nova
      if (handConfig.imgUrl) await this.r2Service.delete(handConfig.imgUrl);
      imgUrl = await this.r2Service.uploadImage(file, 'hand-configs');
    }

    return this.handConfigRepository.update(id, { name: dto.name, imgUrl });
  }

  async delete(id: string) {
    const handConfig = await this.handConfigRepository.findById(id);
    if (!handConfig) throw new NotFoundException('Configuração de mão não encontrada');

    // Deleta a imagem do R2 junto com o registro
    if (handConfig.imgUrl) await this.r2Service.delete(handConfig.imgUrl);

    return this.handConfigRepository.delete(id);
  }
}
