'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useUserStore } from '@/core/store/useUserStore';
import { useSessionStore } from '@/core/store/useSessionStore';
import { ProfilesService } from '../domain/profilesService';
import {
  emptyProfileForm,
  formatPesos,
  previewFullFee,
  type BenefitOption,
  type ProfileFormErrors,
  type ProfileFormValues,
  type ProfileRecord,
} from '../domain/profilesTypes';

const LOAD_ERROR = 'No pudimos cargar los perfiles.';

function errorMessage(error: unknown, fallback: string): string {
  const message = (error as { message?: string } | null)?.message;
  return message?.trim() || fallback;
}

export function useProfilesViewModel() {
  const service = useMemo(() => new ProfilesService(), []);
  const permissions = useUserStore((state) => state.user?.permissions ?? []);
  const setToast = useSessionStore((state) => state.setToast);
  const setLoading = useSessionStore((state) => state.setLoading);
  const canManage = permissions.includes('profiles.manage');

  const [profiles, setProfiles] = useState<ProfileRecord[]>([]);
  const [benefits, setBenefits] = useState<BenefitOption[]>([]);
  const [minimumWage, setMinimumWage] = useState(0);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ProfileRecord | null>(null);
  const [values, setValues] = useState<ProfileFormValues>(emptyProfileForm);
  const [errors, setErrors] = useState<ProfileFormErrors>({});
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const sortProfiles = (rows: ProfileRecord[]) =>
    [...rows].sort((left, right) => left.name.localeCompare(right.name, 'es'));

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    service
      .load()
      .then((page) => {
        if (cancelled) return;
        setProfiles(page.profiles);
        setBenefits(page.benefits);
        setMinimumWage(page.minimumWage);
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

  const openEdit = (row: ProfileRecord) => {
    setEditing(row);
    setValues({
      name: row.name,
      percent: row.percent,
      benefitIds: row.benefitIds,
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
        const updated = await service.update(editing.id, prepared.payload);
        setProfiles((current) =>
          sortProfiles(current.map((item) => (item.id === updated.id ? updated : item))),
        );
      } else {
        const created = await service.create(prepared.payload);
        setProfiles((current) => sortProfiles([...current, created]));
      }
      setFormOpen(false);
      setToast({
        show: true,
        icon: 'checkmark-circle',
        title: editing ? 'Perfil actualizado' : 'Perfil creado',
        description:
          'La cuota mostrada usa el SMMLV actual. Las cuotas ya generadas no cambian.',
      });
    } catch (error) {
      setFormError(errorMessage(error, 'No pudimos guardar el perfil.'));
    } finally {
      setIsSaving(false);
    }
  };

  const setActive = async (row: ProfileRecord, isActive: boolean) => {
    if (!canManage) return;
    setActionError('');
    try {
      const updated = await service.update(row.id, { isActive });
      setProfiles((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
      setToast({
        show: true,
        icon: 'checkmark-circle',
        title: isActive ? 'Perfil activado' : 'Perfil inactivado',
        description: isActive
          ? 'Ya se puede asignar a afiliados nuevos.'
          : 'Quien ya lo tiene lo conserva. No se asigna a afiliados nuevos.',
      });
    } catch (error) {
      setActionError(errorMessage(error, 'No pudimos cambiar el estado del perfil.'));
    }
  };

  const preview = previewFullFee(values.percent, minimumWage);

  return {
    canManage,
    profiles,
    benefits,
    minimumWage,
    loadError,
    actionError,
    formOpen,
    editing,
    values,
    errors,
    formError,
    isSaving,
    previewLabel: preview == null ? '' : formatPesos(preview),
    wageIsZero: minimumWage <= 0,
    onChangeName: (event: ChangeEvent<HTMLInputElement>) =>
      setValues((current) => ({ ...current, name: event.target.value })),
    onChangePercent: (event: ChangeEvent<HTMLInputElement>) =>
      setValues((current) => ({ ...current, percent: event.target.value })),
    onChangeBenefits: (benefitIds: string[]) =>
      setValues((current) => ({ ...current, benefitIds })),
    openCreate,
    openEdit,
    closeForm,
    saveForm,
    activateProfile: (row: ProfileRecord) => setActive(row, true),
    inactivateProfile: (row: ProfileRecord) => setActive(row, false),
  };
}
