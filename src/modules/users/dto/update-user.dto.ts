import { ApiPropertyOptional } from "@nestjs/swagger"
import { Transform, Type } from "class-transformer"
import { IsBoolean, IsDate, IsEmail, IsIn, IsObject, IsOptional, IsPhoneNumber, IsString, MinLength, ValidateNested } from "class-validator"

import { DataProfileDto } from "@/modules/auth/dto/register.dto"

// Espelha AVATAR_PRESET_KEYS do front (src/lib/constants/avatars.ts) — o banco
// guarda só a chave do preset, nunca uma URL/imagem, pra não gastar espaço no Neon.
export const AVATAR_PRESET_KEYS = [
    'alien', 'astronaut', 'girl-heart', 'girl', 'kitten', 'knight', 'ninja',
    'paleontologist', 'pirate', 'police', 'psychologist', 'queen', 'robot',
    'student', 'superhero', 'teacher-blond', 'teacher', 'vampire', 'veterinary',
    'witch', 'wizard',
] as const

// Sorteia um avatar pra conta nova — sem seleção manual no cadastro ainda
export function getRandomAvatarKey(): string {
    return AVATAR_PRESET_KEYS[Math.floor(Math.random() * AVATAR_PRESET_KEYS.length)]
}

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
    @IsEmail({}, { message: 'Informe um e-mail válido.' })
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
        example: 'sun',
        description: 'Chave do avatar pré-definido (imagem já existe no front, não uma URL)',
        enum: AVATAR_PRESET_KEYS,
    })
    @IsOptional()
    @IsIn(AVATAR_PRESET_KEYS, { message: 'Avatar inválido.' })
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