import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PasswordRequestService } from '@modules/notifications/password-request.service';

function build() {
  const prisma = {
    passwordChangeRequest: {
      findFirst: jest.fn().mockResolvedValue(null),
      findUnique: jest.fn().mockResolvedValue({ id: 'r1', userId: 'aluno' }),
      create: jest.fn().mockResolvedValue({ id: 'r1', userId: 'aluno' }),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
    user: {
      findUniqueOrThrow: jest.fn().mockResolvedValue({ name: 'Aluno', institutionId: 'i1' }),
      count: jest.fn().mockResolvedValue(0),
      update: jest.fn(),
    },
  };
  const notifications = { passwordChangeRequested: jest.fn(), passwordChangeDecided: jest.fn() };
  return { service: new PasswordRequestService(prisma as any, notifications as any), prisma, notifications };
}

describe('PasswordRequestService.create', () => {
  it('cria o pedido e avisa os gestores', async () => {
    const { service, prisma, notifications } = build();
    await service.create('aluno');
    expect(prisma.passwordChangeRequest.create).toHaveBeenCalledWith({ data: { userId: 'aluno' } });
    expect(notifications.passwordChangeRequested).toHaveBeenCalledWith('r1', 'Aluno', 'i1');
  });

  it('recusa um segundo pedido enquanto o primeiro está pendente', async () => {
    const { service, prisma, notifications } = build();
    prisma.passwordChangeRequest.findFirst.mockResolvedValue({ id: 'r0' });
    await expect(service.create('aluno')).rejects.toThrow(ConflictException);
    expect(prisma.passwordChangeRequest.create).not.toHaveBeenCalled();
    expect(notifications.passwordChangeRequested).not.toHaveBeenCalled();
  });
});

describe('PasswordRequestService.decide', () => {
  it('aprovar libera a troca e avisa quem pediu', async () => {
    const { service, prisma, notifications } = build();
    await service.decide('r1', 'gestor', true);
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'aluno' },
      data: { passwordChangeApproved: true },
    });
    expect(notifications.passwordChangeDecided).toHaveBeenCalledWith('aluno', true);
  });

  it('recusar não libera a troca', async () => {
    const { service, prisma, notifications } = build();
    await service.decide('r1', 'gestor', false);
    expect(prisma.user.update).not.toHaveBeenCalled();
    expect(notifications.passwordChangeDecided).toHaveBeenCalledWith('aluno', false);
  });

  it('recusa pedido inexistente', async () => {
    const { service, prisma } = build();
    prisma.passwordChangeRequest.findUnique.mockResolvedValue(null);
    await expect(service.decide('r1', 'gestor', true)).rejects.toThrow(NotFoundException);
  });

  it('recusa pedido que já foi decidido por outro gestor', async () => {
    const { service, prisma, notifications } = build();
    prisma.passwordChangeRequest.updateMany.mockResolvedValue({ count: 0 });
    await expect(service.decide('r1', 'gestor', true)).rejects.toThrow(ConflictException);
    expect(prisma.user.update).not.toHaveBeenCalled();
    expect(notifications.passwordChangeDecided).not.toHaveBeenCalled();
  });

  it('gestor não aprova o próprio pedido quando há outro gestor', async () => {
    const { service, prisma } = build();
    prisma.passwordChangeRequest.findUnique.mockResolvedValue({ id: 'r1', userId: 'gestor' });
    prisma.user.count.mockResolvedValue(1);
    await expect(service.decide('r1', 'gestor', true)).rejects.toThrow(ForbiddenException);
    expect(prisma.passwordChangeRequest.updateMany).not.toHaveBeenCalled();
  });

  it('gestor único pode aprovar o próprio pedido', async () => {
    const { service, prisma } = build();
    prisma.passwordChangeRequest.findUnique.mockResolvedValue({ id: 'r1', userId: 'gestor' });
    prisma.user.count.mockResolvedValue(0);
    await expect(service.decide('r1', 'gestor', true)).resolves.toBeUndefined();
  });
});
