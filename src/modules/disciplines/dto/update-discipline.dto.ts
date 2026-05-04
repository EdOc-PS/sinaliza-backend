import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateDisciplineDto } from './create-discipline.dto';
import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateDisciplineDto extends PartialType(
  OmitType(CreateDisciplineDto, [] as const),
) {
  @ApiPropertyOptional({ example: true, description: 'Ativar ou arquivar disciplina' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
