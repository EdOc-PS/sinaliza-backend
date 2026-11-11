import { BadRequestException } from '@nestjs/common';
import { Role } from '@common/enums/enum';
import { assertValidRoleCombination, isValidRoleCombination } from '@common/utils/roles';
import { RolesGuard } from '@common/guards/roles.guard';

describe('Combinação de perfis', () => {
  it.each([
    [[Role.STUDENT]],
    [[Role.EDUCATOR]],
    [[Role.EDUCATOR, Role.MANAGER]],
  ])('aceita %j', (roles) => {
    expect(isValidRoleCombination(roles)).toBe(true);
  });

  it.each([
    ['lista vazia', []],
    ['gestor sem educador', [Role.MANAGER]],
    ['aluno com educador', [Role.STUDENT, Role.EDUCATOR]],
    ['aluno com gestor', [Role.STUDENT, Role.MANAGER]],
    ['perfil repetido', [Role.EDUCATOR, Role.EDUCATOR]],
    ['perfil inexistente', ['ADMIN' as Role]],
  ])('recusa %s', (_nome, roles) => {
    expect(isValidRoleCombination(roles)).toBe(false);
    expect(() => assertValidRoleCombination(roles)).toThrow(BadRequestException);
  });
});

describe('RolesGuard', () => {
  const contextFor = (roles?: Role[]) =>
    ({
      getHandler: () => null,
      getClass: () => null,
      switchToHttp: () => ({ getRequest: () => ({ user: roles ? { roles } : undefined }) }),
    }) as any;

  const guardRequiring = (required?: Role[]) =>
    new RolesGuard({ getAllAndOverride: () => required } as any);

  it('libera rota sem perfis exigidos', () => {
    expect(guardRequiring(undefined).canActivate(contextFor([Role.STUDENT]))).toBe(true);
  });

  it('libera quem tem um dos perfis exigidos', () => {
    const guard = guardRequiring([Role.EDUCATOR, Role.MANAGER]);
    expect(guard.canActivate(contextFor([Role.EDUCATOR]))).toBe(true);
  });

  it('bloqueia aluno em rota de gestor', () => {
    expect(guardRequiring([Role.MANAGER]).canActivate(contextFor([Role.STUDENT]))).toBe(false);
  });

  it('bloqueia requisição sem usuário', () => {
    expect(guardRequiring([Role.MANAGER]).canActivate(contextFor(undefined))).toBe(false);
  });
});
