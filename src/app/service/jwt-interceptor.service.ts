import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SessionService } from './session.service';

@Injectable({
    providedIn: 'root'
})
export class JwtInterceptorService implements HttpInterceptor {

    constructor(private sessionService: SessionService) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        let token: string = ''
        this.sessionService.tokenBehaviorSubject.subscribe(message => token = message)
        let jwtReq: HttpRequest<any>
        if (token) {
            let jwtReqHeaders = req.headers.append('Authorization', `Bearer ${token}`)
            jwtReq = req.clone({
                headers: jwtReqHeaders
            })
        } else {
            jwtReq = req.clone()
        }
        return next.handle(jwtReq)
    }
}
