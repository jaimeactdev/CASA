'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useUserStore } from '@/core/store/useUserStore';
import { selectUserPermissions } from '@/core/store/userPermissions';
import { useSessionStore } from '@/core/store/useSessionStore';
import { DeliveriesService } from '../domain/deliveriesService';
import {
  emptyDeliveryFilters,
  matchesDeliveryFilters,
  yearOptions,
  type BenefitOption,
  type DeliveryFilters,
  type DeliveryRecord,
} from '../domain/deliveriesTypes';

const LOAD_ERROR = 'No pudimos cargar las entregas.';

function errorMessage(error: unknown, fallback: string): string {
  const message = (error as { message?: string } | null)?.message;
  return message?.trim() || fallback;
}

export function useDeliveriesViewModel() {
  const service = useMemo(() => new DeliveriesService(), []);
  const permissions = useUserStore(selectUserPermissions);
  const setToast = useSessionStore((state) => state.setToast);
  const setLoading = useSessionStore((state) => state.setLoading);
  const canVoid = permissions.includes('benefits.void_delivery');

  const [deliveries, setDeliveries] = useState<DeliveryRecord[]>([]);
  const [benefits, setBenefits] = useState<BenefitOption[]>([]);
  const [today, setToday] = useState('');
  const [year, setYear] = useState('');
  const [loadError, setLoadError] = useState('');
  const [filters, setFilters] = useState<DeliveryFilters>(emptyDeliveryFilters());

  const [voidTarget, setVoidTarget] = useState<DeliveryRecord | null>(null);
  const [voidNote, setVoidNote] = useState('');
  const [voidError, setVoidError] = useState('');
  const [isVoiding, setIsVoiding] = useState(false);

  const applyPage = (page: Awaited<ReturnType<DeliveriesService['load']>>) => {
    setDeliveries(page.deliveries);
    setBenefits(page.benefits);
    setToday(page.today);
    setYear(String(page.year || ''));
    setLoadError('');
  };

  const reloadQuiet = async (nextYear?: number) => {
    try {
      applyPage(await service.load(nextYear));
    } catch (error) {
      setLoadError(
        errorMessage(
          error,
          'La anulación quedó guardada, pero no pudimos refrescar la lista.',
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

  const visibleDeliveries = useMemo(
    () => deliveries.filter((row) => matchesDeliveryFilters(row, filters)),
    [deliveries, filters],
  );

  const years = useMemo(() => {
    const current = Number(today.slice(0, 4)) || new Date().getFullYear();
    const options = yearOptions(current);
    if (year && !options.some((item) => item.value === year)) {
      options.unshift({ value: year, label: year });
    }
    return options;
  }, [today, year]);

  const benefitOptions = useMemo(
    () => [
      { value: '', label: 'Todos' },
      ...benefits.map((benefit) => ({ value: benefit.id, label: benefit.name })),
    ],
    [benefits],
  );

  const memberOptions = useMemo(() => {
    const byId = new Map<string, string>();
    for (const row of deliveries) {
      if (!byId.has(row.memberId)) {
        byId.set(row.memberId, `${row.memberNumberLabel} · ${row.memberName}`);
      }
    }
    return [
      { value: '', label: 'Todos' },
      ...[...byId.entries()]
        .map(([value, label]) => ({ value, label }))
        .sort((left, right) => left.label.localeCompare(right.label, 'es')),
    ];
  }, [deliveries]);

  const openVoid = (row: DeliveryRecord) => {
    if (!canVoid || row.isVoided) return;
    setVoidTarget(row);
    setVoidNote('');
    setVoidError('');
  };

  const closeVoid = () => {
    if (isVoiding) return;
    setVoidTarget(null);
  };

  const confirmVoid = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isVoiding || !canVoid || !voidTarget) return;
    const prepared = service.prepareVoid(voidNote);
    if (!prepared.ok) {
      setVoidError(prepared.error);
      return;
    }
    setIsVoiding(true);
    setVoidError('');
    try {
      await service.voidDelivery(voidTarget.id, prepared.payload);
      setVoidTarget(null);
      setToast({
        show: true,
        icon: 'checkmark-circle',
        title: 'Entrega anulada',
        description: 'Dejó de contar para el cupo del año y quedó en la bitácora.',
      });
      await reloadQuiet(year ? Number(year) : undefined);
    } catch (error) {
      setVoidError(errorMessage(error, 'No pudimos anular la entrega.'));
    } finally {
      setIsVoiding(false);
    }
  };

  return {
    canVoid,
    deliveries: visibleDeliveries,
    today,
    year,
    years,
    loadError,
    filters,
    benefitOptions,
    memberOptions,
    voidedOptions: [
      { value: '', label: 'Todas' },
      { value: 'no', label: 'Vigentes' },
      { value: 'yes', label: 'Anuladas' },
    ],
    voidTarget,
    voidNote,
    voidError,
    isVoiding,
    setSearch: (value: string) =>
      setFilters((current) => ({ ...current, search: value })),
    setBenefitId: (value: string | number) =>
      setFilters((current) => ({ ...current, benefitId: String(value) })),
    setMemberId: (value: string | number) =>
      setFilters((current) => ({ ...current, memberId: String(value) })),
    setVoided: (value: string | number) =>
      setFilters((current) => ({ ...current, voided: String(value) })),
    onChangeYear: (value: string | number) => {
      const next = String(value);
      setYear(next);
      void load(Number(next));
    },
    openVoid,
    closeVoid,
    confirmVoid,
    onChangeVoidNote: (event: ChangeEvent<HTMLInputElement>) =>
      setVoidNote(event.target.value),
  };
}
