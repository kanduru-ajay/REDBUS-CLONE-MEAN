import { ErrorHandler, Injectable } from '@angular/core';

@Injectable()
export class GlobalErrorHandlerService implements ErrorHandler {
  handleError(error: unknown): void {
    sessionStorage.setItem('tedbus-last-error', 'Something went wrong. Please try again.');
    console.error(error);
  }
}
