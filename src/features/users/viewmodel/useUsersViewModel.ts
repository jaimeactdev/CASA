'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useUserStore } from '@/core/store/useUserStore';
import { EMPTY_PERMISSIONS } from '@/core/store/userPermissions';
import { useSessionStore } from '@/core/store/useSessionStore';
import { UsersService } from '../domain/usersService';
import {
  emptyPasswordReset,
  emptyUserForm,
  isSelfAdminLock,
  toRoleSelectOptions,
  type PasswordResetErrors,
  type PasswordResetValues,
  type RoleOption,
  type UserFormErrors,
  type UserFormValues,
  type UserRecord,
} from '../domain/usersTypes';

const LOAD_ERROR = 'No pudimos cargar los usuarios.';

function errorMessage(error: unknown, fallback: string): string {
  const message = (error as { message?: string } | null)?.message;
  return message?.trim() || fallback;
}

export function useUsersViewModel() {
  const service = useMemo(() => new UsersService(), []);
  const currentUser = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const permissions = currentUser?.permissions ?? EMPTY_PERMISSIONS;
  const setToast = useSessionStore((state) => state.setToast);
  const setLoading = useSessionStore((state) => state.setLoading);
  const canManage = permissions.includes('users.manage');
  const currentUserId = currentUser?.id ?? '';

  const [users, setUsers] = useState<UserRecord[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<UserRecord | null>(null);
  const [values, setValues] = useState<UserFormValues>(emptyUserForm);
  const [errors, setErrors] = useState<UserFormErrors>({});
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [passwordUser, setPasswordUser] = useState<UserRecord | null>(null);
  const [passwordValues, setPasswordValues] =
    useState<PasswordResetValues>(emptyPasswordReset);
  const [passwordErrors, setPasswordErrors] = useState<PasswordResetErrors>({});
  const [passwordError, setPasswordError] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const replaceUser = (updated: UserRecord) => {
    setUsers((current) =>
      current
        .map((item) => (item.id === updated.id ? updated : item))
        .sort((left, right) => left.name.localeCompare(right.name, 'es')),
    );
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    service
      .load()
      .then((page) => {
        if (cancelled) return;
        setUsers(page.users);
        setRoles(page.roles);
        setLoadError('');
      })
      .catch((error) => {
        if (!cancelled) setLoadError(errorMessage(error, LOAD_ERROR));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [service, setLoading]);

  const openCreate = () => {
    setEditing(null);
    setValues(service.createEmptyForm());
    setErrors({});
    setFormError('');
    setFormOpen(true);
  };

  const openEdit = (row: UserRecord) => {
    setEditing(row);
    setValues({
      name: row.name,
      email: row.email,
      roleId: row.roleId,
      password: '',
      confirmPassword: '',
    });
    setErrors({});
    setFormError('');
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
  };

  const saveForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canManage || isSaving) return;
    setIsSaving(true);
    setFormError('');
    try {
      if (editing) {
        const prepared = service.prepareEdit(values);
        if (!prepared.ok) {
          setErrors(prepared.errors);
          return;
        }
        replaceUser(await service.update(editing.id, prepared.payload));
      } else {
        const prepared = service.prepareCreate(values);
        if (!prepared.ok) {
          setErrors(prepared.errors);
          return;
        }
        const created = await service.create(prepared.payload);
        setUsers((current) =>
          [...current, created].sort((left, right) =>
            left.name.localeCompare(right.name, 'es'),
          ),
        );
      }
      setFormOpen(false);
      setToast({
        show: true,
        icon: 'checkmark-circle',
        title: editing ? 'Usuario actualizado' : 'Usuario creado',
        description: editing
          ? 'Los datos del usuario quedaron guardados.'
          : 'Debe cambiar la clave la primera vez que entre. No se vuelve a mostrar.',
      });
    } catch (error) {
      setFormError(errorMessage(error, 'No pudimos guardar el usuario.'));
    } finally {
      setIsSaving(false);
    }
  };

  const openResetPassword = (row: UserRecord) => {
    setPasswordUser(row);
    setPasswordValues(service.createEmptyPasswordReset());
    setPasswordErrors({});
    setPasswordError('');
  };

  const closeResetPassword = () => setPasswordUser(null);

  const savePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canManage || !passwordUser || isSavingPassword) return;
    setIsSavingPassword(true);
    setPasswordError('');
    try {
      const prepared = service.preparePasswordReset(passwordValues);
      if (!prepared.ok) {
        setPasswordErrors(prepared.errors);
        return;
      }
      const updated = await service.update(passwordUser.id, prepared.payload);
      replaceUser(updated);
      const resettingSelf = passwordUser.id === currentUserId;
      setPasswordUser(null);
      if (resettingSelf && currentUser) {
        setUser({ ...currentUser, mustChangePassword: true });
        return;
      }
      setToast({
        show: true,
        icon: 'checkmark-circle',
        title: 'Clave asignada',
        description:
          'La persona deberá cambiarla al entrar. Esta clave no se vuelve a mostrar.',
      });
    } catch (error) {
      setPasswordError(errorMessage(error, 'No pudimos asignar la clave.'));
    } finally {
      setIsSavingPassword(false);
    }
  };

  const setActive = async (row: UserRecord, isActive: boolean) => {
    if (!canManage) return;
    setActionError('');
    try {
      replaceUser(await service.update(row.id, { isActive }));
      setToast({
        show: true,
        icon: 'checkmark-circle',
        title: isActive ? 'Usuario activado' : 'Usuario inactivado',
        description: isActive
          ? 'Ya puede volver a entrar.'
          : 'No podrá entrar. El usuario no se borra.',
      });
    } catch (error) {
      setActionError(
        errorMessage(error, 'No pudimos cambiar el estado del usuario.'),
      );
    }
  };

  const onChange =
    (field: keyof UserFormValues) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setValues((current) => ({ ...current, [field]: event.target.value }));
    };

  const roleOptions = useCallback(
    () => toRoleSelectOptions(roles, editing?.roleId),
    [roles, editing?.roleId],
  );

  return {
    canManage,
    currentUserId,
    users,
    loadError,
    actionError,
    formOpen,
    editing,
    values,
    errors,
    formError,
    isSaving,
    roleLocked: editing ? isSelfAdminLock(editing, currentUserId) : false,
    roleOptions: [
      { value: '', label: 'Selecciona un rol' },
      ...roleOptions(),
    ],
    passwordUser,
    passwordValues,
    passwordErrors,
    passwordError,
    isSavingPassword,
    onChangeName: onChange('name'),
    onChangeEmail: onChange('email'),
    onChangePassword: onChange('password'),
    onChangeConfirmPassword: onChange('confirmPassword'),
    onChangeRole: (roleId: string) =>
      setValues((current) => ({ ...current, roleId })),
    onChangeResetPassword: (event: ChangeEvent<HTMLInputElement>) =>
      setPasswordValues((current) => ({
        ...current,
        password: event.target.value,
      })),
    onChangeResetConfirm: (event: ChangeEvent<HTMLInputElement>) =>
      setPasswordValues((current) => ({
        ...current,
        confirmPassword: event.target.value,
      })),
    openCreate,
    openEdit,
    closeForm,
    saveForm,
    openResetPassword,
    closeResetPassword,
    savePassword,
    activateUser: (row: UserRecord) => setActive(row, true),
    inactivateUser: (row: UserRecord) => setActive(row, false),
  };
}
