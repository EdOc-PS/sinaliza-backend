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

// Parâmetros de selects usados pela aplicação (classes gramaticais e níveis escolares)
const params = [
  // GRAMMATICAL_CLASS
  { type: 'GRAMMATICAL_CLASS', label: 'Verbo',       value: 'VERB',      order: 1 },
  { type: 'GRAMMATICAL_CLASS', label: 'Adjetivo',    value: 'ADJECTIVE', order: 2 },
  { type: 'GRAMMATICAL_CLASS', label: 'Substantivo', value: 'NOUN',      order: 3 },
  { type: 'GRAMMATICAL_CLASS', label: 'Outros',      value: 'OTHER',     order: 4 },

  // SCHOOL_LEVEL
  { type: 'SCHOOL_LEVEL', label: '1º Ano do Ensino Médio', value: 'ENSINO_MEDIO_1', order: 1 },
  { type: 'SCHOOL_LEVEL', label: '2º Ano do Ensino Médio', value: 'ENSINO_MEDIO_2', order: 2 },
  { type: 'SCHOOL_LEVEL', label: '3º Ano do Ensino Médio', value: 'ENSINO_MEDIO_3', order: 3 },

  // SCHOOL_GRADE (grau escolar do estudante)
  { type: 'SCHOOL_GRADE', label: 'Ensino Fundamental Incompleto', value: 'ENSINO_FUNDAMENTAL_INCOMPLETO', order: 1 },
  { type: 'SCHOOL_GRADE', label: 'Ensino Fundamental Completo',   value: 'ENSINO_FUNDAMENTAL_COMPLETO',   order: 2 },
  { type: 'SCHOOL_GRADE', label: 'Ensino Médio Incompleto',       value: 'ENSINO_MEDIO_INCOMPLETO',       order: 3 },
  { type: 'SCHOOL_GRADE', label: 'Ensino Médio Completo',         value: 'ENSINO_MEDIO_COMPLETO',         order: 4 },
  { type: 'SCHOOL_GRADE', label: 'Ensino Superior Incompleto',    value: 'ENSINO_SUPERIOR_INCOMPLETO',    order: 5 },
  { type: 'SCHOOL_GRADE', label: 'Ensino Superior Completo',      value: 'ENSINO_SUPERIOR_COMPLETO',      order: 6 },
];

async function main() {
  for (const param of params) {
    await prisma.param.upsert({
      where: { type_value: { type: param.type, value: param.value } },
      update: { label: param.label, order: param.order, isActive: true },
      create: { ...param, isActive: true },
    });
  }

  console.log(`Seed concluído: ${params.length} parâmetros inseridos/atualizados.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
