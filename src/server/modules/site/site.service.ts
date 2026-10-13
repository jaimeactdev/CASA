import 'server-only';

import { HttpError } from '@/server/http/errors';
import { findPublicSettings, listPublicBenefits } from './site.repository';

export type PublicBenefitDto = {
  id: string;
  name: string;
  publicText: string;
};

export type PublicSiteDto = {
  name: string;
  acronym: string;
  serviceCity: string;
  phone: string | null;
  contactEmail: string | null;
  address: string | null;
  openingHours: string | null;
  benefits: PublicBenefitDto[];
};

function blankToNull(value: string | null | undefined): string | null {
  const text = value?.trim() ?? '';
  return text.length > 0 ? text : null;
}

/**
 * Public page payload. No session: it never includes members, documents,
 * phones of affiliates or payments.
 */
export async function getPublicSite(): Promise<PublicSiteDto> {
  const [settings, benefits] = await Promise.all([
    findPublicSettings(),
    listPublicBenefits(),
  ]);
  if (!settings) {
    throw new HttpError(500, 'No hay parámetros configurados.');
  }
  return {
    name: settings.name,
    acronym: settings.acronym,
    serviceCity: settings.serviceCity,
    phone: blankToNull(settings.phone),
    contactEmail: blankToNull(settings.contactEmail),
    address: blankToNull(settings.address),
    openingHours: blankToNull(settings.openingHours),
    benefits: benefits.flatMap((row) => {
      const publicText = blankToNull(row.publicText);
      const name = row.name.trim();
      if (!publicText || !name) return [];
      return [{ id: row.id, name, publicText }];
    }),
  };
}
