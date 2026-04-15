import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({
        example: 'usuario@email.com',
        description: 'Email do usuário para autenticação',
    })
    @IsEmail()
    @IsNotEmpty()
    email!: string

    @ApiProperty({
        example: 'senha123',
        description: 'Senha do usuário',
    })
    @IsString()
    @IsNotEmpty()
    password!: string
}
