// Sorteia um avatar pros usuários que já existem no banco e ainda não têm um
// (avatar = null) — rode uma vez após adicionar os presets.
// Uso: npx ts-node -r tsconfig-paths/register scripts/backfill-avatars.ts
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { AVATAR_PRESET_KEYS } from '../src/modules/users/dto/update-user.dto';

const randomKey = () => AVATAR_PRESET_KEYS[Math.floor(Math.random() * AVATAR_PRESET_KEYS.length)];

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  const users = await prisma.user.findMany({
    where: { avatar: null },
    select: { id: true },
  });

  for (const user of users) {
    await prisma.user.update({ where: { id: user.id }, data: { avatar: randomKey() } });
  }

  console.log(`Avatares sorteados para ${users.length} usuário(s).`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
