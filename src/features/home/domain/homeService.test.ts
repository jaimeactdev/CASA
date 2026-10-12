import { describe, expect, it } from 'vitest';
import {
  formatCount,
  periodLabel,
  reminderText,
  settingsHrefFor,
  shortcutsFor,
  toDashboard,
} from './homeTypes';

describe('toDashboard', () => {
  it('reads the axios body and the raw payload', () => {
    const snapshot = {
      today: '2026-05-10',
      year: 2026,
      month: 5,
      minimumWage: 1_000_000,
      activeMembers: 8,
      activeMembersInArrears: 2,
      pendingFeesThisMonth: 4,
      overdueFees: 9,
      reminders: [{ id: 'mother', name: 'Día de la madre', suggestedMonth: 5 }],
    };
    expect(toDashboard({ data: snapshot })).toEqual(snapshot);
    expect(toDashboard(snapshot).activeMembers).toBe(8);
  });

  it('drops incomplete reminders and uses zeros when the payload is empty', () => {
    expect(toDashboard(null)).toMatchObject({
      activeMembers: 0,
      activeMembersInArrears: 0,
      pendingFeesThisMonth: 0,
      overdueFees: 0,
      minimumWage: 0,
      reminders: [],
    });
    expect(
      toDashboard({
        reminders: [
          { id: 'trip', name: 'Paseo', suggestedMonth: null },
          { name: 'Sin id' },
          { id: 'bonus', name: 'Aguinaldo', suggestedMonth: 12 },
        ],
      }).reminders,
    ).toEqual([{ id: 'bonus', name: 'Aguinaldo', suggestedMonth: 12 }]);
  });
});

describe('reminderText', () => {
  it('names the benefit of the current month', () => {
    expect(reminderText('Día de la madre')).toBe(
      'Este mes corresponde a Día de la madre.',
    );
    expect(reminderText('Día del padre')).toBe(
      'Este mes corresponde a Día del padre.',
    );
    expect(reminderText('Aguinaldo')).toBe('Este mes corresponde a Aguinaldo.');
    expect(reminderText('  ')).toBe('');
  });
});

describe('periodLabel', () => {
  it('labels the business month in Spanish', () => {
    expect(periodLabel(2026, 5)).toBe('Mayo 2026');
    expect(periodLabel(2026, 12)).toBe('Diciembre 2026');
    expect(periodLabel(2026, 0)).toBe('');
  });
});

describe('formatCount', () => {
  it('groups thousands the Colombian way', () => {
    expect(formatCount(0)).toBe('0');
    expect(formatCount(8)).toBe('8');
    expect(formatCount(1234).replace(/\D/g, '')).toBe('1234');
    expect(formatCount(1234)).not.toBe('1234');
  });
});

describe('shortcutsFor', () => {
  it('shows members, fees and deliveries only with the view permission', () => {
    expect(
      shortcutsFor(['members.view', 'fees.view', 'benefits.view']).map(
        (item) => item.href,
      ),
    ).toEqual(['/afiliados', '/pagos', '/beneficios/entregas']);
    expect(shortcutsFor(['members.view']).map((item) => item.label)).toEqual([
      'Afiliados',
    ]);
    expect(shortcutsFor(['members.create', 'fees.pay', 'benefits.deliver'])).toEqual(
      [],
    );
    expect(shortcutsFor([])).toEqual([]);
  });
});

describe('settingsHrefFor', () => {
  it('links to parameters only with settings.view', () => {
    expect(settingsHrefFor(['settings.view'])).toBe('/parametros');
    expect(settingsHrefFor(['settings.edit'])).toBeNull();
    expect(settingsHrefFor([])).toBeNull();
  });
});
