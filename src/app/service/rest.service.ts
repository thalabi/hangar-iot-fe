import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DeviceNameRequest } from '../dashboard/DeviceNameRequest';
import { DeviceResponse } from '../dashboard/DeviceResponse';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class RestService {

    readonly serviceUrl: string | undefined;

    constructor(
        private http: HttpClient,
        //private configService: ConfigService,
    ) {
        //const applicationProperties = this.configService.getApplicationProperties();
        //this.serviceUrl = applicationProperties?.serviceUrl;
        console.log('environment.production', environment.production); // Logs false for default environment
        console.log('environment', environment)
        this.serviceUrl = environment.serviceUrl
    }

    // getPing() {
    //     return this.http.get(`${this.serviceUrl}/hangarIotController/ping`/*, { headers: this.jsonHeader }*/);
    // }

    getDeviceList(): Observable<Array<DeviceResponse>> {
        return this.http.get<Array<DeviceResponse>>(`${this.serviceUrl}/hangarIotController/getDeviceList`)
    }

    // getPowerState(deviceName: string): Observable<PowerStateResponse> {
    //     return this.http.get<PowerStateResponse>(`${this.serviceUrl}/hangarIotController/getPowerState?deviceName=${deviceName}`)
    // }

    togglePower(deviceNameRequest: DeviceNameRequest): Observable<void> {
        console.log('RestService.togglePower')
        return this.http.post<void>(`${this.serviceUrl}/hangarIotController/togglePower`, deviceNameRequest)
    }

    triggerPowerState(deviceNameRequest: DeviceNameRequest): Observable<void> {
        console.log('RestService.triggerPowerState')
        return this.http.post<void>(`${this.serviceUrl}/hangarIotController/triggerPowerState`, deviceNameRequest)
    }

    triggerSensorData(deviceNameRequest: DeviceNameRequest): Observable<void> {
        console.log('RestService.triggerSensorData')
        return this.http.post<void>(`${this.serviceUrl}/hangarIotController/triggerSensorData`, deviceNameRequest)
    }
    // getSensorData(deviceName: string): Observable<SensorDataResponse> {
    //     return this.http.get<SensorDataResponse>(`${this.serviceUrl}/hangarIotController/getSensorData?deviceName=${deviceName}`)
    // }

}
