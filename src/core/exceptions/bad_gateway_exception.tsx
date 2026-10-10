import BaseApiException from "./base_api_exception";

class BadGatewayException extends BaseApiException {
    constructor() {
      super('ERROR 502: El servidor de origin esta fuera de servicio o no puede ser alcanzado', 502);
    }
}

export default BadGatewayException;