import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateHandConfigDto {
  @ApiPropertyOptional({ example: 'Letra B' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({ type: 'string', format: 'binary', description: 'Nova imagem (opcional)' })
  image?: any;
}
