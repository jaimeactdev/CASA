import { useSessionStore } from '@/core/store/useSessionStore';
import AppException from '@/core/exceptions/app_exception';
import ArgumentNullException from '@/core/exceptions/argument_null_exception';
import InternalServerException from '@/core/exceptions/internal_server_exception';
import NotFoundException from '@/core/exceptions/not_found_exception';
import ServiceUnavailableException from '@/core/exceptions/service_unaviable_exception';
import UnauthorizedException from '@/core/exceptions/unauthorize_exception';
import BadRequestException from '@/core/exceptions/bad_request_exception';
import BadGatewayException from '@/core/exceptions/bad_gateway_exception';
import TimeoutException from '@/core/exceptions/timeout_exception';
import { ToastButton } from '@/core/types/toast';
import {
  collectApiErrorLines,
  formatApiErrorForToast,
  formatApiErrorMessage,
  type ApiErrorTable,
} from '@/shared/utils/apiErrorUtils';

export type UnifiedError = {
  message: string;
  status?: string;
  type?: string;
  /** Código de negocio del API (`ApiResponse.errorCode`), p. ej. validaciones de dominio. */
  errorCode?: string;
  errorLines?: string[];
};



type ApiRequest<T> = {
  onError?: (exception: UnifiedError) => void;
  onSuccess?: (response: T) => void;
  onStart?: () => void;
  /**
   * Se ejecuta siempre al terminar (éxito HTTP, error de negocio o excepción).
   * No cerrar aquí modales de registro/edición: si el API falla, el formulario
   * debe permanecer abierto. Cerrar solo dentro de `onSuccess` cuando `success === true`.
   */
  onComplete?: () => void;
};

class BaseController {

  showLoading() {
    useSessionStore.getState().setLoading(true);
  }

  hideLoading() {
    useSessionStore.getState().setLoading(false);
  }

  showSuccessMessage(
    title?: string,
    description?: string,
    duration?: number,
    lottieAnimation: string = '/lottie/SuccessStatus.json',
    buttons?: ToastButton[],
  ) {
    useSessionStore.getState().setToast({
      icon: 'checkmark-circle',
      lottieAnimation,
      title,
      description,
      show: true,
      duration: duration ?? 9000,
      buttons: buttons ?? [   // <-- aquí se asigna un valor
      {
        text: 'Aceptar',
        variant: 'contained',
        action: () => useSessionStore.getState().hideToast()
      }
    ]
    });
  }

  showApiError(
    source: unknown,
    fallbackTitle = 'Error',
    fallbackDescription = 'Ocurrió un error inesperado',
    duration = 6000,
    lottieAnimation = '/lottie/ErrorStatus.json',
  ) {
    const { title, description, errorLines, errorTable } = formatApiErrorForToast(
      source,
      fallbackTitle,
      fallbackDescription,
    );
    this.showErrorMessage(
      title,
      description,
      duration,
      lottieAnimation,
      undefined,
      errorLines,
      errorTable,
    );
  }

  showErrorMessage(
    title?: string,
    description?: string,
    duration?: number,
    lottieAnimation?: string,
    buttons?: ToastButton[],
    errorLines?: string[],
    errorTable?: ApiErrorTable,
  ) {
    useSessionStore.getState().setToast({
      icon: '',
      lottieAnimation,
      title,
      description,
      errorLines: errorLines?.length ? errorLines : undefined,
      errorTable,
      show: true,
      duration: duration ?? 9000,
     buttons: buttons ?? [
      {
        text: 'Aceptar',
        variant: 'contained',
        action: () => useSessionStore.getState().hideToast()
      }
    ]
      
    });
  }

  showInfoMessage(
    title?: string,
    description?: string,
    duration?: number,
    lottieAnimation: string = '/lottie/InfoStatus.json',
    buttons?: ToastButton[],
  ) {
    useSessionStore.getState().setToast({
      icon: 'info',
      lottieAnimation,
      title,
      description,
      show: true,
      duration: duration ?? 9000,
      buttons: buttons ?? [
        {
          text: 'Aceptar',
          variant: 'contained',
          action: () => useSessionStore.getState().hideToast(),
        },
      ],
    });
  }

  showWarningMessage(title?: string, description?: string, duration?: number, lottieAnimation?: string,  buttons?: ToastButton[]) {
    useSessionStore.getState().setToast({
      icon: 'git-network-sharp',
      lottieAnimation,
      title,
      description,
      show: true,
      duration: duration ?? 9000,
      buttons: buttons ?? [   // <-- aquí se asigna un valor
      {
        text: 'Aceptar',
        variant: 'contained',
        action: () => useSessionStore.getState().hideToast()
      }
    ]
    });
  }

  async apiRequest<T>(future: Promise<T>, controls: ApiRequest<T>): Promise<T | undefined> {
    const { onStart, onComplete, onSuccess, onError } = controls;

    let unifiedError: UnifiedError | undefined;

    if (onStart) onStart();
    else this.showLoading();

    try {
      const response: T = await future;
      onSuccess?.(response);
      if (onComplete) onComplete();
      else this.hideLoading();
      return response;
    } /* catch (exception) {
      _exception = exception as Error;

      
      if (
        _exception instanceof ArgumentNullException ||
        _exception instanceof AppException ||
        _exception instanceof InternalServerException ||
        _exception instanceof NotFoundException ||
        _exception instanceof BadRequestException ||
        _exception instanceof ServiceUnavailableException ||
        _exception instanceof UnauthorizedException ||
        _exception instanceof BadGatewayException ||
        _exception instanceof TimeoutException
      ) {
       

        this.showErrorMessage('Ups!', _exception.message, 6000,  '/lottie/ErrorStatus.json');
      } else {
        this.showWarningMessage('Ups!', 'Ha ocurrido un problema con la red', 6000, '/lottie/WarningStatus.json');
      }
    }*/
      catch (exception: any) {
    // Convertir cualquier error en UnifiedError
    const isValidationArray = (value: any) =>
      Array.isArray(value) &&
      value.every((it: any) => it && typeof it === 'object' && 'detalle' in it && 'error' in it);

    const formatValidationArrayLines = (arr: any[]) =>
      arr
        .map((it: any) => {
          const linea = it?.linea != null && String(it.linea).trim() !== '' ? `Línea ${String(it.linea).trim()}` : '';
          const detalle = it?.detalle != null ? String(it.detalle).trim() : '';
          const error = it?.error != null ? String(it.error).trim() : '';
          return [linea, detalle, error].filter((x) => String(x).trim() !== '').join(' - ');
        })
        .filter((x: string) => x.trim() !== '');

    const formatValidationArrayMessage = (arr: any[]) =>
      formatValidationArrayLines(arr).join('\n');

    if (isValidationArray(exception?.data)) {
      const validationLines = formatValidationArrayLines(exception.data);
      unifiedError = {
        message: formatValidationArrayMessage(exception.data) || 'Ha ocurrido un error procesando la solicitud',
        status: exception.status,
        type: exception.type,
        errorLines: validationLines.length ? validationLines : undefined,
      };
    } else
    if (exception?.response?.data && typeof exception.response.data === 'object') {
      // Caso axios
      const responseData = exception.response.data;
      const message = isValidationArray(responseData?.data)
        ? formatValidationArrayMessage(responseData.data)
        : formatApiErrorMessage(
            responseData,
            String(responseData.message ?? 'Ha ocurrido un error procesando la solicitud'),
          );
      const rawCode = responseData.errorCode ?? responseData.ErrorCode;
      const validationLines = isValidationArray(responseData?.data)
        ? formatValidationArrayLines(responseData.data)
        : [];
      const errorLines = [
        ...validationLines,
        ...collectApiErrorLines(responseData.errors),
        ...collectApiErrorLines(responseData.Errors),
      ];
      unifiedError = {
        message,
        status: responseData.status,
        type: responseData.type,
        errorCode: typeof rawCode === 'string' && rawCode.trim() ? rawCode.trim() : undefined,
        errorLines: errorLines.length ? errorLines : undefined,
      };
    } else if (exception?.data && typeof exception.data === 'object') {
    // Caso fetch o custom throw
    const responseData = exception.data;
    const message = isValidationArray(responseData?.data)
      ? formatValidationArrayMessage(responseData.data)
      : formatApiErrorMessage(
          responseData,
          String(responseData.message ?? 'Ha ocurrido un error procesando la solicitud....'),
        );
    const rawCode = responseData.errorCode ?? responseData.ErrorCode;
    const validationLines = isValidationArray(responseData?.data)
      ? formatValidationArrayLines(responseData.data)
      : [];
    const errorLines = [
      ...validationLines,
      ...collectApiErrorLines(responseData.errors),
      ...collectApiErrorLines(responseData.Errors),
    ];
    unifiedError = {
      message,
      status: responseData.status,
      type: responseData.type,
      errorCode: typeof rawCode === 'string' && rawCode.trim() ? rawCode.trim() : undefined,
      errorLines: errorLines.length ? errorLines : undefined,
    };
  } else if (
    exception instanceof ArgumentNullException ||
    exception instanceof AppException ||
    exception instanceof InternalServerException ||
    exception instanceof NotFoundException ||
    exception instanceof BadRequestException ||
    exception instanceof ServiceUnavailableException ||
    exception instanceof UnauthorizedException ||
    exception instanceof BadGatewayException ||
    exception instanceof TimeoutException
  ) {
    // Excepciones custom
    unifiedError = { message: exception.message };
  } else if (typeof exception === 'object' && 'message' in exception) {
    // Throw directo del backend: {message, status?, type?, errorCode?, errors?}
    const rawCode = (exception as any).errorCode ?? (exception as any).ErrorCode;
    const errorLines = [
      ...collectApiErrorLines((exception as any).errors),
      ...collectApiErrorLines((exception as any).Errors),
    ];
    unifiedError = {
      message: formatApiErrorMessage(
        exception,
        String(exception.message ?? 'Ha ocurrido un error procesando la solicitud'),
      ),
      status: exception.status,
      type: exception.type,
      errorCode: typeof rawCode === 'string' && rawCode.trim() ? rawCode.trim() : undefined,
      errorLines: errorLines.length ? errorLines : undefined,
    };
  } else {
    // Error genérico JS o red
    unifiedError = { message: 'Ha ocurrido un problema con la red' };
  }

  // Si es 401 (Unauthorized), no mostramos el error genérico porque httpRequestProvider ya mostró el modal de sesión expirada.
  if (unifiedError?.status == '401' || unifiedError?.status === 401 as any || exception instanceof UnauthorizedException) {
      if (onComplete) onComplete();
      else this.hideLoading();
      return undefined;
  }

  // Llamar al callback onError si existe, si no mostrar mensaje genérico
  if (onError) onError(unifiedError);
  else {
    const formatted = formatApiErrorForToast(unifiedError, 'Ups..!', unifiedError.message);
    this.showErrorMessage(
      formatted.title,
      formatted.description,
      6000,
      '/lottie/ErrorStatus.json',
      undefined,
      formatted.errorLines,
      formatted.errorTable,
    );
  }
}




    if (!onComplete) this.hideLoading();
    else onComplete();

    return undefined;
  }
}

export default BaseController;
