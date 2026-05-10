import { IsString, IsNotEmpty, IsUrl, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateHandConfigDto {
  @ApiPropertyOptional({ example: 'Letra B' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({ example: 'https://storage.example.com/hands/letra-b.png' })
  @IsOptional()
  @IsString()
  @IsUrl()
  imgUrl?: string;
}
