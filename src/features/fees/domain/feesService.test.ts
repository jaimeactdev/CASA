import { describe, expect, it } from 'vitest';
import { toFeesPage } from './feesService';
import {
  matchesFeeFilters,
  previewPayment,
  sameMember,
  toIsoDateInput,
  toPayPayload,
  validatePayForm,
  validateRevertNote,
  type FeeRecord,
} from './feesTypes';

const october: FeeRecord = {
  id: 'fee-oct',
  memberId: 'member-1',
  memberNumber: 1,
  memberNumberLabel: '0001',
  memberName: 'Ana Pérez',
  type: 'MONTHLY',
  typeLabel: 'Mensual',
  periodYear: 2026,
  periodMonth: 10,
  periodLabel: 'Octubre 2026',
  baseAmount: 17_000,
  baseAmountLabel: '',
  minimumWageUsed: 1_000_000,
  surchargeAmount: 0,
  surchargeLabel: '',
  total: 17_000,
  totalLabel: '',
  status: 'OVERDUE',
  statusLabel: 'Moroso',
  dueDate: '2026-10-31',
  dueDateLabel: '31/10/2026',
  dueLimit: '2026-11-03',
  dueLimitLabel: '03/11/2026',
  paidOn: '',
  paidOnLabel: '—',
  paymentMethodId: '',
  paymentMethodName: '—',
  payable: true,
};

describe('previewPayment', () => {
  it('breaks down the October sample paid in December as 27000', () => {
    const preview = previewPayment([october], '2026-12-01', '0.50');
    expect(preview.lines[0]).toMatchObject({
      baseAmount: 17_000,
      surchargeAmount: 10_000,
      total: 27_000,
    });
    expect(preview.total).toBe(27_000);
  });

  it('sums each fee and leaves the enrollment surcharge at zero', () => {
    const preview = previewPayment(
      [
        october,
        {
          ...october,
          id: 'fee-enroll',
          type: 'ENROLLMENT',
          periodLabel: 'Ingreso',
          periodYear: null,
          periodMonth: null,
          baseAmount: 25_000,
          minimumWageUsed: 0,
          dueLimit: '2026-10-16',
        },
      ],
      '2026-12-01',
      '0.50',
    );
    expect(preview.lines[1]?.surchargeAmount).toBe(0);
    expect(preview.total).toBe(52_000);
  });
});

describe('validatePayForm', () => {
  it('requires a method and rejects a future date', () => {
    expect(validatePayForm({ paymentMethodId: '', paidOn: '2026-12-02', paymentNote: '' }, '2026-12-01').paidOn).toMatch(
      /futura/,
    );
    expect(
      validatePayForm(
        { paymentMethodId: '', paidOn: '2026-12-01', paymentNote: '' },
        '2026-12-01',
      ).paymentMethodId,
    ).toMatch(/medio/);
  });

  it('accepts today from the date field format and sends ISO', () => {
    const values = {
      paymentMethodId: 'method-1',
      paidOn: '01/12/2026',
      paymentNote: '  efectivo  ',
    };
    expect(validatePayForm(values, '2026-12-01')).toEqual({});
    expect(toPayPayload(values, ['fee-oct'])).toEqual({
      feeIds: ['fee-oct'],
      paymentMethodId: 'method-1',
      paidOn: '2026-12-01',
      paymentNote: 'efectivo',
    });
  });
});

describe('validateRevertNote', () => {
  it('requires a note', () => {
    expect(validateRevertNote('  ')).toMatch(/obligatoria/);
    expect(validateRevertNote('Se digitó dos veces')).toBe('');
  });
});

describe('matchesFeeFilters', () => {
  it('keeps local filters and hides enrollment when a month is selected', () => {
    const filters = {
      search: 'pérez',
      month: '10',
      status: 'OVERDUE',
      memberId: 'member-1',
      methodId: 'none',
    };
    expect(matchesFeeFilters(october, filters)).toBe(true);
    expect(
      matchesFeeFilters(
        { ...october, id: 'fee-enroll', type: 'ENROLLMENT', periodMonth: null },
        filters,
      ),
    ).toBe(false);
  });
});

describe('sameMember', () => {
  it('rejects a selection that mixes affiliates', () => {
    expect(sameMember([october, { ...october, id: 'other', memberId: 'member-2' }])).toBe(
      false,
    );
    expect(sameMember([october])).toBe(true);
  });
});

describe('toFeesPage', () => {
  it('maps the API payload and ignores a broken row', () => {
    const page = toFeesPage({
      data: {
        today: '2026-12-01',
        year: 2026,
        minimumWage: 1_000_000,
        allowMultiFeePayment: false,
        surchargePercent: '0.50',
        paymentMethods: [{ id: 'method-1', name: 'Efectivo' }],
        fees: [
          {
            id: 'fee-oct',
            memberId: 'member-1',
            memberNumber: 1,
            memberName: 'Ana Pérez',
            type: 'MONTHLY',
            periodYear: 2026,
            periodMonth: 10,
            baseAmount: 17_000,
            minimumWageUsed: 1_000_000,
            surchargeAmount: 10_000,
            total: 27_000,
            status: 'OVERDUE',
            dueDate: '2026-10-31',
            dueLimit: '2026-11-03',
            paidOn: null,
            paymentMethodId: null,
            paymentMethodName: null,
          },
          { id: 'broken' },
        ],
      },
    });
    expect(page.allowMultiFeePayment).toBe(false);
    expect(page.fees).toHaveLength(1);
    expect(page.fees[0]?.periodLabel).toBe('Octubre 2026');
    expect(page.fees[0]?.totalLabel).toMatch(/27.000/);
    expect(page.paymentMethods[0]?.name).toBe('Efectivo');
  });
});

describe('toIsoDateInput', () => {
  it('keeps ISO and converts dd/MM/yyyy', () => {
    expect(toIsoDateInput('2026-12-01')).toBe('2026-12-01');
    expect(toIsoDateInput('01/12/2026')).toBe('2026-12-01');
  });
});
