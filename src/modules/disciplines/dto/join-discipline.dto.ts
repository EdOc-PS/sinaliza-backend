import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class JoinDisciplineDto {
  @ApiProperty({ example: 'ABC1D2', description: 'Código de acesso da disciplina' })
  @IsString()
  @IsNotEmpty()
  classCode: string;
}
