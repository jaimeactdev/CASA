import { UsersRepository } from '../data/repositories/UsersRepository';
import {
  emptyPasswordReset,
  emptyUserForm,
  mapUser,
  toCreatePayload,
  validatePasswordReset,
  validateUserForm,
  type CreateUserPayload,
  type PasswordResetErrors,
  type PasswordResetValues,
  type RoleOption,
  type UpdateUserPayload,
  type UserFormErrors,
  type UserFormValues,
  type UserRecord,
} from './usersTypes';

export type UsersPage = {
  users: UserRecord[];
  roles: RoleOption[];
};

function asRecord(payload: unknown): Record<string, unknown> {
  const body = (payload as { data?: unknown } | null)?.data ?? payload;
  if (!body || typeof body !== 'object') return {};
  return body as Record<string, unknown>;
}

function text(value: unknown): string {
  if (value == null) return '';
  return String(value);
}

function toRoleOption(row: Record<string, unknown>): RoleOption | null {
  if (typeof row.id !== 'string' || typeof row.name !== 'string') return null;
  return {
    id: row.id,
    name: row.name,
    isActive: row.isActive === true,
    isSystem: row.isSystem === true,
  };
}

function toUser(row: Record<string, unknown>): UserRecord | null {
  if (typeof row.id !== 'string' || typeof row.name !== 'string') return null;
  if (typeof row.email !== 'string' || typeof row.roleId !== 'string') return null;
  return mapUser({
    id: row.id,
    name: row.name,
    email: row.email,
    roleId: row.roleId,
    roleName: text(row.roleName),
    roleIsSystem: row.roleIsSystem === true,
    isActive: row.isActive === true,
    mustChangePassword: row.mustChangePassword === true,
  });
}

export function toUsersPage(payload: unknown): UsersPage {
  const body = asRecord(payload);
  const users = Array.isArray(body.users)
    ? body.users.flatMap((item) => {
        if (!item || typeof item !== 'object') return [];
        const mapped = toUser(item as Record<string, unknown>);
        return mapped ? [mapped] : [];
      })
    : [];
  const roles = Array.isArray(body.roles)
    ? body.roles.flatMap((item) => {
        if (!item || typeof item !== 'object') return [];
        const mapped = toRoleOption(item as Record<string, unknown>);
        return mapped ? [mapped] : [];
      })
    : [];
  return { users, roles };
}

export class UsersService {
  constructor(private readonly repo = new UsersRepository()) {}

  createEmptyForm() {
    return emptyUserForm();
  }

  createEmptyPasswordReset() {
    return emptyPasswordReset();
  }

  async load(): Promise<UsersPage> {
    return toUsersPage(await this.repo.getUsers());
  }

  prepareCreate(
    values: UserFormValues,
  ):
    | { ok: false; errors: UserFormErrors }
    | { ok: true; payload: CreateUserPayload } {
    const errors = validateUserForm(values, 'create');
    if (Object.keys(errors).length > 0) return { ok: false, errors };
    return { ok: true, payload: toCreatePayload(values) };
  }

  prepareEdit(
    values: UserFormValues,
  ):
    | { ok: false; errors: UserFormErrors }
    | { ok: true; payload: UpdateUserPayload } {
    const errors = validateUserForm(values, 'edit');
    if (Object.keys(errors).length > 0) return { ok: false, errors };
    return {
      ok: true,
      payload: {
        name: values.name.trim(),
        email: values.email.trim().toLowerCase(),
        roleId: values.roleId,
      },
    };
  }

  preparePasswordReset(
    values: PasswordResetValues,
  ):
    | { ok: false; errors: PasswordResetErrors }
    | { ok: true; payload: UpdateUserPayload } {
    const errors = validatePasswordReset(values);
    if (Object.keys(errors).length > 0) return { ok: false, errors };
    return { ok: true, payload: { password: values.password } };
  }

  async create(payload: CreateUserPayload): Promise<UserRecord> {
    const mapped = toUser(asRecord(await this.repo.createUser(payload)));
    if (!mapped) throw new Error('No pudimos leer el usuario creado.');
    return mapped;
  }

  async update(id: string, payload: UpdateUserPayload): Promise<UserRecord> {
    const mapped = toUser(asRecord(await this.repo.updateUser(id, payload)));
    if (!mapped) throw new Error('No pudimos leer el usuario actualizado.');
    return mapped;
  }
}
