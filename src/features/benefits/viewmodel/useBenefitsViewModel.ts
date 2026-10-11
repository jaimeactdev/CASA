'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useUserStore } from '@/core/store/useUserStore';
import { selectUserPermissions } from '@/core/store/userPermissions';
import { useSessionStore } from '@/core/store/useSessionStore';
import { BenefitsService } from '../domain/benefitsService';
import {
  emptyBenefitForm,
  type AudienceCode,
  type BenefitFormErrors,
  type BenefitFormValues,
  type BenefitRecord,
  type BenefitTypeCode,
} from '../domain/benefitsTypes';

const LOAD_ERROR = 'No pudimos cargar los beneficios.';

function errorMessage(error: unknown, fallback: string): string {
  const message = (error as { message?: string } | null)?.message;
  return message?.trim() || fallback;
}

export function useBenefitsViewModel() {
  const service = useMemo(() => new BenefitsService(), []);
  const permissions = useUserStore(selectUserPermissions);
  const setToast = useSessionStore((state) => state.setToast);
  const setLoading = useSessionStore((state) => state.setLoading);
  const canManage = permissions.includes('benefits.manage');

  const [benefits, setBenefits] = useState<BenefitRecord[]>([]);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<BenefitRecord | null>(null);
  const [values, setValues] = useState<BenefitFormValues>(emptyBenefitForm);
  const [errors, setErrors] = useState<BenefitFormErrors>({});
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const sortBenefits = (rows: BenefitRecord[]) =>
    [...rows].sort((left, right) => left.name.localeCompare(right.name, 'es'));

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    service
      .load()
      .then((rows) => {
        if (cancelled) return;
        setBenefits(rows);
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

  const openEdit = (row: BenefitRecord) => {
    setEditing(row);
    setValues({
      name: row.name,
      internalDescription: row.internalDescription,
      publicText: row.publicText ?? '',
      isPublic: row.isPublic,
      type: row.type,
      audience: row.audience,
      minPaidFeesInYear: String(row.minPaidFeesInYear),
      maxDeliveriesPerYear: String(row.maxDeliveriesPerYear),
      suggestedMonth: row.suggestedMonth == null ? '' : String(row.suggestedMonth),
      requiresMinimumSetup: row.requiresMinimumSetup,
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
        setBenefits((current) =>
          sortBenefits(current.map((item) => (item.id === updated.id ? updated : item))),
        );
      } else {
        const created = await service.create(prepared.payload);
        setBenefits((current) => sortBenefits([...current, created]));
      }
      setFormOpen(false);
      setToast({
        show: true,
        icon: 'checkmark-circle',
        title: editing ? 'Beneficio actualizado' : 'Beneficio creado',
        description: 'El catálogo quedó guardado. La entrega se registra en otro módulo.',
      });
    } catch (error) {
      setFormError(errorMessage(error, 'No pudimos guardar el beneficio.'));
    } finally {
      setIsSaving(false);
    }
  };

  const setActive = async (row: BenefitRecord, isActive: boolean) => {
    if (!canManage) return;
    setActionError('');
    try {
      const updated = await service.update(row.id, { isActive });
      setBenefits((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
      setToast({
        show: true,
        icon: 'checkmark-circle',
        title: isActive ? 'Beneficio activado' : 'Beneficio inactivado',
        description: isActive
          ? 'Puede volver a mostrarse en la página pública si está marcado.'
          : 'Deja de mostrarse en la página pública. No se borra.',
      });
    } catch (error) {
      setActionError(errorMessage(error, 'No pudimos cambiar el estado del beneficio.'));
    }
  };

  const patch = (partial: Partial<BenefitFormValues>) => {
    setValues((current) => ({ ...current, ...partial }));
  };

  return {
    canManage,
    benefits,
    loadError,
    actionError,
    formOpen,
    editing,
    values,
    errors,
    formError,
    isSaving,
    annualLocked: values.type === 'ANNUAL',
    onChangeName: (event: ChangeEvent<HTMLInputElement>) =>
      patch({ name: event.target.value }),
    onChangeDescription: (event: ChangeEvent<HTMLInputElement>) =>
      patch({ internalDescription: event.target.value }),
    onChangePublicText: (event: ChangeEvent<HTMLInputElement>) =>
      patch({ publicText: event.target.value }),
    onChangeMin: (event: ChangeEvent<HTMLInputElement>) =>
      patch({ minPaidFeesInYear: event.target.value }),
    onChangeMax: (event: ChangeEvent<HTMLInputElement>) =>
      patch({ maxDeliveriesPerYear: event.target.value }),
    onChangePublic: (isPublic: boolean) => patch({ isPublic }),
    onChangeRequiresMinimum: (requiresMinimumSetup: boolean) =>
      patch({ requiresMinimumSetup }),
    onChangeType: (type: BenefitTypeCode) =>
      patch({
        type,
        maxDeliveriesPerYear: type === 'ANNUAL' ? '1' : values.maxDeliveriesPerYear,
      }),
    onChangeAudience: (audience: AudienceCode) => patch({ audience }),
    onChangeMonth: (suggestedMonth: string) => patch({ suggestedMonth }),
    openCreate,
    openEdit,
    closeForm,
    saveForm,
    activateBenefit: (row: BenefitRecord) => setActive(row, true),
    inactivateBenefit: (row: BenefitRecord) => setActive(row, false),
  };
}
