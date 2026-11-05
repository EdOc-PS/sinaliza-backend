import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ description: 'Senha atual (ou a temporária criada pelo gestor)' })
  @IsString()
  currentPassword!: string;

  @ApiProperty({ example: 'novaSenha123', minLength: 6, maxLength: 64 })
  @IsString()
  @MinLength(6, { message: 'A senha precisa ter pelo menos 6 caracteres.' })
  @MaxLength(64, { message: 'A senha pode ter no máximo 64 caracteres.' })
  newPassword!: string;
}
