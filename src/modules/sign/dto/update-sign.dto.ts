import { IsString, IsNotEmpty, IsEnum, IsUUID, IsOptional, IsUrl, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { GrammaticalClass } from '@prisma/client';

export class UpdateSignDto {
  @ApiPropertyOptional({ example: 'Aguentar' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({ enum: GrammaticalClass })
  @IsOptional()
  @IsEnum(GrammaticalClass)
  grammaticalClass?: GrammaticalClass;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  handConfigId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  disciplineId?: string;

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
