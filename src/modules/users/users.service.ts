import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { UsersRepository } from "./repositories/users.repository";
import { UpdateUserDto } from "./dto/update-user.dto";

@Injectable()
export class UsersService {

  constructor(private usersRepository: UsersRepository) {}

  findAll() {
    return this.usersRepository.findAll();
  }

  findUser(id: string) {
    return this.findByIdOrFail(id);
  }

  findByEmail (email: string) {
    return this.usersRepository.findByEmail(email);
  }

  async findByIdOrFail(id: string) {

    const user = await this.usersRepository.findOne(id);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }

  async validateActiveUser(id: string) {
    const user = await this.findByIdOrFail(id);

    if (!user.status) {
      throw new ForbiddenException('Usuário inativo');
    }

    return user;
  }

  async update(id: string, updatedUser: UpdateUserDto) {
    await this.findByIdOrFail(id);

    return this.usersRepository.update(id, updatedUser);
  }

  async delete(id: string) {
    await this.findByIdOrFail(id);

    return this.usersRepository.delete(id);
  }

}