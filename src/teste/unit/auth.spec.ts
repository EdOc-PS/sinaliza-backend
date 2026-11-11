import * as bcrypt from 'bcrypt';
import { BadRequestException, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '@modules/auth/auth.service';
import { JwtStrategy } from '@modules/auth/jwt.strategy';
import { JwtAuthGuard } from '@modules/auth/jwt-auth.guard';

const PASSWORD = 'senha-atual';
const HASH = bcrypt.hashSync(PASSWORD, 4);

function build() {
  const usersService = { findByEmail: jest.fn(), findUser: jest.fn().mockResolvedValue({ id: 'u1' }) };
  const authRepository = {
    registerFailedLogin: jest.fn(),
    clearLoginLock: jest.fn(),
    applyApprovedPasswordChange: jest.fn(),
    findPasswordHash: jest.fn(),
    updatePassword: jest.fn().mockResolvedValue({ id: 'u1', email: 'a@b.com', roles: ['EDUCATOR'] }),
  };
  const jwtService = { sign: jest.fn().mockReturnValue('token-novo') };
  const service = new AuthService(
    {} as any,
    usersService as any,
    authRepository as any,
    {} as any,
    {} as any,
    jwtService as any,
  );
  return { service, usersService, authRepository, jwtService };
}

const user = (extra: Record<string, unknown> = {}) => ({
  id: 'u1',
  email: 'a@b.com',
  roles: ['EDUCATOR'],
  status: true,
  password: HASH,
  failedLoginAttempts: 0,
  lockedUntil: null,
  passwordChangeApproved: false,
  ...extra,
});

describe('AuthService.login', () => {
  it('recusa email não cadastrado', async () => {
    const { service, usersService } = build();
    usersService.findByEmail.mockResolvedValue(null);
    await expect(service.login({ email: 'x@y.com', password: PASSWORD })).rejects.toThrow(UnauthorizedException);
  });

  it('recusa usuário inativo', async () => {
    const { service, usersService } = build();
    usersService.findByEmail.mockResolvedValue(user({ status: false }));
    await expect(service.login({ email: 'a@b.com', password: PASSWORD })).rejects.toThrow('Usuário inativo');
  });

  it('recusa conta bloqueada, mesmo com a senha certa', async () => {
    const { service, usersService, jwtService } = build();
    usersService.findByEmail.mockResolvedValue(user({ lockedUntil: new Date(Date.now() + 60_000) }));
    await expect(service.login({ email: 'a@b.com', password: PASSWORD })).rejects.toThrow(ForbiddenException);
    expect(jwtService.sign).not.toHaveBeenCalled();
  });

  it('conta a tentativa errada e informa quantas restam', async () => {
    const { service, usersService, authRepository } = build();
    usersService.findByEmail.mockResolvedValue(user());
    authRepository.registerFailedLogin.mockResolvedValue({ locked: false, remaining: 2 });
    await expect(service.login({ email: 'a@b.com', password: 'errada' })).rejects.toThrow(/2 tentativas restantes/);
    expect(authRepository.registerFailedLogin).toHaveBeenCalledWith('u1', 6, 30);
  });

  it('bloqueia na tentativa que atinge o limite', async () => {
    const { service, usersService, authRepository } = build();
    usersService.findByEmail.mockResolvedValue(user());
    authRepository.registerFailedLogin.mockResolvedValue({ locked: true, remaining: 0 });
    await expect(service.login({ email: 'a@b.com', password: 'errada' })).rejects.toThrow(ForbiddenException);
  });

  it('devolve token e zera as tentativas no login certo', async () => {
    const { service, usersService, authRepository } = build();
    usersService.findByEmail.mockResolvedValue(user({ failedLoginAttempts: 3 }));
    const result = await service.login({ email: 'a@b.com', password: PASSWORD });
    expect(result.access_token).toBe('token-novo');
    expect(authRepository.clearLoginLock).toHaveBeenCalledWith('u1');
    expect(authRepository.applyApprovedPasswordChange).not.toHaveBeenCalled();
  });

  it('transforma a aprovação do gestor em troca obrigatória', async () => {
    const { service, usersService, authRepository } = build();
    usersService.findByEmail.mockResolvedValue(user({ passwordChangeApproved: true }));
    await service.login({ email: 'a@b.com', password: PASSWORD });
    expect(authRepository.applyApprovedPasswordChange).toHaveBeenCalledWith('u1');
  });
});

describe('AuthService.changePassword', () => {
  it('recusa quando a troca não foi liberada', async () => {
    const { service, authRepository } = build();
    authRepository.findPasswordHash.mockResolvedValue({ password: HASH, mustChangePassword: false });
    await expect(service.changePassword('u1', 'outra-senha')).rejects.toThrow(ForbiddenException);
    expect(authRepository.updatePassword).not.toHaveBeenCalled();
  });

  it('recusa senha igual à atual', async () => {
    const { service, authRepository } = build();
    authRepository.findPasswordHash.mockResolvedValue({ password: HASH, mustChangePassword: true });
    await expect(service.changePassword('u1', PASSWORD)).rejects.toThrow(BadRequestException);
  });

  it('recusa usuário que não existe mais', async () => {
    const { service, authRepository } = build();
    authRepository.findPasswordHash.mockResolvedValue(null);
    await expect(service.changePassword('u1', 'outra-senha')).rejects.toThrow(UnauthorizedException);
  });

  it('grava só o hash e devolve um token novo', async () => {
    const { service, authRepository } = build();
    authRepository.findPasswordHash.mockResolvedValue({ password: HASH, mustChangePassword: true });
    const result = await service.changePassword('u1', 'outra-senha');

    const [, saved] = authRepository.updatePassword.mock.calls[0];
    expect(saved).not.toBe('outra-senha');
    expect(await bcrypt.compare('outra-senha', saved)).toBe(true);
    expect(result.access_token).toBe('token-novo');
  });
});

describe('JwtStrategy.validate', () => {
  process.env.JWT_SECRET = 'segredo-de-teste';
  const payload = { userId: 'u1', email: 'a@b.com', roles: [], iat: 1_000 } as any;
  const strategyWith = (found: unknown) =>
    new JwtStrategy({ user: { findUnique: jest.fn().mockResolvedValue(found) } } as any);

  it('recusa token de usuário apagado', async () => {
    await expect(strategyWith(null).validate(payload)).rejects.toThrow(UnauthorizedException);
  });

  it('recusa token emitido antes da troca de senha', async () => {
    const strategy = strategyWith({ mustChangePassword: false, passwordChangedAt: new Date(2_000_000) });
    await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
  });

  it('aceita token emitido no mesmo segundo da troca', async () => {
    const strategy = strategyWith({ mustChangePassword: false, passwordChangedAt: new Date(1_000_500) });
    await expect(strategy.validate(payload)).resolves.toMatchObject({ userId: 'u1' });
  });

  it('repassa a pendência de troca de senha', async () => {
    const strategy = strategyWith({ mustChangePassword: true, passwordChangedAt: null });
    await expect(strategy.validate(payload)).resolves.toMatchObject({ mustChangePassword: true });
  });
});

describe('JwtAuthGuard.handleRequest', () => {
  const context = { getHandler: () => null, getClass: () => null } as any;
  const guardWith = (allowed: boolean) => new JwtAuthGuard({ getAllAndOverride: () => allowed } as any);

  it('recusa requisição sem usuário', () => {
    expect(() => guardWith(false).handleRequest(null, null, null, context)).toThrow(UnauthorizedException);
  });

  it('bloqueia a API enquanto a senha temporária não é trocada', () => {
    const pending = { userId: 'u1', mustChangePassword: true };
    expect(() => guardWith(false).handleRequest(null, pending, null, context)).toThrow(ForbiddenException);
  });

  it('libera as rotas marcadas para quem está com a troca pendente', () => {
    const pending = { userId: 'u1', mustChangePassword: true };
    expect(guardWith(true).handleRequest(null, pending, null, context)).toBe(pending);
  });

  it('libera usuário sem pendência', () => {
    const ok = { userId: 'u1', mustChangePassword: false };
    expect(guardWith(false).handleRequest(null, ok, null, context)).toBe(ok);
  });
});
