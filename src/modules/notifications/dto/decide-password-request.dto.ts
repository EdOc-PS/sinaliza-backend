import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class DecidePasswordRequestDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  approve!: boolean;
}
