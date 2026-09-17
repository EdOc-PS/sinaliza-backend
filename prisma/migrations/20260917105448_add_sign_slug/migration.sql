-- AlterTable
BEGIN;

ALTER TABLE "Sign" ADD COLUMN "slug" TEXT;

-- Backfill dos sinais existentes: kebab-case simples. Os nomes atuais não têm
-- acento nem pontuação incomum, então lower + troca de separador é suficiente
-- aqui; a geração "de verdade" para sinais novos (com remoção de acento) fica
-- no app (SignService.toSignSlug), não neste backfill único.
UPDATE "Sign"
SET "slug" = trim(both '-' from regexp_replace(lower(name), '[^a-z0-9]+', '-', 'g'))
WHERE "slug" IS NULL;

ALTER TABLE "Sign" ALTER COLUMN "slug" SET NOT NULL;

-- CreateIndex
ALTER TABLE "Sign" ADD CONSTRAINT "Sign_slug_key" UNIQUE ("slug");

COMMIT;
