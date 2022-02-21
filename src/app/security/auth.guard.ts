import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { SessionService } from '../service/session.service';


@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {

    constructor(
        private sessionService: SessionService,
        private router: Router
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        console.log('AuthGuard.canActivate()')
        return this.sessionService.isAuthenticatedBehaviorSubject
            .pipe(
                map((response: boolean) => {
                    const isAuthenticated = response
                    if (isAuthenticated) {
                        return true
                    }
                    this.router.navigate(['/login'])
                    return false
                }),
                catchError((error) => {
                    this.router.navigate(['/login'])
                    return of(false)
                })
            )
    }

}
