import BaseException from "./base_exception";

class ArgumentNullException extends BaseException {
    constructor(message: string = 'Argument missing') {
        super(message, 0, message);
    }
}

export default ArgumentNullException;