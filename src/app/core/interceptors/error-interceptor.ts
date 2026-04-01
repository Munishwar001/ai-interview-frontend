import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastrService);
  return next(req)
    .pipe(
      catchError((err: any) => {
        if (err instanceof HttpErrorResponse) {
          // Server Error
          console.log("Err server");
        } else {
          // Client Error
          console.log("Err client");
        }

        if (err && err.status !== 401) {// 401 is handled in auth.interceptor

          if (err.status === 403) {
            toastService.error("You don't have authorization to access this page.");
          }
          else if (err.status === 400 && err.error) {
            if (err.error.status) { // Custom or auto 400 from backend with error object
              if (err.error.detail) { // Show detail if present
                toastService.error(err.error.detail);

                // If multiple error messages are present
                if (err.error.errorMessages) {
                  err.error.errorMessages.forEach((msg: string) => {
                    toastService.error(msg);
                  });
                }
              }
              else { // A generic message if no detail is present
                toastService.error("An error occurred while processing your request.");
              }
            }
            else { // Custom 400 with plain string
              toastService.error(err.error);
            }
          }
          else if (err.status === 500) {
            toastService.error("Something went wrong behind the scenes!");
          }
          else if (err.status === 404) {
            toastService.error("This page is not valid!");
          }
        }
        return throwError(() => err);
      })
    )
};
