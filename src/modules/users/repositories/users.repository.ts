import { PrismaService } from '@/database/prisma.service';
import { Injectable } from '@nestjs/common';

import { UpdateUserDto } from '../dto/update-user.dto';
import { Role, ApprovalStatus } from '@common/enums/enum';

@Injectable()
export class UsersRepository {
  constructor(private prisma: PrismaService) { }

  findAll() {
    return this.prisma.user.findMany();
  }

  // Lista usuários que possuem uma role específica, com filtro opcional por nome/email
  async findByRole(role: Role, search?: string) {
    const users = await this.prisma.user.findMany({
      where: {
        roles: { has: role },
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        roles: true,
        createdAt: true,
        educator: { select: { educatorType: true } },
        student: { select: { status: true } },
        guardian: { select: { status: true } },
      },
      orderBy: { name: 'asc' },
    });

    // Achata o educatorType e o status de aprovação (student/guardian) no objeto
    return users.map(({ educator, student, guardian, ...rest }) => ({
      ...rest,
      educatorType: educator?.educatorType ?? null,
      approvalStatus: student?.status ?? guardian?.status ?? null,
    }));
  }

  // Lista apenas educadores (atalho de findByRole)
  findEducators(search?: string) {
    return this.findByRole(Role.EDUCATOR, search);
  }

  // Atualiza o status de aprovação do perfil (student e/ou guardian) do usuário
  async updateApprovalStatus(userId: string, status: ApprovalStatus) {
    await this.prisma.$transaction([
      this.prisma.student.updateMany({ where: { userId }, data: { status } }),
      this.prisma.guardian.updateMany({ where: { userId }, data: { status } }),
    ]);
    return this.findOne(userId);
  }

  // Cria uma conta de EDUCATOR (usado pelo MANAGER) — usuário + perfil de educador numa transação
  async createEducatorAccount(
    userData: {
      name: string;
      email: string;
      password: string;
      phone?: string;
      bio?: string;
      institutionId?: string | null;
    },
    educatorData: {
      educatorType: string;
      department?: string;
      specialty?: string;
      certificate?: string;
      areaAtuacao?: string;
      proficienciaLibras?: string;
    },
  ) {
    const userId = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { ...userData, roles: [Role.EDUCATOR] },
      });

      await tx.educator.create({
        // educatorType/proficienciaLibras chegam como string; o schema usa enums
        data: { userId: user.id, ...educatorData } as never,
      });

      return user.id;
    });

    return this.findOne(userId);
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        educator: true,
        student: true,
        guardian: true,
        institution: { select: { name: true } },
      },
    });

    if (!user) return null;

    // Achata o educatorType (TEACHER | INTERPRETER) e os dados específicos do perfil no objeto do usuário.
    const { educator, student, guardian, ...rest } = user;
    return {
      ...rest,
      educatorType: educator?.educatorType ?? null,
      approvalStatus: student?.status ?? guardian?.status ?? null,
      dataProfile: educator
        ? {
            department: educator.department,
            specialty: educator.specialty,
            certificate: educator.certificate,
            areaAtuacao: educator.areaAtuacao,
            proficienciaLibras: educator.proficienciaLibras,
          }
        : student
          ? {
              grauEscolar: student.grauEscolar,
              necessidadesEspeciais: student.necessidadesEspeciais,
            }
          : guardian
            ? {
                parentesco: guardian.parentesco,
                studentEmail: guardian.studentEmail,
              }
            : null,
    };
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email: email},
    });
  }

  async delete(id: string) {
    return this.prisma.user.delete({
      where: { id },
    });
  }

  async updateRoles(id: string, roles: Role[]) {
    await this.prisma.user.update({
      where: { id },
      data: { roles },
    });
    return this.findOne(id);
  }

  async update(id: string, updatedUser: UpdateUserDto) {
    const { dataProfile, ...userData } = updatedUser;

    const user = await this.prisma.user.update({
      where: { id },
      data: userData,
    });

    if (dataProfile) {
      // Atualiza cada perfil que o usuário possui (um usuário pode ter mais de um)
      if (user.roles.includes('STUDENT')) {
        await this.prisma.student.update({
          where: { userId: id },
          data: {
            grauEscolar: dataProfile.grauEscolar,
            necessidadesEspeciais: dataProfile.necessidadesEspeciais,
          },
        });
      }
      if (user.roles.includes('EDUCATOR')) {
        await this.prisma.educator.update({
          where: { userId: id },
          data: {
            department: dataProfile.department,
            specialty: dataProfile.specialty,
            certificate: dataProfile.certificate,
            areaAtuacao: dataProfile.areaAtuacao,
            proficienciaLibras: dataProfile.proficienciaLibras,
          },
        });
      }
      if (user.roles.includes('GUARDIAN')) {
        await this.prisma.guardian.update({
          where: { userId: id },
          data: {
            parentesco: dataProfile.parentesco,
            studentEmail: dataProfile.studentEmail,
          },
        });
      }
    }

    return this.findOne(id);
  }
}