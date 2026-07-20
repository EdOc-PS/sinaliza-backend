import { IsBoolean, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReviewPromotionDto {
  @ApiProperty({ example: true, description: 'true aprova (sinal vira público); false recusa a promoção' })
  @IsBoolean()
  @IsNotEmpty()
  approve: boolean;
}
