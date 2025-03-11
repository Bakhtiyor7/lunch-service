export class ServiceException extends Error {
  readonly errorCode: number;

  constructor(errorCode: number, message?: string) {
    super(message);

    this.errorCode = errorCode;
  }
}
