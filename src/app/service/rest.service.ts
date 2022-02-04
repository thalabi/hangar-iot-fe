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
import { TimersRequestResponse2 } from '../timers/TimersRequestResponse2';

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

    triggerPublishConnectionState(deviceNameRequest: DeviceNameRequest): Observable<void> {
        console.log('RestService.triggerPublishConnectionState')
        return this.http.post<void>(`${this.serviceUrl}/hangarIotController/triggerPublishConnectionState`, deviceNameRequest)
    }

    triggerPublishPowerState(deviceNameRequest: DeviceNameRequest): Observable<void> {
        console.log('RestService.triggerPublishPowerState')
        return this.http.post<void>(`${this.serviceUrl}/hangarIotController/triggerPublishPowerState`, deviceNameRequest)
    }

    triggerPublishSensorData(deviceNameRequest: DeviceNameRequest): Observable<void> {
        console.log('RestService.triggerPublishSensorData')
        return this.http.post<void>(`${this.serviceUrl}/hangarIotController/triggerPublishSensorData`, deviceNameRequest)
    }

    getCommandList(): Observable<Array<CommandResponse>> {
        return this.http.get<Array<CommandResponse>>(`${this.serviceUrl}/hangarIotController/getCommandList`)
    }

    executeFreeFormatCommand(freeFormatCommandRequest: FreeFormatCommandRequest): Observable<string> {
        console.log('RestService.triggerSensorData')
        return this.http.post<string>(`${this.serviceUrl}/hangarIotController/executeFreeFormatCommand`, freeFormatCommandRequest)
    }

    getTimers(deviceName: string): Observable<TimersRequestResponse2> {
        return this.http.get<TimersRequestResponse2>(`${this.serviceUrl}/hangarIotController/getTimers?deviceName=${deviceName}`)
    }
    setTimers(timersRequestResponse: TimersRequestResponse2): Observable<string> {
        return this.http.post<string>(`${this.serviceUrl}/hangarIotController/setTimers`, timersRequestResponse)
    }
}
