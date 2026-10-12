import httpRequestProvider from '@/core/network/httpRequestProvider';
import type { AxiosResponse } from 'axios';
import type { PayFeesPayload, RevertFeePayload } from '../../domain/feesTypes';

export class FeesRepository {
  private http = httpRequestProvider;

  getFees(year?: number): Promise<AxiosResponse<unknown>> {
    return this.http.get('/fees', year == null ? {} : { year });
  }

  payFees(payload: PayFeesPayload): Promise<AxiosResponse<unknown>> {
    return this.http.post('/fees/pay', payload);
  }

  revertFee(
    id: string,
    payload: RevertFeePayload,
  ): Promise<AxiosResponse<unknown>> {
    return this.http.post(`/fees/${id}/revert`, payload);
  }
}
