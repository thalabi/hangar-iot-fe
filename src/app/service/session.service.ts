import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CustomUserDetails } from '../login/CustomUserDetails';

@Injectable({
    providedIn: 'root'
})
export class SessionService {

    private tokenSource = new BehaviorSubject<string>('');
    private customUserDetailsSource = new BehaviorSubject<CustomUserDetails>({} as CustomUserDetails);
    private isAuthenticatedSource = new BehaviorSubject<boolean>(false);
    private isTokenExpiredSource = new BehaviorSubject<boolean>(false);
    tokenObservable = this.tokenSource.asObservable();
    customUserDetailsObservable = this.customUserDetailsSource.asObservable();
    isAuthenticatedSourceObservable = this.isAuthenticatedSource.asObservable();
    isTokenExpiredSourceObservable = this.isTokenExpiredSource.asObservable();

    constructor() { }

    setToken(token: string) {
        console.log('setToken()')
        this.tokenSource.next(token);
    }
    setCustomUserDetails(customUserDetails: CustomUserDetails) {
        console.log('setCustomUserDetails(), customUserDetails:', customUserDetails)
        this.customUserDetailsSource.next(customUserDetails);
    }
    setIsAuthenticated(isAuthenticated: boolean) {
        console.log('setIsAuthenticated()')
        this.isAuthenticatedSource.next(isAuthenticated);
    }
    setIsTokenExpired(isTokenExpired: boolean) {
        console.log('setIsTokenExpired()')
        this.isTokenExpiredSource.next(isTokenExpired);
    }
}
