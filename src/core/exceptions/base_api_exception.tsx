class BaseApiException extends Error {
    status: number;
    constructor(message: string, status: number) {
      super(message);
      this.name = 'BaseApiException';
      this.status = status;
    }
}

export default BaseApiException;