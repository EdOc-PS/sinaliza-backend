/**
 * Cadastra as disciplinas básicas e técnicas do glossário.
 *
 * Uso: npx ts-node scripts/seed-glossary-disciplines.ts
 *
 * É idempotente: disciplinas que já existem (mesmo nome) são ignoradas.
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined.');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const disciplines = [
  // Básicas
  { name: 'Matemática', description: 'Sinais de números, operações, geometria e estatística.' },
  { name: 'Português', description: 'Sinais de gramática, leitura, escrita e literatura.' },
  { name: 'História', description: 'Sinais de períodos, fatos e personagens históricos.' },
  { name: 'Geografia', description: 'Sinais de lugares, território, clima e sociedade.' },
  { name: 'Biologia', description: 'Sinais de seres vivos, corpo humano e meio ambiente.' },
  // Técnicas
  { name: 'Programação', description: 'Sinais de lógica, algoritmos e linguagens de programação.' },
  { name: 'Banco de Dados', description: 'Sinais de modelagem, tabelas e consultas de dados.' },
  { name: 'Eletrônica', description: 'Sinais de circuitos, componentes e medidas elétricas.' },
  { name: 'Sistemas Operacionais', description: 'Sinais de processos, memória e arquivos.' },
  { name: 'Redes de Computadores', description: 'Sinais de protocolos, conexões e internet.' },
];

async function main() {
  let created = 0;

  for (const discipline of disciplines) {
    const existing = await prisma.glossaryDiscipline.findFirst({
      where: { name: { equals: discipline.name, mode: 'insensitive' } },
    });

    if (existing) {
      console.log(`• Já existe: ${discipline.name}`);
      continue;
    }

    await prisma.glossaryDiscipline.create({ data: discipline });
    created++;
    console.log(`✔ Criada: ${discipline.name}`);
  }

  console.log(`Concluído: ${created} criadas, ${disciplines.length - created} já existiam.`);
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
