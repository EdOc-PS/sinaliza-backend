import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateGlossaryDisciplineDto {
  @ApiProperty({ example: 'Matemática', description: 'Nome da disciplina do glossário.' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(60)
  name!: string;

  @ApiProperty({ required: false, example: 'Sinais relacionados a números e operações.' })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  description?: string;
}
