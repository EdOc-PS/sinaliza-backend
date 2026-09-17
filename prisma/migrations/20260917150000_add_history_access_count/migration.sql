-- Contador de acessos por (usuário, sinal), usado para ranquear sinais mais/menos
-- usados no dashboard do gestor. Default 1 preenche automaticamente as linhas
-- existentes (cada uma já representa pelo menos um acesso).
ALTER TABLE "History" ADD COLUMN "accessCount" INTEGER NOT NULL DEFAULT 1;
