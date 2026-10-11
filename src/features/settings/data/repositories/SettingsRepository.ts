import httpRequestProvider from '@/core/network/httpRequestProvider';
import type { AxiosResponse } from 'axios';
import type { SettingsPayload } from '../../domain/settingsTypes';

export class SettingsRepository {
  private http = httpRequestProvider;

  getSettings(): Promise<AxiosResponse<unknown>> {
    return this.http.get('/settings');
  }

  updateSettings(payload: SettingsPayload): Promise<AxiosResponse<unknown>> {
    return this.http.patch('/settings', payload);
  }

  createPaymentMethod(payload: {
    name: string;
    sortOrder?: number;
  }): Promise<AxiosResponse<unknown>> {
    return this.http.post('/payment-methods', payload);
  }

  updatePaymentMethod(
    id: string,
    payload: { name?: string; sortOrder?: number; isActive?: boolean },
  ): Promise<AxiosResponse<unknown>> {
    return this.http.patch(`/payment-methods/${id}`, payload);
  }
}
