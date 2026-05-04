import { PrismaService } from "@/database/prisma.service";
import { Injectable } from "@nestjs/common";
import { Role } from "@common/enums/enum";

type UserData = {
    name: string;
    email: string;
    password: string;
    phone?: string;
    birthdate?: Date;
    bio?: string;
    role: string;
};

type EducatorData = {
    institute: string;
    educatorType: string;
    department?: string;
    specialty?: string;
    certificate?: string;
    areaAtuacao?: string;
    proficienciaLibras?: string;
};

type ProfileData =
    | { type: Role.STUDENT;  data: { institute?: string; grauEscolar: string; necessidadesEspeciais: string } }
    | { type: Role.EDUCATOR; data: EducatorData }
    | { type: Role.GUARDIAN; data: { parentesco: string; studentEmail?: string } }
    | null;

@Injectable()
export class AuthRepository {

    constructor(private readonly prisma: PrismaService) { }

    async createAccount(userData: UserData, profileData: ProfileData) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const db = this.prisma as any;

        return db.$transaction(async (tx: any) => {

            // 1. Persiste o usuário base
            const user = await tx.user.create({ data: userData });

            // 2. Persiste a entidade de perfil com os dados já preparados pelo service
            if (profileData) {
                const profileInsert: Record<string, unknown> = { userId: user.id, ...profileData.data };

                switch (profileData.type) {
                    case Role.STUDENT:  await tx.student.create({ data: profileInsert });  break;
                    case Role.EDUCATOR: await tx.educator.create({ data: profileInsert }); break;
                    case Role.GUARDIAN: await tx.guardian.create({ data: profileInsert }); break;
                }
            }

            // 3. Retorna o usuário com o perfil incluído
            return tx.user.findUnique({
                where: { id: user.id },
                include: { student: true, educator: true, guardian: true },
            });
        });
    }
}
