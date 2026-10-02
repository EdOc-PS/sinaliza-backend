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
    roles: Role[];
    institutionId?: string | null;
    avatar?: string;
};

type EducatorData = {
    educatorType: string;
    department?: string;
    specialty?: string;
    certificate?: string;
    areaAtuacao?: string;
    proficienciaLibras?: string;
};

type ProfileData =
    | { type: Role.STUDENT;  data: { grauEscolar: string; necessidadesEspeciais: string } }
    | { type: Role.EDUCATOR; data: EducatorData }
    | null;

@Injectable()
export class AuthRepository {

    constructor(private readonly prisma: PrismaService) { }

    async createAccount(userData: UserData, profileData: ProfileData) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const db = this.prisma as any;

        return db.$transaction(async (tx: any) => {
            const user = await tx.user.create({ data: userData });

            if (profileData) {
                const profileInsert: Record<string, unknown> = { userId: user.id, ...profileData.data };

                switch (profileData.type) {
                    case Role.STUDENT:  await tx.student.create({ data: profileInsert });  break;
                    case Role.EDUCATOR: await tx.educator.create({ data: profileInsert }); break;
                }
            }

            return tx.user.findUnique({
                where: { id: user.id },
                include: { student: true, educator: true },
            });
        });
    }

    // Soma uma tentativa errada; ao atingir o limite, bloqueia e zera o contador
    async registerFailedLogin(userId: string, maxAttempts: number, lockMinutes: number) {
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: { failedLoginAttempts: { increment: 1 } },
            select: { failedLoginAttempts: true },
        });

        if (user.failedLoginAttempts < maxAttempts) {
            return { locked: false, remaining: maxAttempts - user.failedLoginAttempts };
        }

        const lockedUntil = new Date(Date.now() + lockMinutes * 60_000);
        await this.prisma.user.update({
            where: { id: userId },
            data: { failedLoginAttempts: 0, lockedUntil },
        });
        return { locked: true, remaining: 0 };
    }

    async clearLoginLock(userId: string) {
        await this.prisma.user.update({
            where: { id: userId },
            data: { failedLoginAttempts: 0, lockedUntil: null },
        });
    }
}
