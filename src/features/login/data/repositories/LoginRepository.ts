import httpRequestProvider from '@/core/network/httpRequestProvider';
import { AxiosResponse } from 'axios';
import type { LoginCredentials } from '../../domain/loginTypes';

export class LoginRepository {
  private _httpRequestProvider = httpRequestProvider;

  async signIn(credentials: LoginCredentials): Promise<unknown> {
    // The server sets the HttpOnly session cookie and returns only non-sensitive user data.
    return await this._httpRequestProvider.post<AxiosResponse<unknown>>(
      '/auth/login',
      credentials,
      {},
    );
  }

  async getConnectedUserInfo(): Promise<unknown> {
    return await this._httpRequestProvider.get<AxiosResponse<unknown>>(
      '/auth/me',
      {},
      {},
    );
  }

  async logout(): Promise<unknown> {
    return await this._httpRequestProvider.post<AxiosResponse<unknown>>(
      '/auth/logout',
      {},
      {},
    );
  }

  async changePassword(payload: {
    currentPassword: string;
    newPassword: string;
  }): Promise<unknown> {
    return await this._httpRequestProvider.post<AxiosResponse<unknown>>(
      '/auth/password',
      payload,
      {},
    );
  }
}
