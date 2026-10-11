import httpRequestProvider from '@/core/network/httpRequestProvider';
import type { AxiosResponse } from 'axios';
import type { RolePayload } from '../../domain/rolesTypes';

export class RolesRepository {
  private http = httpRequestProvider;

  getRoles(): Promise<AxiosResponse<unknown>> {
    return this.http.get('/roles');
  }

  getPermissions(): Promise<AxiosResponse<unknown>> {
    return this.http.get('/permissions');
  }

  createRole(payload: RolePayload): Promise<AxiosResponse<unknown>> {
    return this.http.post('/roles', payload);
  }

  updateRole(
    id: string,
    payload: RolePayload | { isActive: boolean },
  ): Promise<AxiosResponse<unknown>> {
    return this.http.patch(`/roles/${id}`, payload);
  }
}
