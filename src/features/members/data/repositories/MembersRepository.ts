import httpRequestProvider from '@/core/network/httpRequestProvider';
import type { AxiosResponse } from 'axios';
import type {
  CreateMemberPayload,
  DeliverBenefitPayload,
  UpdateMemberPayload,
} from '../../domain/membersTypes';

export class MembersRepository {
  private http = httpRequestProvider;

  getMembers(): Promise<AxiosResponse<unknown>> {
    return this.http.get('/members');
  }

  getMember(id: string): Promise<AxiosResponse<unknown>> {
    return this.http.get(`/members/${id}`);
  }

  createMember(payload: CreateMemberPayload): Promise<AxiosResponse<unknown>> {
    return this.http.post('/members', payload);
  }

  updateMember(
    id: string,
    payload: UpdateMemberPayload,
  ): Promise<AxiosResponse<unknown>> {
    return this.http.patch(`/members/${id}`, payload);
  }

  deliverBenefit(payload: DeliverBenefitPayload): Promise<AxiosResponse<unknown>> {
    return this.http.post('/benefit-deliveries', payload);
  }
}
