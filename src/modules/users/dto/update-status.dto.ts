import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateStatusDto {
  @ApiProperty({ example: false, description: 'true = ativo, false = desativado (bloqueia login)' })
  @IsBoolean()
  status!: boolean;
}
