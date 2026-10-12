import httpRequestProvider from '@/core/network/httpRequestProvider';
import type { AxiosResponse } from 'axios';
import type { VoidDeliveryPayload } from '../../domain/deliveriesTypes';

export class DeliveriesRepository {
  private http = httpRequestProvider;

  getDeliveries(year?: number): Promise<AxiosResponse<unknown>> {
    return this.http.get('/benefit-deliveries', year == null ? {} : { year });
  }

  voidDelivery(
    id: string,
    payload: VoidDeliveryPayload,
  ): Promise<AxiosResponse<unknown>> {
    return this.http.post(`/benefit-deliveries/${id}/void`, payload);
  }
}
