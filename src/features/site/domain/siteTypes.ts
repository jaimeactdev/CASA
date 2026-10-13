export type PublicBenefit = {
  id: string;
  name: string;
  publicText: string;
};

export type PublicSite = {
  name: string;
  acronym: string;
  serviceCity: string;
  phone: string | null;
  contactEmail: string | null;
  address: string | null;
  openingHours: string | null;
  benefits: PublicBenefit[];
};

export type ContactRow = {
  label: string;
  value: string;
};

function asRecord(payload: unknown): Record<string, unknown> {
  const body = (payload as { data?: unknown } | null)?.data ?? payload;
  if (!body || typeof body !== 'object' || Array.isArray(body)) return {};
  return body as Record<string, unknown>;
}

function text(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.trim();
}

function optionalText(value: unknown): string | null {
  const trimmed = text(value);
  return trimmed.length > 0 ? trimmed : null;
}

export function acronymLabel(name: string, acronym: string): string {
  const short = acronym.trim();
  if (!short) return '';
  if (short.toLowerCase() === name.trim().toLowerCase()) return '';
  return short;
}

export function presentationText(site: Pick<PublicSite, 'name' | 'serviceCity'>): string {
  const city = site.serviceCity.trim() || 'la ciudad de servicios';
  return `${site.name.trim()} acompaña a sus afiliados. La atención es en ${city}, por ventanilla.`;
}

export function affiliationText(serviceCity: string): string {
  const city = serviceCity.trim() || 'la ciudad de servicios';
  return `Cualquier persona puede afiliarse por ventanilla. El aporte mensual depende del perfil. Los servicios se prestan en ${city}. Aquí no hay formulario de inscripción.`;
}

export function contactRows(site: PublicSite): ContactRow[] {
  const rows: ContactRow[] = [
    { label: 'Teléfono', value: site.phone ?? '' },
    { label: 'Correo', value: site.contactEmail ?? '' },
    { label: 'Dirección', value: site.address ?? '' },
    { label: 'Horario', value: site.openingHours ?? '' },
  ];
  return rows.filter((row) => row.value.trim().length > 0);
}

function mapBenefit(value: unknown): PublicBenefit | null {
  if (!value || typeof value !== 'object') return null;
  const row = value as Record<string, unknown>;
  const name = text(row.name);
  const publicText = text(row.publicText);
  if (typeof row.id !== 'string' || !name || !publicText) return null;
  return { id: row.id, name, publicText };
}

export function toPublicSite(payload: unknown): PublicSite {
  const body = asRecord(payload);
  const benefits = Array.isArray(body.benefits)
    ? body.benefits.flatMap((item) => {
        const mapped = mapBenefit(item);
        return mapped ? [mapped] : [];
      })
    : [];
  return {
    name: text(body.name),
    acronym: text(body.acronym),
    serviceCity: text(body.serviceCity),
    phone: optionalText(body.phone),
    contactEmail: optionalText(body.contactEmail),
    address: optionalText(body.address),
    openingHours: optionalText(body.openingHours),
    benefits,
  };
}
