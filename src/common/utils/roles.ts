import { BadRequestException } from '@nestjs/common';
import { Role } from '@common/enums/enum';

/**
 * Regras de combinação de roles:
 * - MANAGER é aditivo, porém restrito: só pode existir acompanhado de EDUCATOR
 *   (apenas educadores podem ser gestores). MANAGER sozinho é inválido.
 * - Entre as roles funcionais (STUDENT, EDUCATOR, GUARDIAN):
 *   - STUDENT é exclusivo: não pode coexistir com EDUCATOR nem GUARDIAN.
 *   - EDUCATOR + GUARDIAN é permitido.
 *
 * Combinações válidas: {STUDENT}, {EDUCATOR}, {GUARDIAN}, {EDUCATOR, GUARDIAN},
 * {EDUCATOR, MANAGER}, {EDUCATOR, GUARDIAN, MANAGER}.
 */
export function isValidRoleCombination(roles: Role[]): boolean {
  if (!roles || roles.length === 0) return false;

  // Não pode haver roles duplicadas
  const unique = new Set(roles);
  if (unique.size !== roles.length) return false;

  // Todas precisam ser roles válidas
  for (const role of unique) {
    if (!Object.values(Role).includes(role)) return false;
  }

  // MANAGER só existe acompanhado de EDUCATOR (apenas educadores podem ser gestores)
  if (unique.has(Role.MANAGER) && !unique.has(Role.EDUCATOR)) return false;

  // Analisa apenas as roles funcionais (sem MANAGER)
  const functional = [...unique].filter((r) => r !== Role.MANAGER);
  if (functional.length === 0) return false;

  // STUDENT é exclusivo entre as funcionais
  if (functional.includes(Role.STUDENT)) {
    return functional.length === 1;
  }

  // Restam EDUCATOR e/ou GUARDIAN, que podem coexistir
  return functional.every((r) => r === Role.EDUCATOR || r === Role.GUARDIAN);
}

export function assertValidRoleCombination(roles: Role[]): void {
  if (!isValidRoleCombination(roles)) {
    throw new BadRequestException(
      'Combinação de perfis inválida. STUDENT não pode ser combinado com EDUCATOR ou GUARDIAN; MANAGER só pode ser atribuído a um EDUCATOR.',
    );
  }
}
