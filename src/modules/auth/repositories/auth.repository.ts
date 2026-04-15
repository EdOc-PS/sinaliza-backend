import { PrismaService } from "@/database/prisma.service";
import { Injectable } from "@nestjs/common";
import { CreateUserDto } from "../dto/create-user.dto";

@Injectable()
export class AuthRepository {

    constructor(
        private prisma: PrismaService,
    ) { }

    createAccount(newUser: CreateUserDto, hashPassword: string) {
        return this.prisma.user.create({
            data: {
                ...newUser,
                password: hashPassword
            }
        });
    }

}

