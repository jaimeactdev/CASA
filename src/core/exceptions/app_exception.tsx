import BaseApiException from "./base_api_exception";

class AppException extends BaseApiException {
    constructor(message: string = 'Service Unavailable') {
        super(message || 'Error desconocido', 1000);
    }
}

export default AppException;