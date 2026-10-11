import httpRequestProvider from '@/core/network/httpRequestProvider';
import type { AxiosResponse } from 'axios';
import type { BenefitPayload } from '../../domain/benefitsTypes';

export class BenefitsRepository {
  private http = httpRequestProvider;

  getBenefits(): Promise<AxiosResponse<unknown>> {
    return this.http.get('/benefits');
  }

  createBenefit(payload: BenefitPayload): Promise<AxiosResponse<unknown>> {
    return this.http.post('/benefits', payload);
  }

  updateBenefit(
    id: string,
    payload: BenefitPayload | { isActive: boolean },
  ): Promise<AxiosResponse<unknown>> {
    return this.http.patch(`/benefits/${id}`, payload);
  }
}
