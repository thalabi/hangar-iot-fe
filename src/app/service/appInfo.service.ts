import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AppInfoService {
    readonly serviceUrl: string = environment.serviceUrl;

    constructor(
        private http: HttpClient
    ) { }

    getBuildInfo(): Observable<string> {
        return this.http.get(this.serviceUrl + '/appInfoController/getBuildInfo', { responseType: "text" });
    }
}
