import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ClassRole } from '@common/enums/enum';

export class JoinDisciplineDto {
  @ApiProperty({ example: 'ABC1D2', description: 'Código de acesso da disciplina' })
  @IsString()
  @IsNotEmpty()
  classCode: string;

  @ApiProperty({ enum: ClassRole, example: ClassRole.STUDENT })
  @IsEnum(ClassRole)
  roleInClass: ClassRole;
}
