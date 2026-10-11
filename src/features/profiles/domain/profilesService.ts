import { ProfilesRepository } from '../data/repositories/ProfilesRepository';
import {
  emptyProfileForm,
  mapProfile,
  toProfilePayload,
  validateProfileForm,
  type BenefitOption,
  type ProfileFormErrors,
  type ProfileFormValues,
  type ProfilePayload,
  type ProfileRecord,
} from './profilesTypes';

export type ProfilesPage = {
  minimumWage: number;
  profiles: ProfileRecord[];
  benefits: BenefitOption[];
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

function toBenefitOption(row: Record<string, unknown>): BenefitOption | null {
  if (typeof row.id !== 'string' || typeof row.name !== 'string') return null;
  return { id: row.id, name: row.name, isActive: row.isActive === true };
}

function toProfile(row: Record<string, unknown>): ProfileRecord | null {
  if (typeof row.id !== 'string' || typeof row.name !== 'string') return null;
  const benefitIds = Array.isArray(row.benefitIds)
    ? row.benefitIds.filter((item): item is string => typeof item === 'string')
    : [];
  const benefitNames = Array.isArray(row.benefitNames)
    ? row.benefitNames.filter((item): item is string => typeof item === 'string')
    : [];
  return mapProfile({
    id: row.id,
    name: row.name,
    percent: text(row.percent),
    isActive: row.isActive === true,
    benefitIds,
    benefitNames,
    fullFee: Number(row.fullFee ?? 0),
  });
}

export function toProfilesPage(payload: unknown): ProfilesPage {
  const body = asRecord(payload);
  const profiles = Array.isArray(body.profiles)
    ? body.profiles.flatMap((item) => {
        if (!item || typeof item !== 'object') return [];
        const mapped = toProfile(item as Record<string, unknown>);
        return mapped ? [mapped] : [];
      })
    : [];
  const benefits = Array.isArray(body.benefits)
    ? body.benefits.flatMap((item) => {
        if (!item || typeof item !== 'object') return [];
        const mapped = toBenefitOption(item as Record<string, unknown>);
        return mapped ? [mapped] : [];
      })
    : [];
  return {
    minimumWage: Number(body.minimumWage ?? 0),
    profiles,
    benefits,
  };
}

export class ProfilesService {
  constructor(private readonly repo = new ProfilesRepository()) {}

  createEmptyForm() {
    return emptyProfileForm();
  }

  async load(): Promise<ProfilesPage> {
    return toProfilesPage(await this.repo.getProfiles());
  }

  prepareSave(
    values: ProfileFormValues,
  ): { ok: false; errors: ProfileFormErrors } | { ok: true; payload: ProfilePayload } {
    const errors = validateProfileForm(values);
    if (Object.keys(errors).length > 0) return { ok: false, errors };
    return { ok: true, payload: toProfilePayload(values) };
  }

  async create(payload: ProfilePayload): Promise<ProfileRecord> {
    const mapped = toProfile(asRecord(await this.repo.createProfile(payload)));
    if (!mapped) throw new Error('No pudimos leer el perfil creado.');
    return mapped;
  }

  async update(
    id: string,
    payload: ProfilePayload | { isActive: boolean },
  ): Promise<ProfileRecord> {
    const mapped = toProfile(asRecord(await this.repo.updateProfile(id, payload)));
    if (!mapped) throw new Error('No pudimos leer el perfil actualizado.');
    return mapped;
  }
}
