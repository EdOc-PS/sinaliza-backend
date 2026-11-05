/**
 * Limpeza geral da plataforma (IRREVERSÍVEL).
 *
 * Apaga: todos os usuários (menos o gestor Eduardo), todos os sinais, todas as
 * turmas (menos a Contexto) e, em cascata, matrículas, favoritos, histórico e métricas.
 * Mantém: gestor Eduardo, turma Contexto, instituição, categorias,
 * disciplinas do glossário e configurações de mão.
 * O email do gestor passa a ser NEW_MANAGER_EMAIL; a senha continua a mesma.
 *
 * Simulação (não altera nada): npx ts-node scripts/reset-platform.ts
 * Execução:                    npx ts-node scripts/reset-platform.ts --confirm
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const MANAGER_NAME = 'Eduardo Octavio';
const NEW_MANAGER_EMAIL = 'eeuardooctavio@gmail.com';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined.');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const managers = await prisma.user.findMany({
    where: { name: MANAGER_NAME, roles: { has: 'MANAGER' } },
  });
  if (managers.length !== 1) {
    throw new Error(`Esperava 1 gestor "${MANAGER_NAME}", achei ${managers.length}.`);
  }
  const manager = managers[0];

  const context = await prisma.classroom.findFirst({ where: { isContext: true } });
  if (!context) throw new Error('Turma Contexto não encontrada.');
  if (context.teacherId !== manager.id) {
    throw new Error('A turma Contexto não pertence ao gestor mantido.');
  }

  console.log(`Banco: ${new URL(connectionString!).hostname}`);
  console.log(`Gestor mantido: ${manager.name} -> ${NEW_MANAGER_EMAIL}`);
  console.log(`Turma mantida: ${context.name}`);
  console.log('Serão apagados:', {
    usuarios: await prisma.user.count({ where: { id: { not: manager.id } } }),
    sinais: await prisma.sign.count(),
    turmas: await prisma.classroom.count({ where: { id: { not: context.id } } }),
    favoritos: await prisma.favorite.count(),
    historico: await prisma.history.count(),
    acessos: await prisma.signAccess.count(),
  });

  if (!process.argv.includes('--confirm')) {
    console.log('Simulação: nada foi alterado. Use --confirm para executar.');
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.sign.deleteMany();
    await tx.classroom.deleteMany({ where: { id: { not: context.id } } });
    await tx.user.deleteMany({ where: { id: { not: manager.id } } });
    await tx.passwordResetToken.deleteMany();
    await tx.user.update({
      where: { id: manager.id },
      data: { email: NEW_MANAGER_EMAIL, failedLoginAttempts: 0, lockedUntil: null },
    });
  });

  console.log('Limpeza concluída.');
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
