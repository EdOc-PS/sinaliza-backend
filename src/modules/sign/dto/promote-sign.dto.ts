import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class PromoteSignDto {
  @ApiProperty({
    required: false,
    type: [String],
    description: 'IDs das disciplinas do glossário a associar. Pode ser vazio (nenhuma disciplina).',
  })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  glossaryDisciplineIds?: string[];
}
