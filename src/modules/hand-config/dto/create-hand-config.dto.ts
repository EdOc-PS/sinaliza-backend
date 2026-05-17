import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateHandConfigDto {
  @ApiProperty({ example: 'Letra A' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ type: 'string', format: 'binary', description: 'Imagem da configuração de mão' })
  image: any;
}
