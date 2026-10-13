import { describe, expect, it } from 'vitest';
import {
  acronymLabel,
  affiliationText,
  contactRows,
  presentationText,
  toPublicSite,
  type PublicSite,
} from './siteTypes';

const site: PublicSite = {
  name: 'Círculo de Apoyo y Servicios para Afiliados',
  acronym: 'CASA',
  serviceCity: 'Medellín',
  phone: null,
  contactEmail: 'hola@ejemplo.org',
  address: null,
  openingHours: null,
  benefits: [{ id: 'bonus', name: 'Aguinaldo', publicText: 'Aguinaldo de fin de año.' }],
};

describe('toPublicSite', () => {
  it('keeps the public fields and drops the lens aid without text', () => {
    const mapped = toPublicSite({
      data: {
        ...site,
        minimumWage: 1_000_000,
        benefits: [
          ...site.benefits,
          { id: 'lens', name: 'Auxilio por cambio de fórmula de lentes', publicText: null },
          { id: 'blank', name: 'Sin texto', publicText: '  ' },
        ],
      },
    });
    expect(mapped.benefits.map((item) => item.name)).toEqual(['Aguinaldo']);
    expect(mapped).not.toHaveProperty('minimumWage');
    expect(Object.keys(mapped)).toEqual([
      'name',
      'acronym',
      'serviceCity',
      'phone',
      'contactEmail',
      'address',
      'openingHours',
      'benefits',
    ]);
  });

  it('returns an empty site when the payload is missing', () => {
    expect(toPublicSite(null)).toMatchObject({
      name: '',
      benefits: [],
      phone: null,
    });
  });
});

describe('presentation and affiliation', () => {
  it('names the association and the service city', () => {
    expect(presentationText(site)).toBe(
      'Círculo de Apoyo y Servicios para Afiliados acompaña a sus afiliados. La atención es en Medellín, por ventanilla.',
    );
    expect(affiliationText('Medellín')).toContain('por ventanilla');
    expect(affiliationText('Medellín')).toContain('Medellín');
    expect(affiliationText('Medellín')).toContain('no hay formulario');
    expect(acronymLabel(site.name, 'CASA')).toBe('CASA');
    expect(acronymLabel('CASA', 'CASA')).toBe('');
  });
});

describe('contactRows', () => {
  it('hides the section when every contact field is empty', () => {
    expect(
      contactRows({
        ...site,
        contactEmail: null,
      }),
    ).toEqual([]);
  });

  it('lists only the fields that have a value', () => {
    expect(contactRows(site)).toEqual([
      { label: 'Correo', value: 'hola@ejemplo.org' },
    ]);
  });
});
