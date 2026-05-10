import { IsString, IsNotEmpty, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateHandConfigDto {
  @ApiProperty({ example: 'Letra A' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'https://storage.example.com/hands/letra-a.png' })
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  imgUrl: string;
}
