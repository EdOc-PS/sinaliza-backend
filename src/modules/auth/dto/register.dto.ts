import { EducatorType, LibrasLevel, Role } from '@common/enums/enum'
import { Transform, Type } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
    IsDate,
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsObject,
    IsOptional,
    IsPhoneNumber,
    IsString,
    MinLength,
    ValidateNested,
} from 'class-validator'

// ─────────────────────────────────────────────
// Dados de Perfil (dentro de dataProfile)
// ─────────────────────────────────────────────

export class DataProfileDto {
    @ApiPropertyOptional({ example: 'IFMG Ouro Preto', description: 'Instituto/escola' })
    @IsString()
    @IsOptional()
    institute?: string

    // STUDENT
    @ApiPropertyOptional({ example: 'Ensino Médio', description: '[STUDENT]' })
    @IsString()
    @IsOptional()
    grauEscolar?: string

    @ApiPropertyOptional({ example: 'Surdez bilateral', description: '[STUDENT]' })
    @IsString()
    @IsOptional()
    necessidadesEspeciais?: string

    // EDUCATOR
    @ApiPropertyOptional({ example: 'TEACHER', enum: EducatorType, description: '[EDUCATOR] Professor ou Intérprete' })
    @IsEnum(EducatorType)
    @IsOptional()
    educatorType?: EducatorType

    @ApiPropertyOptional({ example: 'Pedagogia', description: '[EDUCATOR / TEACHER]' })
    @IsString()
    @IsOptional()
    department?: string

    @ApiPropertyOptional({ example: 'Libras e Inclusão', description: '[EDUCATOR / TEACHER]' })
    @IsString()
    @IsOptional()
    specialty?: string

    // EDUCATOR / INTERPRETER
    @ApiPropertyOptional({ example: 'ProLibras 2023', description: '[EDUCATOR / INTERPRETER]' })
    @IsString()
    @IsOptional()
    certificate?: string

    @ApiPropertyOptional({ example: 'Interpretação em sala', description: '[EDUCATOR / INTERPRETER]' })
    @IsString()
    @IsOptional()
    areaAtuacao?: string

    @ApiPropertyOptional({ example: 'FLUENTE', enum: LibrasLevel, description: '[EDUCATOR / INTERPRETER]' })
    @IsEnum(LibrasLevel)
    @IsOptional()
    proficienciaLibras?: LibrasLevel

    // GUARDIAN
    @ApiPropertyOptional({ example: 'mãe', description: '[GUARDIAN]' })
    @IsString()
    @IsOptional()
    parentesco?: string

    @ApiPropertyOptional({ example: 'aluno@email.com', description: '[GUARDIAN]' })
    @IsEmail()
    @IsOptional()
    studentEmail?: string
}

// ─────────────────────────────────────────────
// DTO Principal
// ─────────────────────────────────────────────

export class RegisterDto {
    @ApiProperty({ example: 'João Silva', description: 'Nome completo' })
    @IsString()
    @MinLength(3)
    @IsNotEmpty()
    name!: string

    @ApiProperty({ example: 'usuario@email.com', description: 'Email único' })
    @IsEmail()
    @IsNotEmpty()
    email!: string

    @ApiProperty({ example: 'senha123', minLength: 6 })
    @IsString()
    @MinLength(6)
    @IsNotEmpty()
    password!: string

    @ApiProperty({ example: 'STUDENT', enum: Role })
    @IsEnum(Role)
    @IsNotEmpty()
    role!: Role

    @ApiPropertyOptional({ example: '+5511999999999', description: 'Telefone E.164' })
    @IsOptional()
    @IsPhoneNumber('BR')
    phone?: string

    @ApiPropertyOptional({ example: '21/03/2001', description: 'Nascimento dd/mm/yyyy' })
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            const [day, month, year] = value.split('/')
            return new Date(`${year}-${month}-${day}`)
        }
        return value
    })
    @IsDate()
    @IsOptional()
    birthdate?: Date

    @ApiPropertyOptional({ description: 'Breve bio do usuário' })
    @IsString()
    @IsOptional()
    bio?: string

    @ApiProperty({
        description: 'Dados específicos do perfil (conteúdo varia conforme role)',
        type: DataProfileDto,
    })
    @IsObject()
    @IsNotEmpty()
    @ValidateNested()
    @Type(() => DataProfileDto)
    dataProfile!: DataProfileDto
}
