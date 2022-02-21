import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CustomUserDetails } from '../login/CustomUserDetails';

@Injectable({
    providedIn: 'root'
})
export class SessionService {

    public tokenBehaviorSubject = new BehaviorSubject<string>('');
    public customUserDetailsBehaviorSubject = new BehaviorSubject<CustomUserDetails>({} as CustomUserDetails);
    public isAuthenticatedBehaviorSubject = new BehaviorSubject<boolean>(false);
    public isTokenExpiredBehaviorSubject = new BehaviorSubject<boolean>(false);
    //tokenObservable = this.tokenBehaviorSubject.asObservable();
    //customUserDetailsObservable = this.customUserDetailsBehaviorSubject.asObservable();
    //isAuthenticatedSourceObservable = this.isAuthenticatedBehaviorSubject.asObservable();
    //isTokenExpiredSourceObservable = this.isTokenExpiredBehaviorSubject.asObservable();

    constructor() { }

    setToken(token: string) {
        console.log('setToken()')
        this.tokenBehaviorSubject.next(token);
    }
    setCustomUserDetails(customUserDetails: CustomUserDetails) {
        console.log('setCustomUserDetails(), customUserDetails:', customUserDetails)
        this.customUserDetailsBehaviorSubject.next(customUserDetails);
    }
    setIsAuthenticated(isAuthenticated: boolean) {
        console.log('setIsAuthenticated()')
        this.isAuthenticatedBehaviorSubject.next(isAuthenticated);
    }
    setIsTokenExpired(isTokenExpired: boolean) {
        console.log('setIsTokenExpired()')
        this.isTokenExpiredBehaviorSubject.next(isTokenExpired);
    }
}
