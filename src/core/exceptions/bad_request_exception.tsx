import BaseApiException from "./base_api_exception";

class BadRequestException extends BaseApiException {
    constructor() {
      super('ERROR 400: Error en la respuesta del servidor', 400);
    }
}

export default BadRequestException;