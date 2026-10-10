import BaseException from "./base_exception";

class NetworkException extends BaseException {
    constructor(message: string = "Service Unavailable") {
        super(message, 99, message);
    }
}

export default NetworkException;