'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useUserStore } from '@/core/store/useUserStore';
import { useSessionStore } from '@/core/store/useSessionStore';
import {
  buildFeePreview,
  SettingsService,
} from '../domain/settingsService';
import {
  emptyPaymentMethodValues,
  emptySettingsValues,
  formatPercentLabel,
  formatPesos,
  type MoneyConfirmation,
  type PaymentMethodErrors,
  type PaymentMethodRecord,
  type PaymentMethodValues,
  type ProfilePreview,
  type SettingsErrors,
  type SettingsPayload,
  type SettingsValues,
} from '../domain/settingsTypes';

const LOAD_ERROR = 'No pudimos cargar los parámetros.';
const SAVE_ERROR = 'No pudimos guardar los parámetros. Intenta de nuevo.';

function errorMessage(error: unknown, fallback: string): string {
  const message = (error as { message?: string } | null)?.message;
  return message?.trim() || fallback;
}

export function useSettingsViewModel() {
  const service = useMemo(() => new SettingsService(), []);
  const permissions = useUserStore((state) => state.user?.permissions ?? []);
  const setToast = useSessionStore((state) => state.setToast);
  const setLoading = useSessionStore((state) => state.setLoading);
  const canEdit = permissions.includes('settings.edit');

  const [values, setValues] = useState<SettingsValues>(emptySettingsValues);
  const [saved, setSaved] = useState<SettingsValues | null>(null);
  const [errors, setErrors] = useState<SettingsErrors>({});
  const [formError, setFormError] = useState('');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodRecord[]>([]);
  const [profiles, setProfiles] = useState<ProfilePreview[]>([]);
  const [loadError, setLoadError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [moneyConfirm, setMoneyConfirm] = useState<MoneyConfirmation | null>(
    null,
  );
  const [pendingPayload, setPendingPayload] = useState<SettingsPayload | null>(
    null,
  );

  const [methodOpen, setMethodOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethodRecord | null>(
    null,
  );
  const [methodValues, setMethodValues] = useState<PaymentMethodValues>(
    emptyPaymentMethodValues,
  );
  const [methodErrors, setMethodErrors] = useState<PaymentMethodErrors>({});
  const [methodError, setMethodError] = useState('');
  const [isSavingMethod, setIsSavingMethod] = useState(false);

  const applyPage = useCallback(
    (page: {
      settings: SettingsValues;
      paymentMethods: PaymentMethodRecord[];
      profiles: ProfilePreview[];
    }) => {
      setValues(page.settings);
      setSaved(page.settings);
      setPaymentMethods(page.paymentMethods);
      setProfiles(page.profiles);
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    service
      .load()
      .then((page) => {
        if (cancelled) return;
        applyPage(page);
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
  }, [applyPage, service, setLoading]);

  const patch = (partial: Partial<SettingsValues>) => {
    setValues((current) => ({ ...current, ...partial }));
  };

  const onChange =
    (field: keyof SettingsValues) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      patch({ [field]: event.target.value } as Partial<SettingsValues>);
    };

  const persist = async (payload: SettingsPayload) => {
    setIsSaving(true);
    setFormError('');
    try {
      const result = await service.save(payload);
      if (!result.ok) {
        setErrors(result.errors);
        return;
      }
      applyPage(result.page);
      setErrors({});
      setMoneyConfirm(null);
      setPendingPayload(null);
      setToast({
        show: true,
        icon: 'checkmark-circle',
        title: 'Parámetros guardados',
        description: 'Los cambios quedan para las cuotas que se generen después.',
      });
    } catch (error) {
      setFormError(errorMessage(error, SAVE_ERROR));
    } finally {
      setIsSaving(false);
    }
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canEdit || isSaving) return;
    const prepared = service.prepareSave(values, saved);
    if (!prepared.ok) {
      setErrors(prepared.errors);
      return;
    }
    setErrors({});
    if (prepared.confirmation) {
      setPendingPayload(prepared.payload);
      setMoneyConfirm(prepared.confirmation);
      return;
    }
    await persist(prepared.payload);
  };

  const confirmMoneyChange = async () => {
    if (!pendingPayload) return;
    await persist(pendingPayload);
  };

  const cancelMoneyChange = () => {
    setMoneyConfirm(null);
    setPendingPayload(null);
  };

  const openCreateMethod = () => {
    setEditingMethod(null);
    setMethodValues(service.createEmptyPaymentMethod());
    setMethodErrors({});
    setMethodError('');
    setMethodOpen(true);
  };

  const openEditMethod = (row: PaymentMethodRecord) => {
    setEditingMethod(row);
    setMethodValues({ name: row.name, sortOrder: String(row.sortOrder) });
    setMethodErrors({});
    setMethodError('');
    setMethodOpen(true);
  };

  const closeMethod = () => {
    setMethodOpen(false);
    setEditingMethod(null);
  };

  const saveMethod = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canEdit || isSavingMethod) return;
    setIsSavingMethod(true);
    setMethodError('');
    try {
      if (editingMethod) {
        const sortOrder = methodValues.sortOrder.trim()
          ? Number(methodValues.sortOrder.trim().replace(/\./g, ''))
          : editingMethod.sortOrder;
        const updated = await service.updatePaymentMethod(editingMethod.id, {
          name: methodValues.name.trim(),
          sortOrder,
        });
        setPaymentMethods((current) =>
          current
            .map((item) => (item.id === updated.id ? updated : item))
            .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name)),
        );
      } else {
        const created = await service.createPaymentMethod(methodValues);
        if (!created.ok) {
          setMethodErrors(created.errors);
          return;
        }
        setPaymentMethods((current) =>
          [...current, created.method].sort(
            (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name),
          ),
        );
      }
      setMethodOpen(false);
      setToast({
        show: true,
        icon: 'checkmark-circle',
        title: editingMethod ? 'Medio actualizado' : 'Medio creado',
        description: editingMethod
          ? 'El medio de pago quedó con los datos nuevos.'
          : 'El medio de pago ya se puede usar al cobrar.',
      });
    } catch (error) {
      setMethodError(errorMessage(error, 'No pudimos guardar el medio de pago.'));
    } finally {
      setIsSavingMethod(false);
    }
  };

  const setMethodActive = async (row: PaymentMethodRecord, isActive: boolean) => {
    if (!canEdit) return;
    try {
      const updated = await service.updatePaymentMethod(row.id, { isActive });
      setPaymentMethods((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
      setToast({
        show: true,
        icon: 'checkmark-circle',
        title: isActive ? 'Medio activado' : 'Medio inactivado',
        description: isActive
          ? 'Volverá a aparecer al registrar un pago.'
          : 'Las cuotas viejas conservan este medio; ya no sale al cobrar.',
      });
    } catch (error) {
      setFormError(errorMessage(error, 'No pudimos cambiar el estado del medio.'));
    }
  };

  const preview = buildFeePreview(values, profiles);
  const previewView = {
    wageIsZero: preview.wage <= 0,
    cutoffDay: preview.cutoffDay,
    profiles: preview.profiles.map((profile) => ({
      name: profile.name,
      percentLabel: profile.percentLabel,
      fullFeeLabel: formatPesos(profile.fullFee),
      reducedFeeLabel: formatPesos(profile.firstReducedFee),
    })),
    surchargeLabel: formatPesos(preview.surchargePerMonth),
    enrollmentLabel:
      preview.enrollmentFee > 0
        ? ` Ingreso único: ${formatPesos(preview.enrollmentFee)}.`
        : " No hay cuota de ingreso (está en 0).",
  };

  return {
    canEdit,
    values,
    errors,
    formError,
    loadError,
    isSaving,
    paymentMethods,
    moneyConfirm,
    methodOpen,
    methodValues,
    methodErrors,
    methodError,
    isSavingMethod,
    editingMethod,
    preview: previewView,
    moneyConfirmLines: moneyConfirm
      ? [
          moneyConfirm.minimumWage
            ? `SMMLV: ${formatPesos(moneyConfirm.minimumWage.from)} → ${formatPesos(moneyConfirm.minimumWage.to)}`
            : null,
          moneyConfirm.surchargePercent
            ? `Recargo: ${formatPercentLabel(moneyConfirm.surchargePercent.from)} → ${formatPercentLabel(moneyConfirm.surchargePercent.to)}`
            : null,
        ].filter((line): line is string => Boolean(line))
      : [],
    onChangeName: onChange('name'),
    onChangeAcronym: onChange('acronym'),
    onChangeServiceCity: onChange('serviceCity'),
    onChangePhone: onChange('phone'),
    onChangeContactEmail: onChange('contactEmail'),
    onChangeAddress: onChange('address'),
    onChangeOpeningHours: onChange('openingHours'),
    onChangeMinimumWage: onChange('minimumWage'),
    onChangeFirstFeeCutoffDay: onChange('firstFeeCutoffDay'),
    onChangeFirstFeePercent: onChange('firstFeePercent'),
    onChangeGraceDays: onChange('graceDays'),
    onChangeSurchargePercent: onChange('surchargePercent'),
    onChangeEnrollmentFee: onChange('enrollmentFee'),
    onChangeAllowMultiFeePayment: (allowMultiFeePayment: boolean) =>
      patch({ allowMultiFeePayment }),
    onChangeMethodName: (event: ChangeEvent<HTMLInputElement>) =>
      setMethodValues((current) => ({ ...current, name: event.target.value })),
    onChangeMethodSortOrder: (event: ChangeEvent<HTMLInputElement>) =>
      setMethodValues((current) => ({
        ...current,
        sortOrder: event.target.value,
      })),
    onSubmit,
    confirmMoneyChange,
    cancelMoneyChange,
    openCreateMethod,
    openEditMethod,
    closeMethod,
    saveMethod,
    activateMethod: (row: PaymentMethodRecord) => setMethodActive(row, true),
    inactivateMethod: (row: PaymentMethodRecord) => setMethodActive(row, false),
  };
}
