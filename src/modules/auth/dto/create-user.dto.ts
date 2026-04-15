import { Role } from "@prisma/client"
import { Transform } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsDate, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, MinLength } from "class-validator"


export class CreateUserDto {
    @ApiProperty({
        example: 'Joao Silva',
        minLength: 3,
        description: 'Nome completo do usuário',
    })
    @IsString()
    @MinLength(3)
    @IsNotEmpty()
    name!: string

    @ApiProperty({
        example: 'usuario@email.com',
        description: 'Email único do usuário',
    })
    @IsEmail()
    @IsNotEmpty()
    email!: string

    @ApiProperty({
        example: 'senha123',
        minLength: 6,
        description: 'Senha com no mínimo 6 caracteres',
    })
    @IsString()
    @MinLength(6)
    @IsNotEmpty()
    password!: string

    @ApiPropertyOptional({
        example: '21/03/2001',
        description: 'Data de nascimento no formato dd/mm/yyyy',
    })
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

    @ApiPropertyOptional({
        example: '+5511999999999',
        description: 'Telefone no padrão E.164 (Brasil)',
    })
    @IsOptional()
    @IsPhoneNumber('BR')
    phone?: string

    @ApiPropertyOptional({
        example: 'STUDENT',
        enum: Role,
        description: 'Papel do usuário no sistema (STUDENT, EDUCATOR, GUARDIAN, ADMIN)',
        default: 'STUDENT',
    })
    @IsEnum(Role)
    @IsOptional()
    role?: Role
}