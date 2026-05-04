import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsEnum,
  IsHexColor,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SchoolLevel } from '@common/enums/enum';

export class CreateDisciplineDto {
  @ApiProperty({ example: 'Matemática Aplicada' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Turma de matemática para 1º ano' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: '#BACA57', description: 'Cor de fundo em hexadecimal' })
  @IsOptional()
  @IsHexColor()
  colorBackground?: string;

  @ApiPropertyOptional({ example: 2026 })
  @IsOptional()
  @IsInt()
  @Min(2000)
  @Max(2100)
  schoolYear?: number;

  @ApiPropertyOptional({ enum: SchoolLevel })
  @IsOptional()
  @IsEnum(SchoolLevel)
  schoolLevel?: SchoolLevel;
}
