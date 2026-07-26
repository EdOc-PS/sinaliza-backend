import { PartialType } from '@nestjs/swagger';
import { CreateGlossaryDisciplineDto } from './create-glossary-discipline.dto';

export class UpdateGlossaryDisciplineDto extends PartialType(CreateGlossaryDisciplineDto) {}
