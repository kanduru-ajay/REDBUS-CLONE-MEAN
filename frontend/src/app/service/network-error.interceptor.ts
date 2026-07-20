import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError, timer } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

@Injectable()
export class NetworkErrorInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      retry({
        count: 1,
        delay: (_error, retryCount) => timer(retryCount * 400),
        resetOnSuccess: true,
      }),
      catchError((error: HttpErrorResponse) => {
        const message = error.status === 0 ? 'Network error. Please check your connection and retry.' : error.error?.error || 'Request failed. Please retry.';
        sessionStorage.setItem('tedbus-network-error', message);
        return throwError(() => error);
      })
    );
  }
}
