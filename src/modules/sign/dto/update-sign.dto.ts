import { IsString, IsNotEmpty, IsUUID, IsOptional, IsUrl, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSignDto {
  @ApiPropertyOptional({ example: 'Aguentar' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({ description: 'UUID da categoria' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  handConfigId?: string;

  @ApiPropertyOptional({ isArray: true, type: String, description: 'Disciplinas do sinal (substitui o conjunto atual)' })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value.filter(Boolean);
    if (typeof value === 'string') {
      return value.split(',').map((v: string) => v.trim()).filter(Boolean);
    }
    return [];
  })
  disciplineIds?: string[];

  @ApiPropertyOptional({ example: 'https://youtube.com/watch?v=xxx' })
  @IsOptional()
  @IsString()
  @IsUrl()
  anotherUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  examplePt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  exampleLibras?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  movementDescription?: string;

  @ApiPropertyOptional({ isArray: true, type: String })
  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      return value.split(',').map((tag: string) => tag.trim()).filter(Boolean);
    }
    return [];
  })
  tags?: string[];

  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  video?: any;

  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  image?: any;
}
