import BaseApiException from "./base_api_exception";

class ServiceUnavailableException extends BaseApiException {
  constructor(message?: string) {
    super(message || 'Error 503: Servicio no disponible', 503);
}
}

export default ServiceUnavailableException;