import { BadRequestException } from '@nestjs/common';
import { Role } from '@common/enums/enum';

/**
 * Regras de combinação de roles:
 * - ADMIN é aditivo: pode combinar com qualquer role (ou existir sozinho).
 * - Entre as roles funcionais (STUDENT, EDUCATOR, GUARDIAN):
 *   - STUDENT é exclusivo: não pode coexistir com EDUCATOR nem GUARDIAN.
 *   - EDUCATOR + GUARDIAN é permitido.
 *
 * Combinações funcionais válidas: {}, {STUDENT}, {EDUCATOR}, {GUARDIAN}, {EDUCATOR, GUARDIAN}.
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

  // ADMIN é aditivo — analisa apenas as roles funcionais
  const functional = [...unique].filter((r) => r !== Role.ADMIN);

  // Apenas ADMIN (sem role funcional) é válido
  if (functional.length === 0) return true;

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
      'Combinação de perfis inválida. STUDENT não pode ser combinado com EDUCATOR ou GUARDIAN; ADMIN pode ser combinado com qualquer perfil.',
    );
  }
}
