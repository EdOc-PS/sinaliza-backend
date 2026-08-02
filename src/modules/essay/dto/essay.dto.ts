import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateEssayPromptDto {
  @ApiProperty({ example: 'Os desafios da inclusão de surdos na escola' })
  @IsString()
  @IsNotEmpty({ message: 'O título é obrigatório.' })
  @MinLength(3, { message: 'O título precisa ter pelo menos 3 caracteres.' })
  @MaxLength(150)
  title!: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

}

export class UpdateEssayPromptDto extends CreateEssayPromptDto {}

export class CreateEssayExampleDto {
  @ApiProperty({ example: 'Redação nota 1000 — ENEM 2024' })
  @IsString()
  @IsNotEmpty({ message: 'O título é obrigatório.' })
  @MinLength(3, { message: 'O título precisa ter pelo menos 3 caracteres.' })
  @MaxLength(150)
  title!: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;
}
