import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DeviceNameRequest } from '../dashboard/DeviceNameRequest';
import { DeviceResponse } from '../dashboard/DeviceResponse';
import { environment } from '../../environments/environment';
import { CommandResponse } from '../execute-command/CommandResponse';
import { FreeFormatCommandRequest } from '../execute-command/FreeFormatCommandRequest';
import { TimersRequestResponse } from '../timers/TimersRequestResponse';
import { TogglePowerRequest } from '../dashboard/TogglePowerRequest';

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

    getDeviceList(): Observable<Array<DeviceResponse>> {
        return this.http.get<Array<DeviceResponse>>(`${this.serviceUrl}/hangarIotController/getDeviceList`)
    }

    togglePower(deviceNameRequest: TogglePowerRequest): Observable<void> {
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

    getCommandList(): Observable<Array<CommandResponse>> {
        return this.http.get<Array<CommandResponse>>(`${this.serviceUrl}/hangarIotController/getCommandList`)
    }

    executeFreeFormatCommand(freeFormatCommandRequest: FreeFormatCommandRequest): Observable<string> {
        console.log('RestService.triggerSensorData')
        return this.http.post<string>(`${this.serviceUrl}/hangarIotController/executeFreeFormatCommand`, freeFormatCommandRequest)
    }

    getTimers(deviceName: string): Observable<TimersRequestResponse> {
        return this.http.get<TimersRequestResponse>(`${this.serviceUrl}/hangarIotController/getTimers?deviceName=${deviceName}`)
    }

    setTimers(timersRequestResponse: TimersRequestResponse): Observable<void> {
        return this.http.post<void>(`${this.serviceUrl}/hangarIotController/setTimers`, timersRequestResponse)
    }
}
