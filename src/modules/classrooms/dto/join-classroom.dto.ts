import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class JoinClassroomDto {
  @ApiProperty({ example: 'ABC1D2', description: 'Código de acesso da turma' })
  @IsString()
  @IsNotEmpty()
  classCode: string;
}
