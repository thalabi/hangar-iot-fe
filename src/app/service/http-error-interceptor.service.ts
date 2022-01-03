import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { MessageService } from "primeng/api";
import { Observable, catchError, throwError } from "rxjs";
import { AuthenticationService } from "../security/authentication.service";
import { SessionService } from "./session.service";

@Injectable({
    providedIn: 'root'
})
export class HttpErrorInterceptorService implements HttpInterceptor {

    constructor(
        private messageService: MessageService,
        private router: Router,
        private sessionService: SessionService
    ) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        let requestUrl = new URL(request.url)
        if (requestUrl.pathname === AuthenticationService.authenticatePathname) {
            // This is a an authentication request, should let authentication service handle
            return next.handle(request)
        }
        return next.handle(request)
            .pipe(
                catchError((httpErrorResponse: HttpErrorResponse) => {
                    const message = HttpErrorInterceptorService.getErrorMessage(httpErrorResponse)
                    if (message.startsWith('Unauthorized')) {
                        // most likely token is expired
                        this.sessionService.setIsTokenExpired(true)
                        this.router.navigate(['/login']);
                    }
                    this.messageService.add({ severity: 'error', summary: message })
                    return throwError(() => new Error(message));
                })
            )
    }

    public static getErrorMessage(httpErrorResponse: HttpErrorResponse): string {
        console.error('httpErrorResponse', httpErrorResponse)
        let message: string = ''
        if (httpErrorResponse.status === 0) {
            // A client-side or network error occurred. Handle it accordingly.
            console.error('An error occurred:', httpErrorResponse.error);
            // Detect a network error from https://stackoverflow.com/questions/48311852/angular-httpclient-error-handling-difficult#:~:text=No%20response%20received,versions%20of%20TypeScript.)
            if (httpErrorResponse.error instanceof ProgressEvent && httpErrorResponse.error.type === 'error') {
                message = 'No response received. Network error.'
            } else {
                message = httpErrorResponse.message
            }
        } else {
            // The backend returned an unsuccessful response code.
            // The response body may contain clues as to what went wrong.
            console.error(`Backend returned code ${httpErrorResponse.status}, body was: `, httpErrorResponse.error);
            message = this.getHttpErrorMessage(httpErrorResponse)
        }
        return message;
    }

    static getHttpErrorMessage(error: HttpErrorResponse): string {
        switch (error.status) {
            case 401: {
                return `Unauthorized: ${error.message}`;
            }
            case 403: {
                return `Forbidden: ${error.message}`;
            }
            case 404: {
                return `Not Found: ${error.message}`;
            }
            case 500: {
                return `Internal server error: ${error.message}`;
            }
            default: {
                return `Unknown server error: ${error.message}`;
            }
        }
    }

}