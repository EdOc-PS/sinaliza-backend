import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsEnum } from 'class-validator';
import { Role } from '@common/enums/enum';

export class UpdateRolesDto {
  @ApiProperty({
    enum: Role,
    isArray: true,
    example: ['ADMIN', 'EDUCATOR'],
    description:
      'Lista de perfis do usuário. STUDENT não pode ser combinado com EDUCATOR/GUARDIAN; ADMIN combina com qualquer perfil.',
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(Role, { each: true })
  roles!: Role[];
}
