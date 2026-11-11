// Trava de segurança: os testes apagam e recriam dados, então só podem
// rodar no banco local de testes, nunca no Neon.
export const TEST_DATABASE_URL = 'postgresql://postgres:postgres@localhost:5433/sinaliza_teste';

export function assertTestDatabase() {
  const url = process.env.DATABASE_URL ?? '';
  if (url !== TEST_DATABASE_URL) {
    throw new Error(`DATABASE_URL não é o banco local de testes. Abortando para proteger os dados.`);
  }
}
