import { ApiPropertyOptional } from "@nestjs/swagger"
import { Transform, Type } from "class-transformer"
import { IsBoolean, IsDate, IsEmail, IsObject, IsOptional, IsPhoneNumber, IsString, IsUrl, MinLength, ValidateNested } from "class-validator"

import { DataProfileDto } from "@/modules/auth/dto/register.dto"

export class UpdateUserDto {
    @ApiPropertyOptional({
        example: 'Joao Silva',
        minLength: 3,
        description: 'Nome completo do usuário',
    })
    @IsOptional()
    @IsString()
    @MinLength(3)
    name?: string

    @ApiPropertyOptional({
        example: 'usuario@email.com',
        description: 'Email único do usuário',
    })
    @IsOptional()
    @IsEmail()
    email?: string

    @ApiPropertyOptional({
        example: 'senha123',
        minLength: 6,
        description: 'Senha com no mínimo 6 caracteres',
    })
    @IsOptional()
    @IsString()
    @MinLength(6)
    password?: string

    @ApiPropertyOptional({
        example: '21/03/2001',
        description: 'Data de nascimento no formato dd/mm/yyyy',
    })
    @IsOptional()
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            const [day, month, year] = value.split('/')
            return new Date(`${year}-${month}-${day}`)
        }
        return value
    })
    @IsDate()
    birthdate?: Date

    @ApiPropertyOptional({
        example: '+5511999999999',
        description: 'Telefone no padrão E.164 (Brasil)',
    })
    @IsOptional()
    @IsPhoneNumber('BR')
    phone?: string

    @ApiPropertyOptional({
        example: 'https://example.com/avatar.jpg',
        description: 'URL do avatar do usuário',
    })
    @IsOptional()
    @IsUrl()
    avatar?: string

    @ApiPropertyOptional({
        example: 'Professora de Libras apaixonada por educação inclusiva.',
        description: 'Biografia do usuário',
    })
    @IsOptional()
    @IsString()
    bio?: string

    @ApiPropertyOptional({
        example: true,
        description: 'Status ativo/inativo do usuário',
    })
    @IsOptional()
    @IsBoolean()
    status?: boolean

    @ApiPropertyOptional({
        description: 'Dados específicos do perfil (conteúdo varia conforme role)',
        type: DataProfileDto,
    })
    @IsObject()
    @IsOptional()
    @ValidateNested()
    @Type(() => DataProfileDto)
    dataProfile?: DataProfileDto
}