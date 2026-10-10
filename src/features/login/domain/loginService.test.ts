import { describe, expect, it, vi } from 'vitest';
import { LoginService, toSessionUser } from './loginService';
import ArgumentNullException from '@/core/exceptions/argument_null_exception';

function fakeRepo(overrides: Record<string, unknown> = {}) {
  return {
    signIn: vi.fn(),
    getConnectedUserInfo: vi.fn(),
    logout: vi.fn(),
    ...overrides,
  };
}

describe('LoginService.signIn', () => {
  it('returns field errors without calling the repository', async () => {
    const repo = fakeRepo();
    const service = new LoginService(repo as never);

    const result = await service.signIn({ email: 'no-es-correo', password: '' });

    expect(result).toEqual({
      ok: false,
      errors: {
        email: 'Escribe un correo válido.',
        password: 'La clave es obligatoria.',
      },
    });
    expect(repo.signIn).not.toHaveBeenCalled();
  });

  it('normalizes the email and maps the session user', async () => {
    const repo = fakeRepo({
      signIn: vi.fn().mockResolvedValue({
        data: {
          id: 'u1',
          name: 'Ana',
          email: 'ana@casa.co',
          rol: 'Administrador',
          permissions: ['members.view'],
        },
      }),
    });
    const service = new LoginService(repo as never);

    const result = await service.signIn({
      email: '  Ana@Casa.co ',
      password: 'secreta123',
    });

    expect(repo.signIn).toHaveBeenCalledWith({
      email: 'ana@casa.co',
      password: 'secreta123',
    });
    expect(result).toEqual({
      ok: true,
      user: {
        id: 'u1',
        name: 'Ana',
        email: 'ana@casa.co',
        rol: 'Administrador',
        permissions: ['members.view'],
        mustChangePassword: false,
      },
    });
  });

  it('rejects a response without a user', async () => {
    const repo = fakeRepo({ signIn: vi.fn().mockResolvedValue({ data: {} }) });
    const service = new LoginService(repo as never);

    await expect(
      service.signIn({ email: 'ana@casa.co', password: 'secreta123' }),
    ).rejects.toBeInstanceOf(ArgumentNullException);
  });
});

describe('toSessionUser', () => {
  it('drops non-string permissions', () => {
    expect(
      toSessionUser({ email: 'a@b.co', permissions: ['fees.view', 3, null] }),
    ).toMatchObject({ permissions: ['fees.view'] });
  });
});
