import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const findSettings = vi.fn();
const findBenefits = vi.fn();

vi.mock('@/server/db/prisma', () => ({
  prisma: {
    settings: { findUnique: (...args: unknown[]) => findSettings(...args) },
    benefit: { findMany: (...args: unknown[]) => findBenefits(...args) },
  },
}));

import { getPublicSite } from './site.service';

const settings = {
  name: 'Círculo de Apoyo y Servicios para Afiliados',
  acronym: 'CASA',
  serviceCity: 'Medellín',
  phone: '  ',
  contactEmail: null,
  address: 'Cra 1',
  openingHours: '',
};

describe('getPublicSite', () => {
  beforeEach(() => {
    findSettings.mockReset();
    findBenefits.mockReset();
    findSettings.mockResolvedValue(settings);
    findBenefits.mockResolvedValue([
      { id: 'bonus', name: 'Aguinaldo', publicText: 'Aguinaldo de fin de año.' },
      { id: 'mother', name: 'Día de la madre', publicText: 'Celebración del día de la madre.' },
    ]);
  });

  it('returns the public identity and only benefits with public text', async () => {
    const result = await getPublicSite();

    expect(findSettings).toHaveBeenCalledWith({
      where: { id: 1 },
      select: {
        name: true,
        acronym: true,
        serviceCity: true,
        phone: true,
        contactEmail: true,
        address: true,
        openingHours: true,
      },
    });
    expect(findBenefits).toHaveBeenCalledWith({
      where: { isActive: true, isPublic: true, publicText: { not: null } },
      select: { id: true, name: true, publicText: true },
      orderBy: { name: 'asc' },
    });
    expect(result).toEqual({
      name: settings.name,
      acronym: 'CASA',
      serviceCity: 'Medellín',
      phone: null,
      contactEmail: null,
      address: 'Cra 1',
      openingHours: null,
      benefits: [
        { id: 'bonus', name: 'Aguinaldo', publicText: 'Aguinaldo de fin de año.' },
        {
          id: 'mother',
          name: 'Día de la madre',
          publicText: 'Celebración del día de la madre.',
        },
      ],
    });
    expect(result).not.toHaveProperty('minimumWage');
    expect(result.benefits[0]).not.toHaveProperty('internalDescription');
  });

  it('drops a public benefit whose text is blank', async () => {
    findBenefits.mockResolvedValue([
      { id: 'lens', name: 'Auxilio por cambio de fórmula de lentes', publicText: '  ' },
      { id: 'trip', name: '  ', publicText: 'Paseo.' },
    ]);
    const result = await getPublicSite();
    expect(result.benefits).toEqual([]);
  });

  it('fails when settings are missing', async () => {
    findSettings.mockResolvedValue(null);
    await expect(getPublicSite()).rejects.toMatchObject({
      status: 500,
      message: 'No hay parámetros configurados.',
    });
  });
});
