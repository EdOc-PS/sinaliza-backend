import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UnpromoteSignDto {
  @ApiProperty({ example: 'Sinal duplicado no glossário.', description: 'Motivo da remoção — enviado por email ao criador do sinal' })
  @IsString()
  @IsNotEmpty({ message: 'Informe o motivo da remoção.' })
  @MaxLength(500)
  reason: string;
}
