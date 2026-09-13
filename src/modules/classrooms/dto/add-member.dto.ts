import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddMemberDto {
  @ApiProperty({ example: 'aluno@email.com', description: 'Email do usuário a ser adicionado à turma' })
  @IsEmail({}, { message: 'Informe um e-mail válido.' })
  @IsNotEmpty()
  email: string;
}
