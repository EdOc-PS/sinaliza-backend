import { IsString, IsNotEmpty, IsUUID, IsOptional, IsUrl, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSignDto {
  @ApiProperty({ example: 'Aguentar', description: 'Palavra em português' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'uuid-da-categoria', description: 'Categoria do sinal' })
  @IsUUID()
  categoryId: string;

  @ApiProperty({ example: 'uuid-da-configuracao-de-mao' })
  @IsUUID()
  handConfigId: string;

  @ApiPropertyOptional({
    example: ['uuid-da-disciplina-1', 'uuid-da-disciplina-2'],
    description: 'Disciplinas às quais o sinal pertence. Array ou string separada por vírgula.',
    isArray: true,
    type: String,
  })
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

  @ApiPropertyOptional({ example: 'https://youtube.com/watch?v=xxx', description: 'URL alternativa (ex: YouTube)' })
  @IsOptional()
  @IsString()
  @IsUrl()
  anotherUrl?: string;

  @ApiPropertyOptional({ example: 'Está difícil aguentar esse trabalho.' })
  @IsOptional()
  @IsString()
  examplePt?: string;

  @ApiPropertyOptional({ example: 'TRABALHO AGUENTAR DIFÍCIL' })
  @IsOptional()
  @IsString()
  exampleLibras?: string;

  @ApiPropertyOptional({ example: 'Mão fechada com polegar erguido, balanço suave para cima e para baixo.' })
  @IsOptional()
  @IsString()
  movementDescription?: string;

  @ApiPropertyOptional({
    example: ['Família', 'Cotidiano'],
    description: 'Lista de tags. Pode vir como array ou string separada por vírgula',
    isArray: true,
    type: String,
  })
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

  // Arquivos (multipart) — apenas para documentação Swagger
  @ApiPropertyOptional({ type: 'string', format: 'binary', description: 'Vídeo do sinal (MP4 ou MOV)' })
  video?: any;

  @ApiPropertyOptional({ type: 'string', format: 'binary', description: 'Imagem ilustrativa (opcional)' })
  image?: any;
}
