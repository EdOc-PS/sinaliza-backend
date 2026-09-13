import { IsString, IsNotEmpty, IsOptional, IsHexColor } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateClassroomDto {
  @ApiProperty({ example: 'Matemática Aplicada' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Turma de matemática do período da manhã' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: '#BACA57', description: 'Cor de fundo em hexadecimal' })
  @IsOptional()
  @IsHexColor()
  colorBackground?: string;
}
