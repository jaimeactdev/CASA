import BaseApiException from "./base_api_exception";

class TimeoutException extends BaseApiException {
    constructor() {
      super('La solicitud hacia el servidor ha execido el tiempo de espera', 408);
    }
}

export default TimeoutException;