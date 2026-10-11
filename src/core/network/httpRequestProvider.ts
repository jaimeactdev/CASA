import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import ENV from '@/environments/environment';
import AppException from '../exceptions/app_exception';
import NotFoundException from '../exceptions/not_found_exception';
import InternalServerException from '../exceptions/internal_server_exception';
import ServiceUnavailableException from '../exceptions/service_unaviable_exception';
import NetworkException from '../exceptions/network_exception';
import UnauthorizedException from '../exceptions/unauthorize_exception';
import BadRequestException from '../exceptions/bad_request_exception';
import BadGatewayException from '../exceptions/bad_gateway_exception';
import TimeoutException from '../exceptions/timeout_exception';
import { useSessionStore } from '@/core/store/useSessionStore';
import { useUserStore } from '@/core/store/useUserStore';

function showSessionExpiredToast() {
  useSessionStore.getState().setToast({
    show: true,
    title: 'Sesión Finalizada',
    description: 'Por seguridad debes iniciar sesión nuevamente.',
    icon: 'alert-circle',
    duration: 9999999,
    buttons: [{
      text: 'Iniciar Sesión',
      action: () => {
        useUserStore.getState().clearUser();
        window.location.reload();
      },
    }],
  });
}

class HttpRequestProvider {
  axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: ENV.BACKEND.URL_BASE,
      headers: {
        'Content-Type': 'application/json',
      },
      // The session rides in an HttpOnly cookie; the browser attaches it automatically.
      withCredentials: true,
    });
    this.setupInterceptors();
  }

  setBaseUrl(url?: string) {
    if (url) {
      this.axiosInstance.defaults.baseURL = url;
    }
  }

  setupInterceptors() {
    this.axiosInstance.interceptors.response.use(
      (response: any) => response,
      (error: any) => {
        this.handleExceptions(error);
        return Promise.reject(error);
      },
    );
  }

  handleExceptions(error: AxiosError) {
    if (axios.isAxiosError(error) && error.response) {
      const data: { status?: string; type?: string; message?: string } = error.response.data ?? {};

      switch (error.response.status) {
        case 400:
          throw { ...data, message: data.message ?? 'Solicitud incorrecta' };
        case 401: {
          const requestUrl = String(error.config?.url ?? '');
          if (!requestUrl.includes('/auth/me')) {
            showSessionExpiredToast();
          }
          throw { ...data, message: data.message ?? 'No autorizado' };
        }
        case 403:
          throw {
            ...data,
            status: 403,
            message: data.message ?? 'No tiene permisos para realizar esta operación.',
          };
        case 404:
          throw { ...data, message: data.message ?? 'Error 404: Recurso no encontrado' };
        case 409:
          throw {
            ...data,
            status: 409,
            message: data.message ?? 'La operación entra en conflicto con un dato existente.',
          };
        case 500:
          throw { ...data, message: data.message ?? 'Ha ocurrido un error procesando la solicitud...' };
        case 502:
          throw { ...data, message: data.message ?? 'Bad gateway' };
        case 503:
          throw { ...data, message: data.message ?? 'Servicio no disponible' };
        default:
          throw { ...data, message: data.message ?? 'Error desconocido' };
      }
    }

    if (error.code === 'ECONNABORTED') {
      throw new TimeoutException();
    }
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      throw new NetworkException('Tuvimos un problema al conectarnos con el servidor. Intenta nuevamente o revisa tu conexión de red.');
    }
    if (axios.isAxiosError(error)) {
      switch (error.response?.status) {
        case 400:
          throw new BadRequestException();
        case 401:
          showSessionExpiredToast();
          throw new UnauthorizedException();
        case 404:
          throw new NotFoundException();
        case 500:
          throw new InternalServerException('Ha ocurrido un error procesando la solicitud.');
        case 502:
          throw new BadGatewayException();
        case 503:
          throw new ServiceUnavailableException('Servicio no disponible');
        default:
          throw new AppException('An unknown error occurred.');
      }
    }
    throw new NetworkException('Error de red. No se pudo conectar al servidor...');
  }

  async get<T = any>(url: string, params = {}, config: AxiosRequestConfig = {}): Promise<T> {
    return this.axiosInstance.get(url, {
      ...config,
      params,
      headers: { Accept: 'application/json', ...(config.headers || {}) },
    }) as Promise<T>;
  }

  async post<T = any>(url: string, data: any, config: AxiosRequestConfig = {}): Promise<T> {
    return this.axiosInstance.post(url, data, {
      ...config,
      headers: { Accept: 'application/json', ...(config.headers || {}) },
    }) as Promise<T>;
  }

  async put<T = any>(url: string, data: any, config: AxiosRequestConfig = {}): Promise<T> {
    return this.axiosInstance.put(url, data, {
      ...config,
      headers: { Accept: 'application/json', ...(config.headers || {}) },
    }) as Promise<T>;
  }

  async patch<T = any>(url: string, data: any, config: AxiosRequestConfig = {}): Promise<T> {
    return this.axiosInstance.patch(url, data, {
      ...config,
      headers: { Accept: 'application/json', ...(config.headers || {}) },
    }) as Promise<T>;
  }

  async delete<T = any>(url: string, config: AxiosRequestConfig = {}): Promise<T> {
    return this.axiosInstance.delete(url, {
      ...config,
      headers: { Accept: 'application/json', ...(config.headers || {}) },
    }) as Promise<T>;
  }
}

const httpRequestProvider = new HttpRequestProvider();
export default httpRequestProvider;
