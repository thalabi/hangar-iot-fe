import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpHandlerFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { Observable, from, switchMap } from "rxjs";
import { AuthService } from "./auth.service";

export function authHttpInterceptor(request: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {

    const auth = inject(AuthService);

    const authService = inject(AuthService);

    return from(authService.ensureValidToken()).pipe(
        switchMap(() => {
            const token = authService.getAccessToken();

            const authReq = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${token}`
                }
            });

            return next(authReq);
        })
    );
};