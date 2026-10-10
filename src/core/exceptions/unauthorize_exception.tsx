import BaseApiException from "./base_api_exception";


class UnauthorizedException extends BaseApiException {
    constructor() {
      super('ERROR 401: No autorizado', 401);
    }
}

export default UnauthorizedException;