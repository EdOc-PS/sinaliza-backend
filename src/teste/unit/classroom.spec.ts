import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ClassroomService } from '@modules/classrooms/classroom.service';

const classroom = (extra: Record<string, unknown> = {}) => ({
  id: 'c1',
  name: 'Informática',
  isContext: false,
  isActive: true,
  teacher: { id: 'dono', name: 'Dono' },
  _count: { enrollments: 2 },
  ...extra,
});

function build() {
  const repository = {
    findById: jest.fn().mockResolvedValue(classroom()),
    findEnrollment: jest.fn().mockResolvedValue(null),
    setAdmin: jest.fn(),
    update: jest.fn().mockResolvedValue({}),
    delete: jest.fn().mockResolvedValue({}),
    unenroll: jest.fn(),
    findOldestEducator: jest.fn(),
    transferOwnership: jest.fn(),
  };
  const notifications = { promotedToClassroomAdmin: jest.fn(), addedToClassroom: jest.fn() };
  const service = new ClassroomService(repository as any, {} as any, notifications as any);

  // Matrículas por usuário: quem não está no mapa não está na turma
  const enroll = (map: Record<string, { roleInClass: string; isAdmin?: boolean }>) =>
    repository.findEnrollment.mockImplementation(async (userId: string) => map[userId] ?? null);

  return { service, repository, notifications, enroll };
}

describe('Contagem de membros', () => {
  it('conta o dono além dos matriculados', async () => {
    const { service } = build();
    await expect(service.findById('c1')).resolves.toMatchObject({ userCount: 3 });
  });
});

describe('ClassroomService.setMemberAdmin', () => {
  it('dono promove um educador e ele é notificado', async () => {
    const { service, repository, notifications, enroll } = build();
    enroll({ prof: { roleInClass: 'EDUCATOR', isAdmin: false } });
    await service.setMemberAdmin('c1', 'dono', 'prof', true);
    expect(repository.setAdmin).toHaveBeenCalledWith('prof', 'c1', true);
    expect(notifications.promotedToClassroomAdmin).toHaveBeenCalledWith('prof', 'c1', 'Informática');
  });

  it('administrador também promove', async () => {
    const { service, repository, enroll } = build();
    enroll({ admin: { roleInClass: 'EDUCATOR', isAdmin: true }, prof: { roleInClass: 'EDUCATOR' } });
    await service.setMemberAdmin('c1', 'admin', 'prof', true);
    expect(repository.setAdmin).toHaveBeenCalled();
  });

  it('educador comum não promove ninguém', async () => {
    const { service, repository, enroll } = build();
    enroll({ comum: { roleInClass: 'EDUCATOR', isAdmin: false }, prof: { roleInClass: 'EDUCATOR' } });
    await expect(service.setMemberAdmin('c1', 'comum', 'prof', true)).rejects.toThrow(ForbiddenException);
    expect(repository.setAdmin).not.toHaveBeenCalled();
  });

  it('aluno não pode ser administrador', async () => {
    const { service, repository, enroll } = build();
    enroll({ aluno: { roleInClass: 'STUDENT' } });
    await expect(service.setMemberAdmin('c1', 'dono', 'aluno', true)).rejects.toThrow(BadRequestException);
    expect(repository.setAdmin).not.toHaveBeenCalled();
  });

  it('recusa quem não participa da turma', async () => {
    const { service } = build();
    await expect(service.setMemberAdmin('c1', 'dono', 'fora', true)).rejects.toThrow(NotFoundException);
  });

  it('rebaixar não gera notificação', async () => {
    const { service, repository, notifications, enroll } = build();
    enroll({ prof: { roleInClass: 'EDUCATOR', isAdmin: true } });
    await service.setMemberAdmin('c1', 'dono', 'prof', false);
    expect(repository.setAdmin).toHaveBeenCalledWith('prof', 'c1', false);
    expect(notifications.promotedToClassroomAdmin).not.toHaveBeenCalled();
  });

  it('promover quem já é administrador não notifica de novo', async () => {
    const { service, notifications, enroll } = build();
    enroll({ prof: { roleInClass: 'EDUCATOR', isAdmin: true } });
    await service.setMemberAdmin('c1', 'dono', 'prof', true);
    expect(notifications.promotedToClassroomAdmin).not.toHaveBeenCalled();
  });
});

describe('Permissões de quem gerencia a turma', () => {
  it('administrador edita a turma', async () => {
    const { service, repository, enroll } = build();
    enroll({ admin: { roleInClass: 'EDUCATOR', isAdmin: true } });
    await service.update('c1', 'admin', { name: 'Novo nome' } as any);
    expect(repository.update).toHaveBeenCalledWith('c1', { name: 'Novo nome' });
  });

  it('educador comum não edita nem exclui', async () => {
    const { service, repository, enroll } = build();
    enroll({ comum: { roleInClass: 'EDUCATOR', isAdmin: false } });
    await expect(service.update('c1', 'comum', {} as any)).rejects.toThrow(ForbiddenException);
    await expect(service.delete('c1', 'comum')).rejects.toThrow(ForbiddenException);
    expect(repository.update).not.toHaveBeenCalled();
    expect(repository.delete).not.toHaveBeenCalled();
  });

  it('a turma Contexto não pode ser editada nem excluída, nem pelo dono', async () => {
    const { service, repository } = build();
    repository.findById.mockResolvedValue(classroom({ isContext: true }));
    await expect(service.update('c1', 'dono', {} as any)).rejects.toThrow(/Contexto/);
    await expect(service.delete('c1', 'dono')).rejects.toThrow(/Contexto/);
  });

  it('ninguém remove o dono da turma', async () => {
    const { service, repository, enroll } = build();
    enroll({ admin: { roleInClass: 'EDUCATOR', isAdmin: true } });
    await expect(service.removeMember('c1', 'admin', 'dono')).rejects.toThrow(ForbiddenException);
    expect(repository.unenroll).not.toHaveBeenCalled();
  });
});

describe('ClassroomService.leave', () => {
  it('dono não sai se for o único educador', async () => {
    const { service, repository } = build();
    repository.findOldestEducator.mockResolvedValue(null);
    await expect(service.leave('dono', 'c1')).rejects.toThrow(ForbiddenException);
  });

  it('dono que sai passa a turma ao educador mais antigo', async () => {
    const { service, repository } = build();
    const heir = { userId: 'prof' };
    repository.findOldestEducator.mockResolvedValue(heir);
    await service.leave('dono', 'c1');
    expect(repository.transferOwnership).toHaveBeenCalledWith('c1', heir);
  });

  it('quem não está matriculado não tem como sair', async () => {
    const { service } = build();
    await expect(service.leave('fora', 'c1')).rejects.toThrow(NotFoundException);
  });
});

describe('ClassroomService.addMember', () => {
  it('recusa adicionar quem já participa', async () => {
    const { service, repository, enroll } = build();
    (repository as any).findUserByEmail = jest.fn().mockResolvedValue({ id: 'aluno', roles: ['STUDENT'] });
    enroll({ aluno: { roleInClass: 'STUDENT' } });
    await expect(service.addMember('c1', 'dono', 'aluno@teste.com')).rejects.toThrow(ConflictException);
  });
});
