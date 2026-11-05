import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateMemberAdminDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  isAdmin!: boolean;
}
