'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useUserStore } from '@/core/store/useUserStore';
import { selectUserPermissions } from '@/core/store/userPermissions';
import { useSessionStore } from '@/core/store/useSessionStore';
import { FeesService } from '../domain/feesService';
import {
  emptyPayForm,
  FEE_STATUS_OPTIONS,
  matchesFeeFilters,
  monthOptions,
  previewPayment,
  sameMember,
  yearOptions,
  type FeeFilters,
  type FeeRecord,
  type PayFormErrors,
  type PayFormValues,
  type PaymentMethodOption,
} from '../domain/feesTypes';

const LOAD_ERROR = 'No pudimos cargar las cuotas.';

function errorMessage(error: unknown, fallback: string): string {
  const message = (error as { message?: string } | null)?.message;
  return message?.trim() || fallback;
}

export function useFeesViewModel() {
  const service = useMemo(() => new FeesService(), []);
  const permissions = useUserStore(selectUserPermissions);
  const setToast = useSessionStore((state) => state.setToast);
  const setLoading = useSessionStore((state) => state.setLoading);
  const canPay = permissions.includes('fees.pay');
  const canRevert = permissions.includes('fees.revert');

  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodOption[]>([]);
  const [today, setToday] = useState('');
  const [year, setYear] = useState('');
  const [allowMulti, setAllowMulti] = useState(false);
  const [surchargePercent, setSurchargePercent] = useState('0.00');
  const [minimumWage, setMinimumWage] = useState(0);
  const [loadError, setLoadError] = useState('');

  const [filters, setFilters] = useState<FeeFilters>({
    search: '',
    month: '',
    status: '',
    memberId: '',
    methodId: '',
  });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectionNotice, setSelectionNotice] = useState('');

  const [payOpen, setPayOpen] = useState(false);
  const [payingFees, setPayingFees] = useState<FeeRecord[]>([]);
  const [payValues, setPayValues] = useState<PayFormValues>(emptyPayForm());
  const [payErrors, setPayErrors] = useState<PayFormErrors>({});
  const [payError, setPayError] = useState('');
  const [isPaying, setIsPaying] = useState(false);

  const [revertFee, setRevertFee] = useState<FeeRecord | null>(null);
  const [revertNote, setRevertNote] = useState('');
  const [revertError, setRevertError] = useState('');
  const [isReverting, setIsReverting] = useState(false);

  const applyPage = (page: Awaited<ReturnType<FeesService['load']>>) => {
    setFees(page.fees);
    setPaymentMethods(page.paymentMethods);
    setToday(page.today);
    setYear(String(page.year || ''));
    setAllowMulti(page.allowMultiFeePayment);
    setSurchargePercent(page.surchargePercent);
    setMinimumWage(page.minimumWage);
    setSelectedIds([]);
    setSelectionNotice('');
    setLoadError('');
  };

  const reloadQuiet = async (nextYear?: number) => {
    try {
      applyPage(await service.load(nextYear));
    } catch (error) {
      setLoadError(
        errorMessage(
          error,
          'El cambio quedó guardado, pero no pudimos refrescar la lista.',
        ),
      );
    }
  };
  const load = async (nextYear?: number) => {
    setLoading(true);
    try {
      applyPage(await service.load(nextYear));
    } catch (error) {
      setLoadError(errorMessage(error, LOAD_ERROR));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [service]);

  const visibleFees = useMemo(
    () => fees.filter((row) => matchesFeeFilters(row, filters)),
    [fees, filters],
  );

  useEffect(() => {
    const visible = new Set(visibleFees.map((fee) => fee.id));
    setSelectedIds((current) => {
      const next = current.filter((id) => visible.has(id));
      return next.length === current.length ? current : next;
    });
  }, [visibleFees]);

  const selectedFees = useMemo(
    () => fees.filter((fee) => selectedIds.includes(fee.id) && fee.payable),
    [fees, selectedIds],
  );

  const lockedMemberId = selectedFees[0]?.memberId ?? '';

  const preview = useMemo(
    () => previewPayment(payingFees, today, surchargePercent),
    [payingFees, today, surchargePercent],
  );

  const memberOptions = useMemo(() => {
    const byId = new Map<string, string>();
    for (const fee of fees) {
      if (!byId.has(fee.memberId)) {
        byId.set(fee.memberId, `${fee.memberNumberLabel} · ${fee.memberName}`);
      }
    }
    return [
      { value: '', label: 'Todos' },
      ...[...byId.entries()]
        .map(([value, label]) => ({ value, label }))
        .sort((left, right) => left.label.localeCompare(right.label, 'es')),
    ];
  }, [fees]);

  const methodOptions = useMemo(() => {
    const byId = new Map<string, string>();
    for (const fee of fees) {
      if (fee.paymentMethodId) byId.set(fee.paymentMethodId, fee.paymentMethodName);
    }
    const options = [
      { value: '', label: 'Todos' },
      ...[...byId.entries()].map(([value, label]) => ({ value, label })),
    ];
    if (fees.some((fee) => fee.paymentMethodId === '')) {
      options.push({ value: 'none', label: 'Sin medio' });
    }
    return options;
  }, [fees]);

  const years = useMemo(() => {
    const current = Number(today.slice(0, 4)) || new Date().getFullYear();
    const options = yearOptions(current);
    if (year && !options.some((item) => item.value === year)) {
      options.unshift({ value: year, label: year });
    }
    return options;
  }, [today, year]);

  const openPay = (rows: FeeRecord[]) => {
    const payable = rows.filter((row) => row.payable);
    if (!canPay || payable.length === 0) return;
    if (!sameMember(payable)) {
      setSelectionNotice('Solo puedes marcar juntas las cuotas del mismo afiliado.');
      return;
    }
    if (!allowMulti && payable.length > 1) return;
    setPayingFees(payable);
    setPayValues(service.createEmptyPayForm(today));
    setPayErrors({});
    setPayError('');
    setPayOpen(true);
  };

  const closePay = () => {
    if (isPaying) return;
    setPayOpen(false);
    setPayingFees([]);
  };

  const toggleFee = (row: FeeRecord, checked: boolean) => {
    if (!canPay || !allowMulti || !row.payable) return;
    if (!checked) {
      setSelectedIds((current) => current.filter((id) => id !== row.id));
      setSelectionNotice('');
      return;
    }
    if (lockedMemberId && lockedMemberId !== row.memberId) {
      setSelectionNotice('Solo puedes marcar juntas las cuotas del mismo afiliado.');
      return;
    }
    setSelectionNotice('');
    setSelectedIds((current) =>
      current.includes(row.id) ? current : [...current, row.id],
    );
  };

  const confirmPay = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isPaying || !canPay) return;
    const prepared = service.preparePay(
      payValues,
      today,
      payingFees.map((fee) => fee.id),
    );
    if (!prepared.ok) {
      setPayErrors(prepared.errors);
      return;
    }
    setIsPaying(true);
    setPayError('');
    try {
      await service.pay(prepared.payload);
      setPayOpen(false);
      setPayingFees([]);
      setToast({
        show: true,
        icon: 'checkmark-circle',
        title: 'Pago registrado',
        description: 'El total quedó congelado con el recargo de ese momento.',
      });
      await reloadQuiet(year ? Number(year) : undefined);
    } catch (error) {
      setPayError(errorMessage(error, 'No pudimos registrar el pago.'));
    } finally {
      setIsPaying(false);
    }
  };

  const openRevert = (row: FeeRecord) => {
    if (!canRevert || row.status !== 'PAID') return;
    setRevertFee(row);
    setRevertNote('');
    setRevertError('');
  };

  const closeRevert = () => {
    if (isReverting) return;
    setRevertFee(null);
  };

  const confirmRevert = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isReverting || !canRevert || !revertFee) return;
    const prepared = service.prepareRevert(revertNote);
    if (!prepared.ok) {
      setRevertError(prepared.error);
      return;
    }
    setIsReverting(true);
    setRevertError('');
    try {
      await service.revert(revertFee.id, prepared.payload);
      setRevertFee(null);
      setToast({
        show: true,
        icon: 'checkmark-circle',
        title: 'Pago corregido',
        description: 'La cuota volvió a pendiente o morosa según la fecha.',
      });
      await reloadQuiet(year ? Number(year) : undefined);
    } catch (error) {
      setRevertError(errorMessage(error, 'No pudimos corregir el pago.'));
    } finally {
      setIsReverting(false);
    }
  };

  const patchPay = <K extends keyof PayFormValues>(key: K, value: PayFormValues[K]) =>
    setPayValues((current) => ({ ...current, [key]: value }));

  return {
    canPay,
    canRevert,
    fees: visibleFees,
    paymentMethods,
    today,
    year,
    years,
    allowMulti,
    minimumWage,
    loadError,
    filters,
    monthOptions: monthOptions(),
    statusOptions: [{ value: '', label: 'Todos' }, ...FEE_STATUS_OPTIONS],
    memberOptions,
    methodOptions,
    selectedIds,
    selectedCount: selectedFees.length,
    selectionNotice,
    lockedMemberId,
    payOpen,
    payingFees,
    payValues,
    payErrors,
    payError,
    isPaying,
    preview,
    revertFee,
    revertNote,
    revertError,
    isReverting,
    setSearch: (value: string) => setFilters((current) => ({ ...current, search: value })),
    setMonth: (value: string) => setFilters((current) => ({ ...current, month: value })),
    setStatus: (value: string) => setFilters((current) => ({ ...current, status: value })),
    setMemberId: (value: string) =>
      setFilters((current) => ({ ...current, memberId: value })),
    setMethodId: (value: string) =>
      setFilters((current) => ({ ...current, methodId: value })),
    onChangeYear: (value: string) => {
      setYear(value);
      void load(Number(value));
    },
    toggleFee,
    isFeeLocked: (row: FeeRecord) =>
      Boolean(lockedMemberId) && row.memberId !== lockedMemberId,
    openPaySelection: () => openPay(selectedFees),
    openPay,
    closePay,
    confirmPay,
    openRevert,
    closeRevert,
    confirmRevert,
    onChangeMethod: (value: string) => patchPay('paymentMethodId', value),
    onChangePaidOn: (event: ChangeEvent<HTMLInputElement>) =>
      patchPay('paidOn', event.target.value),
    onChangeNote: (event: ChangeEvent<HTMLInputElement>) =>
      patchPay('paymentNote', event.target.value),
    onChangeRevertNote: (event: ChangeEvent<HTMLInputElement>) =>
      setRevertNote(event.target.value),
  };
}
