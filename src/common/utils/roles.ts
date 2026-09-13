import { BadRequestException } from '@nestjs/common';
import { Role } from '@common/enums/enum';

/**
 * Regras de combinação de roles:
 * - STUDENT é exclusivo: não coexiste com nenhuma outra.
 * - MANAGER só existe acompanhado de EDUCATOR (apenas educadores podem ser gestores).
 *
 * Combinações válidas: {STUDENT}, {EDUCATOR}, {EDUCATOR, MANAGER}.
 */
export function isValidRoleCombination(roles: Role[]): boolean {
  if (!roles || roles.length === 0) return false;

  const unique = new Set(roles);
  if (unique.size !== roles.length) return false;

  for (const role of unique) {
    if (!Object.values(Role).includes(role)) return false;
  }

  if (unique.has(Role.STUDENT)) return unique.size === 1;

  // Sem STUDENT, precisa ter EDUCATOR; MANAGER é opcional por cima
  return unique.has(Role.EDUCATOR);
}

export function assertValidRoleCombination(roles: Role[]): void {
  if (!isValidRoleCombination(roles)) {
    throw new BadRequestException(
      'Combinação de perfis inválida. STUDENT não pode ser combinado com outro perfil; MANAGER só pode ser atribuído a um EDUCATOR.',
    );
  }
}
