'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useUserStore } from '@/core/store/useUserStore';
import { useSessionStore } from '@/core/store/useSessionStore';
import { RolesService } from '../domain/rolesService';
import {
  emptyRoleForm,
  type PermissionRecord,
  type RoleFormErrors,
  type RoleFormValues,
  type RoleRecord,
} from '../domain/rolesTypes';

const LOAD_ERROR = 'No pudimos cargar los roles.';

function errorMessage(error: unknown, fallback: string): string {
  const message = (error as { message?: string } | null)?.message;
  return message?.trim() || fallback;
}

export function useRolesViewModel() {
  const service = useMemo(() => new RolesService(), []);
  const permissions = useUserStore((state) => state.user?.permissions ?? []);
  const setToast = useSessionStore((state) => state.setToast);
  const setLoading = useSessionStore((state) => state.setLoading);
  const canManage = permissions.includes('roles.manage');

  const [roles, setRoles] = useState<RoleRecord[]>([]);
  const [permissionsCatalog, setPermissionsCatalog] = useState<
    PermissionRecord[]
  >([]);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<RoleRecord | null>(null);
  const [values, setValues] = useState<RoleFormValues>(emptyRoleForm);
  const [errors, setErrors] = useState<RoleFormErrors>({});
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const replaceRole = (updated: RoleRecord) => {
    setRoles((current) => {
      const next = current.map((item) =>
        item.id === updated.id ? updated : item,
      );
      next.sort((left, right) => {
        if (left.isSystem !== right.isSystem) return left.isSystem ? -1 : 1;
        return left.name.localeCompare(right.name, 'es');
      });
      return next;
    });
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    service
      .load()
      .then((page) => {
        if (cancelled) return;
        setRoles(page.roles);
        setPermissionsCatalog(page.permissions);
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

  const openEdit = (row: RoleRecord) => {
    setEditing(row);
    setValues({
      name: row.name,
      description: row.description ?? '',
      permissionIds: row.permissionIds,
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
      const prepared = service.prepareSave(values);
      if (!prepared.ok) {
        setErrors(prepared.errors);
        return;
      }
      if (editing) {
        replaceRole(await service.update(editing.id, prepared.payload));
      } else {
        const created = await service.create(prepared.payload);
        setRoles((current) =>
          [...current, created].sort((left, right) => {
            if (left.isSystem !== right.isSystem) return left.isSystem ? -1 : 1;
            return left.name.localeCompare(right.name, 'es');
          }),
        );
      }
      setFormOpen(false);
      setToast({
        show: true,
        icon: 'checkmark-circle',
        title: editing ? 'Rol actualizado' : 'Rol creado',
        description: editing
          ? 'Los permisos del rol quedaron guardados.'
          : 'El rol ya se puede asignar a un usuario.',
      });
    } catch (error) {
      setFormError(errorMessage(error, 'No pudimos guardar el rol.'));
    } finally {
      setIsSaving(false);
    }
  };

  const setActive = async (row: RoleRecord, isActive: boolean) => {
    if (!canManage || row.isSystem) return;
    setActionError('');
    try {
      replaceRole(await service.update(row.id, { isActive }));
      setToast({
        show: true,
        icon: 'checkmark-circle',
        title: isActive ? 'Rol activado' : 'Rol inactivado',
        description: isActive
          ? 'Ya se puede asignar a usuarios nuevos.'
          : 'Quien ya lo tiene lo conserva. No se asigna a usuarios nuevos.',
      });
    } catch (error) {
      setActionError(
        errorMessage(error, 'No pudimos cambiar el estado del rol.'),
      );
    }
  };

  const setModulePermissions = (moduleIds: string[], next: string[]) => {
    setValues((current) => ({
      ...current,
      permissionIds: [
        ...current.permissionIds.filter((id) => !moduleIds.includes(id)),
        ...next,
      ],
    }));
  };

  return {
    canManage,
    roles,
    loadError,
    actionError,
    formOpen,
    editing,
    values,
    errors,
    formError,
    isSaving,
    nameLocked: Boolean(editing?.isSystem),
    permissionGroups: service.permissionGroups(permissionsCatalog),
    onChangeName: (event: ChangeEvent<HTMLInputElement>) =>
      setValues((current) => ({ ...current, name: event.target.value })),
    onChangeDescription: (event: ChangeEvent<HTMLInputElement>) =>
      setValues((current) => ({
        ...current,
        description: event.target.value,
      })),
    setModulePermissions,
    openCreate,
    openEdit,
    closeForm,
    saveForm,
    activateRole: (row: RoleRecord) => setActive(row, true),
    inactivateRole: (row: RoleRecord) => setActive(row, false),
  };
}
