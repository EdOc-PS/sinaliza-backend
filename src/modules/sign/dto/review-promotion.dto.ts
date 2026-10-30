import { IsBoolean, IsNotEmpty, IsString, MaxLength, ValidateIf } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReviewPromotionDto {
  @ApiProperty({ example: true, description: 'true aprova (sinal vira público); false recusa a promoção' })
  @IsBoolean()
  @IsNotEmpty()
  approve: boolean;

  @ApiPropertyOptional({ example: 'O vídeo está cortado no final do movimento.', description: 'Obrigatório ao recusar — enviado por email ao criador do sinal' })
  @ValidateIf((dto: ReviewPromotionDto) => dto.approve === false)
  @IsString()
  @IsNotEmpty({ message: 'Informe o motivo da recusa.' })
  @MaxLength(500)
  reason?: string;
}
