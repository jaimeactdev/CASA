import { SiteRepository } from '../data/repositories/SiteRepository';
import { toPublicSite, type PublicSite } from './siteTypes';

export class SiteService {
  constructor(private readonly repo = new SiteRepository()) {}

  async load(): Promise<PublicSite> {
    return toPublicSite(await this.repo.getSite());
  }
}
