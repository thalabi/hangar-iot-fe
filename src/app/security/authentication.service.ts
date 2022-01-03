import { HttpClient, HttpErrorResponse, HttpHeaderResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { HttpErrorInterceptorService } from '../service/http-error-interceptor.service';
//import { ConfigService } from '../service/config.service';
import { LoginRequest } from '../login/LoginRequest';
import { LoginResponse } from '../login/LoginResponse';

@Injectable({
    providedIn: 'root'
})
export class AuthenticationService {
    readonly serviceUrl: string
    public static readonly authenticatePathname: string = '/securityController/authenticate'

    constructor(
        private http: HttpClient,
    ) {
        this.serviceUrl = environment.serviceUrl
    }

    authenticate(loginRequest: LoginRequest): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(this.serviceUrl + AuthenticationService.authenticatePathname, loginRequest)
            .pipe(
                catchError((httpErrorResponse: HttpErrorResponse) => {
                    console.error('httpErrorResponse', httpErrorResponse)
                    const message = HttpErrorInterceptorService.getErrorMessage(httpErrorResponse)
                    return throwError(() => new Error(message));
                })
            );
    }
}
