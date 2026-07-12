import { EducatorType } from '@common/enums/enum';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';

import { DataProfileDto } from '@modules/auth/dto/register.dto';

// DTO usado pelo MANAGER para cadastrar um EDUCATOR (professor ou intérprete).
// Reaproveita DataProfileDto (campos de department/specialty/certificate/etc).
export class CreateEducatorDto {
  @ApiProperty({ example: 'Maria Souza', description: 'Nome completo' })
  @IsString()
  @MinLength(3)
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'educador@email.com', description: 'Email único' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: 'senha123', minLength: 6, description: 'Senha inicial definida pelo gestor' })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password!: string;

  @ApiProperty({ example: 'TEACHER', enum: EducatorType, description: 'Professor (TEACHER) ou Intérprete (INTERPRETER)' })
  @IsEnum(EducatorType)
  @IsNotEmpty()
  educatorType!: EducatorType;

  @ApiPropertyOptional({ example: false, description: 'Se true, o educador também recebe o perfil de MANAGER (gestor)' })
  @IsOptional()
  @IsBoolean()
  isManager?: boolean;

  @ApiPropertyOptional({ example: '+5511999999999', description: 'Telefone E.164' })
  @IsOptional()
  @IsPhoneNumber('BR')
  phone?: string;

  @ApiPropertyOptional({ description: 'Breve bio do educador' })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiProperty({ description: 'Dados do perfil de educador', type: DataProfileDto })
  @IsObject()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => DataProfileDto)
  dataProfile!: DataProfileDto;
}
