import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsEnum } from 'class-validator';
import { Role } from '@common/enums/enum';

export class UpdateRolesDto {
  @ApiProperty({
    enum: Role,
    isArray: true,
    example: ['MANAGER', 'EDUCATOR'],
    description:
      'Lista de perfis do usuário. STUDENT é exclusivo; MANAGER só combina com EDUCATOR.',
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(Role, { each: true })
  roles!: Role[];
}
