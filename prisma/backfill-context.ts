/**
 * Backfill da turma Contexto.
 *
 * - Cria a turma Contexto se ela ainda não existir (isContext = true)
 * - Matricula TODOS os alunos e educadores existentes que ainda não estão nela
 *
 * Uso: npm run context:backfill
 *
 * É idempotente: pode rodar quantas vezes quiser.
 */
import 'dotenv/config';
import { PrismaClient, type ClassRole, type Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined.');
}

// O Prisma 7 exige o adapter explícito (mesmo setup do seed.ts e do PrismaService)
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Mesma regra do ClassroomService: a role na turma deriva das roles do usuário
function resolveClassRole(roles: Role[]): ClassRole {
  return roles.includes('EDUCATOR') ? 'EDUCATOR' : 'STUDENT';
}

// Código de convite no mesmo formato do resto do sistema (6 caracteres)
function generateClassCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

async function main() {
  // 1. Garante que a turma Contexto existe
  let context = await prisma.classroom.findFirst({ where: { isContext: true } });

  if (!context) {
    // Precisa de um professor responsável — usa o primeiro gestor/educador encontrado
    const teacher = await prisma.user.findFirst({
      where: { OR: [{ roles: { has: 'MANAGER' } }, { roles: { has: 'EDUCATOR' } }] },
      select: { id: true, institutionId: true },
    });

    if (!teacher) {
      console.error('✖ Nenhum educador/gestor encontrado. Crie um antes de rodar o backfill.');
      process.exit(1);
    }

    context = await prisma.classroom.create({
      data: {
        name: 'Contexto',
        description:
          'Espaço do projeto de pesquisa Contexto: propostas de redação, exemplos e os sinais do tema.',
        colorBackground: '#56B2D4',
        classCode: generateClassCode(),
        isContext: true,
        teacherId: teacher.id,
        institutionId: teacher.institutionId,
      },
    });
    console.log(`✔ Turma Contexto criada (id: ${context.id})`);
  } else {
    console.log(`• Turma Contexto já existe (id: ${context.id})`);
  }

  // 2. Matricula alunos e educadores que ainda não estão na turma
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { roles: { has: 'STUDENT' } },
        { roles: { has: 'EDUCATOR' } },
        { roles: { has: 'MANAGER' } },
      ],
    },
    select: { id: true, roles: true },
  });

  let enrolled = 0;
  for (const user of users) {
    const result = await prisma.classroomEnrollment.upsert({
      where: { userId_classroomId: { userId: user.id, classroomId: context.id } },
      create: {
        userId: user.id,
        classroomId: context.id,
        roleInClass: resolveClassRole(user.roles),
      },
      update: {},
      select: { createdAt: true },
    });
    // createdAt "novo" indica que a matrícula acabou de ser criada
    if (Date.now() - result.createdAt.getTime() < 5000) enrolled++;
  }

  console.log(`✔ ${users.length} usuário(s) verificado(s) · ${enrolled} matrícula(s) nova(s)`);
}

main()
  .catch((error) => {
    console.error('✖ Falha no backfill:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
