import httpRequestProvider from '@/core/network/httpRequestProvider';
import type { AxiosResponse } from 'axios';
import type { ProfilePayload } from '../../domain/profilesTypes';

export class ProfilesRepository {
  private http = httpRequestProvider;

  getProfiles(): Promise<AxiosResponse<unknown>> {
    return this.http.get('/profiles');
  }

  createProfile(payload: ProfilePayload): Promise<AxiosResponse<unknown>> {
    return this.http.post('/profiles', payload);
  }

  updateProfile(
    id: string,
    payload: ProfilePayload | { isActive: boolean },
  ): Promise<AxiosResponse<unknown>> {
    return this.http.patch(`/profiles/${id}`, payload);
  }
}
