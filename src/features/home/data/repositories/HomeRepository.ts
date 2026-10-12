import httpRequestProvider from '@/core/network/httpRequestProvider';
import type { AxiosResponse } from 'axios';

export class HomeRepository {
  private http = httpRequestProvider;

  getDashboard(): Promise<AxiosResponse<unknown>> {
    return this.http.get('/dashboard');
  }
}
