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

// Parâmetros de selects (níveis escolares)
const params = [
  // SCHOOL_LEVEL
  { type: 'SCHOOL_LEVEL', label: '1º Ano do Ensino Médio', value: 'ENSINO_MEDIO_1', order: 1 },
  { type: 'SCHOOL_LEVEL', label: '2º Ano do Ensino Médio', value: 'ENSINO_MEDIO_2', order: 2 },
  { type: 'SCHOOL_LEVEL', label: '3º Ano do Ensino Médio', value: 'ENSINO_MEDIO_3', order: 3 },
];

// Categorias iniciais dos sinais (educadores podem criar mais)
const categories = [
  { name: 'Verbo',       value: 'VERBO' },
  { name: 'Adjetivo',    value: 'ADJETIVO' },
  { name: 'Substantivo', value: 'SUBSTANTIVO' },
  { name: 'Animal',      value: 'ANIMAL' },
  { name: 'Outros',      value: 'OUTROS' },
];

async function main() {
  for (const param of params) {
    await prisma.param.upsert({
      where: { type_value: { type: param.type, value: param.value } },
      update: { label: param.label, order: param.order, isActive: true },
      create: { ...param, isActive: true },
    });
  }

  for (const category of categories) {
    await prisma.category.upsert({
      where: { value: category.value },
      update: { name: category.name },
      create: category,
    });
  }

  console.log(`Seed concluído: ${params.length} parâmetros e ${categories.length} categorias.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
