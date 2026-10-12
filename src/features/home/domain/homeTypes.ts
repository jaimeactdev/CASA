const MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
] as const;

export type BenefitReminder = {
  id: string;
  name: string;
  suggestedMonth: number;
};

export type DashboardSnapshot = {
  today: string;
  year: number;
  month: number;
  minimumWage: number;
  activeMembers: number;
  activeMembersInArrears: number;
  pendingFeesThisMonth: number;
  overdueFees: number;
  reminders: BenefitReminder[];
};

export type HomeShortcut = {
  key: 'members' | 'fees' | 'deliveries';
  label: string;
  href: string;
};

export const SETTINGS_HREF = '/parametros';

const SHORTCUTS: HomeShortcut[] = [
  { key: 'members', label: 'Afiliados', href: '/afiliados' },
  { key: 'fees', label: 'Pagos', href: '/pagos' },
  { key: 'deliveries', label: 'Entregas', href: '/beneficios/entregas' },
];

const SHORTCUT_PERMISSION: Record<HomeShortcut['key'], string> = {
  members: 'members.view',
  fees: 'fees.view',
  deliveries: 'benefits.view',
};

function asRecord(payload: unknown): Record<string, unknown> {
  const body = (payload as { data?: unknown } | null)?.data ?? payload;
  if (!body || typeof body !== 'object' || Array.isArray(body)) return {};
  return body as Record<string, unknown>;
}

function text(value: unknown): string {
  if (value == null) return '';
  return String(value);
}

function count(value: unknown): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.trunc(parsed);
}

function monthNumber(value: unknown): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 12) return 0;
  return parsed;
}

export function periodLabel(year: number, month: number): string {
  const name = MONTH_NAMES[month - 1];
  if (!name || year < 1) return '';
  return `${name} ${year}`;
}

export function formatCount(value: number): string {
  return new Intl.NumberFormat('es-CO').format(value);
}

export function reminderText(name: string): string {
  const label = name.trim();
  return label ? `Este mes corresponde a ${label}.` : '';
}

export function shortcutsFor(permissions: readonly string[]): HomeShortcut[] {
  const granted = new Set(permissions);
  return SHORTCUTS.filter((item) => granted.has(SHORTCUT_PERMISSION[item.key]));
}

export function settingsHrefFor(permissions: readonly string[]): string | null {
  return permissions.includes('settings.view') ? SETTINGS_HREF : null;
}

function mapReminder(value: unknown): BenefitReminder | null {
  if (!value || typeof value !== 'object') return null;
  const row = value as Record<string, unknown>;
  const suggestedMonth = monthNumber(row.suggestedMonth);
  if (typeof row.id !== 'string' || typeof row.name !== 'string') return null;
  if (!row.name.trim() || suggestedMonth === 0) return null;
  return { id: row.id, name: row.name, suggestedMonth };
}

export function toDashboard(payload: unknown): DashboardSnapshot {
  const body = asRecord(payload);
  const reminders = Array.isArray(body.reminders)
    ? body.reminders.flatMap((item) => {
        const mapped = mapReminder(item);
        return mapped ? [mapped] : [];
      })
    : [];
  return {
    today: text(body.today),
    year: count(body.year),
    month: monthNumber(body.month),
    minimumWage: count(body.minimumWage),
    activeMembers: count(body.activeMembers),
    activeMembersInArrears: count(body.activeMembersInArrears),
    pendingFeesThisMonth: count(body.pendingFeesThisMonth),
    overdueFees: count(body.overdueFees),
    reminders,
  };
}
