// Zera o banco local de testes e cria os dados de partida dos testes end-to-end.
import { assertTestDatabase } from './guard';

assertTestDatabase();

import * as bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

export const PASSWORD = 'Teste@123';

const TABLES = [
  'Notification', 'PasswordChangeRequest', 'PasswordResetToken', 'SignAccess', 'History', 'Favorite',
  'EssayPromptCompletion', 'EssayPrompt', 'EssayExample', 'ClassroomEnrollment', 'Sign', 'Classroom',
  'Educator', 'Student', 'User', 'Category', 'GlossaryDiscipline', 'HandConfig', 'Institution', 'Param',
];

async function main() {
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE ${TABLES.map((t) => `"${t}"`).join(', ')} RESTART IDENTITY CASCADE`,
  );

  const institution = await prisma.institution.create({
    data: {
      cnpj: '00000000000100', name: 'Instituição de Teste', zipCode: '36420000', street: 'Rua Teste',
      number: '1', neighborhood: 'Centro', city: 'Ouro Branco', state: 'MG',
      contactEmail: 'contato@teste.com', contactPhone: '31999999999',
    },
  });

  await prisma.category.createMany({
    data: [{ name: 'Verbo', value: 'VERBO' }, { name: 'Outros', value: 'OUTROS' }],
  });
  await prisma.handConfig.createMany({
    data: [
      { name: 'Mão em A', imgUrl: 'https://example.com/a.png', institutionId: institution.id },
      { name: 'Mão em B', imgUrl: 'https://example.com/b.png', institutionId: institution.id },
    ],
  });

  const password = await bcrypt.hash(PASSWORD, 4);
  const base = { password, institutionId: institution.id, onboardingSeenAt: new Date() };

  const gestor = await prisma.user.create({
    data: {
      ...base, name: 'Gestor Teste', email: 'gestor@teste.com', roles: ['EDUCATOR', 'MANAGER'],
      educator: { create: { educatorType: 'TEACHER', department: 'TI', specialty: 'Libras' } },
    },
  });

  const educators = await Promise.all(
    ['professor', 'professor2'].map((slug, i) =>
      prisma.user.create({
        data: {
          ...base, name: `Professor Teste ${i + 1}`, email: `${slug}@teste.com`, roles: ['EDUCATOR'],
          educator: { create: { educatorType: 'TEACHER', department: 'TI', specialty: 'Libras' } },
        },
      }),
    ),
  );

  const students = await Promise.all(
    ['aluno', 'aluno2'].map((slug, i) =>
      prisma.user.create({
        data: {
          ...base, name: `Aluno Teste ${i + 1}`, email: `${slug}@teste.com`, roles: ['STUDENT'],
          student: { create: { grauEscolar: 'ENSINO_MEDIO_COMPLETO', necessidadesEspeciais: '', status: 'APPROVED' } },
        },
      }),
    ),
  );

  // Turma Contexto: todo mundo é matriculado nela
  await prisma.classroom.create({
    data: {
      name: 'Contexto', classCode: 'CTX001', isContext: true, teacherId: gestor.id, institutionId: institution.id,
      enrollments: {
        create: [
          ...educators.map((u) => ({ userId: u.id, roleInClass: 'EDUCATOR' as const })),
          ...students.map((u) => ({ userId: u.id, roleInClass: 'STUDENT' as const })),
        ],
      },
    },
  });

  console.log('Banco de teste pronto.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
