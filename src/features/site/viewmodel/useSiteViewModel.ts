'use client';

import { useEffect, useMemo, useState } from 'react';
import { SiteService } from '../domain/siteService';
import {
  acronymLabel,
  affiliationText,
  contactRows,
  presentationText,
  type ContactRow,
  type PublicBenefit,
  type PublicSite,
} from '../domain/siteTypes';

const LOAD_ERROR = 'No pudimos cargar la página.';

function errorMessage(error: unknown, fallback: string): string {
  const message = (error as { message?: string } | null)?.message;
  return message?.trim() || fallback;
}

export function useSiteViewModel() {
  const service = useMemo(() => new SiteService(), []);
  const [site, setSite] = useState<PublicSite | null>(null);
  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      setSite(await service.load());
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

  const benefits: PublicBenefit[] = site?.benefits ?? [];
  const contact: ContactRow[] = site ? contactRows(site) : [];

  return {
    loading: loading && site == null,
    loadError,
    loaded: site != null,
    name: site?.name ?? '',
    acronym: site ? acronymLabel(site.name, site.acronym) : '',
    presentation: site ? presentationText(site) : '',
    affiliation: site ? affiliationText(site.serviceCity) : '',
    benefits,
    contact,
  };
}
