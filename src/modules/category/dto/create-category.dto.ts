import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Animal', description: 'Nome da categoria. O value é gerado em UPPER_SNAKE automaticamente.' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(40)
  name!: string;
}
