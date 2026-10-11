import httpRequestProvider from '@/core/network/httpRequestProvider';
import type { AxiosResponse } from 'axios';
import type {
  CreateUserPayload,
  UpdateUserPayload,
} from '../../domain/usersTypes';

export class UsersRepository {
  private http = httpRequestProvider;

  getUsers(): Promise<AxiosResponse<unknown>> {
    return this.http.get('/users');
  }

  createUser(payload: CreateUserPayload): Promise<AxiosResponse<unknown>> {
    return this.http.post('/users', payload);
  }

  updateUser(
    id: string,
    payload: UpdateUserPayload,
  ): Promise<AxiosResponse<unknown>> {
    return this.http.patch(`/users/${id}`, payload);
  }
}
