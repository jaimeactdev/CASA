import httpRequestProvider from '@/core/network/httpRequestProvider';
import type { AxiosResponse } from 'axios';

export class SiteRepository {
  private http = httpRequestProvider;

  getSite(): Promise<AxiosResponse<unknown>> {
    return this.http.get('/public/site');
  }
}
