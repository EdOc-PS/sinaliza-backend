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

// Categorias iniciais dos sinais (educadores podem criar mais)
const categories = [
  { name: 'Verbo',       value: 'VERBO' },
  { name: 'Adjetivo',    value: 'ADJETIVO' },
  { name: 'Substantivo', value: 'SUBSTANTIVO' },
  { name: 'Animal',      value: 'ANIMAL' },
  { name: 'Outros',      value: 'OUTROS' },
];

async function main() {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { value: category.value },
      update: { name: category.name },
      create: category,
    });
  }

  console.log(`Seed concluído: ${categories.length} categorias.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
