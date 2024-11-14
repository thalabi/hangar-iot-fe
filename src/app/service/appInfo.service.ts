import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AppInfoService {
    readonly beRestServiceUrl: string = environment.beRestServiceUrl;

    constructor(
        private http: HttpClient
    ) { }

    getBuildInfo(): Observable<string> {
        return this.http.get(this.beRestServiceUrl + '/appInfoController/getBuildInfo', { responseType: "text" });
    }
}
