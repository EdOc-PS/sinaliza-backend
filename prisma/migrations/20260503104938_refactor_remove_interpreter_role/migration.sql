-- ─────────────────────────────────────────────────────────────────
-- Remover INTERPRETER do enum Role e criar EducatorType
-- Intérprete passa a ser identificado dentro da entidade Educator
-- ─────────────────────────────────────────────────────────────────

-- 1. Criar novo enum EducatorType
CREATE TYPE "EducatorType" AS ENUM ('TEACHER', 'INTERPRETER');

-- 2. Recriar enum Role sem o valor INTERPRETER
--    (PostgreSQL não suporta DROP VALUE, então recriamos o tipo)
ALTER TYPE "Role" RENAME TO "Role_old";
CREATE TYPE "Role" AS ENUM ('STUDENT', 'EDUCATOR', 'GUARDIAN', 'ADMIN');
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role" USING (
  CASE "role"::text
    WHEN 'INTERPRETER' THEN 'EDUCATOR'  -- migra intérpretes para EDUCATOR
    ELSE "role"::text
  END::"Role"
);
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'STUDENT';
DROP TYPE "Role_old";

-- 3. Drop da tabela Interpreter (entidade removida)
DROP TABLE IF EXISTS "Interpreter";

-- 4. Ajustar campos do Educator:
--    - Adicionar educatorType, certificate, areaAtuacao, proficienciaLibras
--    - Tornar department e specialty opcionais (professor-only)
ALTER TABLE "Educator"
  ADD COLUMN "educatorType"       "EducatorType" NOT NULL DEFAULT 'TEACHER',
  ADD COLUMN "certificate"        TEXT,
  ADD COLUMN "areaAtuacao"        TEXT,
  ADD COLUMN "proficienciaLibras" "LibrasLevel",
  ALTER COLUMN "department"       DROP NOT NULL,
  ALTER COLUMN "specialty"        DROP NOT NULL;
