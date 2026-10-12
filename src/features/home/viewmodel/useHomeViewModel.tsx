'use client';

import { useEffect, useMemo, useState } from 'react';
import { useUserStore } from '@/core/store/useUserStore';
import { selectUserPermissions } from '@/core/store/userPermissions';
import { useSessionStore } from '@/core/store/useSessionStore';
import { HomeService } from '../domain/homeService';
import {
  formatCount,
  periodLabel,
  reminderText,
  settingsHrefFor,
  shortcutsFor,
  type DashboardSnapshot,
  type HomeShortcut,
} from '../domain/homeTypes';

const LOAD_ERROR = 'No pudimos cargar el inicio.';

export type HomeCard = {
  key: string;
  label: string;
  value: string;
  hint: string;
  alert: boolean;
};

export type HomeReminder = {
  id: string;
  text: string;
};

function errorMessage(error: unknown, fallback: string): string {
  const message = (error as { message?: string } | null)?.message;
  return message?.trim() || fallback;
}

function cardsOf(snapshot: DashboardSnapshot): HomeCard[] {
  const period = periodLabel(snapshot.year, snapshot.month);
  const pendingHint = period ? `Pendiente · ${period}` : 'Del mes en curso';
  return [
    {
      key: 'active',
      label: 'Afiliados activos',
      value: formatCount(snapshot.activeMembers),
      hint: 'En estado activo',
      alert: false,
    },
    {
      key: 'arrears',
      label: 'Activos en mora',
      value: formatCount(snapshot.activeMembersInArrears),
      hint: 'Con una cuota mensual morosa',
      alert: true,
    },
    {
      key: 'pending',
      label: 'Cuotas pendientes del mes',
      value: formatCount(snapshot.pendingFeesThisMonth),
      hint: pendingHint,
      alert: false,
    },
    {
      key: 'overdue',
      label: 'Cuotas morosas',
      value: formatCount(snapshot.overdueFees),
      hint: 'Moroso · de cualquier periodo',
      alert: true,
    },
  ];
}

export function useHomeViewModel() {
  const service = useMemo(() => new HomeService(), []);
  const permissions = useUserStore(selectUserPermissions);
  const userName = useUserStore((state) => state.user?.name ?? '');
  const setLoading = useSessionStore((state) => state.setLoading);
  const [snapshot, setSnapshot] = useState<DashboardSnapshot | null>(null);
  const [loadError, setLoadError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      setSnapshot(await service.load());
      setLoadError('');
    } catch (error) {
      setLoadError(errorMessage(error, LOAD_ERROR));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [service]);

  const reminders: HomeReminder[] = (snapshot?.reminders ?? []).flatMap((item) => {
    const text = reminderText(item.name);
    return text ? [{ id: item.id, text }] : [];
  });

  const shortcuts: HomeShortcut[] = shortcutsFor(permissions);

  return {
    userName,
    loadError,
    loaded: snapshot != null,
    wageIsZero: snapshot != null && snapshot.minimumWage <= 0,
    cards: snapshot ? cardsOf(snapshot) : [],
    reminders,
    shortcuts,
    settingsHref: settingsHrefFor(permissions),
  };
}
