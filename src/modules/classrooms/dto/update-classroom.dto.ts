import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateClassroomDto } from './create-classroom.dto';
import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateClassroomDto extends PartialType(
  OmitType(CreateClassroomDto, [] as const),
) {
  @ApiPropertyOptional({ example: true, description: 'Ativar ou arquivar turma' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
