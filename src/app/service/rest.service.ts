import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DeviceNameRequest } from '../dashboard/DeviceNameRequest';
import { Device } from '../dashboard/Device';
import { environment } from '../../environments/environment';
import { CommandResponse } from '../execute-command/CommandResponse';
import { FreeFormatCommandRequest } from '../execute-command/FreeFormatCommandRequest';
import { TogglePowerRequest } from '../dashboard/TogglePowerRequest';
import { TimersRequestResponse } from '../timers/TimersRequestResponse';
import { ToggleAreaPowerRequest } from '../dashboard/ToggleAreaPowerRequest';

@Injectable({
    providedIn: 'root'
})
export class RestService {

    readonly beRestServiceUrl: string | undefined;

    constructor(
        private http: HttpClient,
        //private configService: ConfigService,
    ) {
        //const applicationProperties = this.configService.getApplicationProperties();
        //this.beRestServiceUrl = applicationProperties?.beRestServiceUrl;
        console.log('environment.production', environment.production); // Logs false for default environment
        console.log('environment', environment)
        this.beRestServiceUrl = environment.beRestServiceUrl
    }

    getDeviceList(): Observable<Array<Device>> {
        return this.http.get<Array<Device>>(`${this.beRestServiceUrl}/protected/IotController/getDeviceList`)
    }

    togglePower(deviceNameRequest: TogglePowerRequest): Observable<void> {
        console.log('RestService.togglePower')
        return this.http.post<void>(`${this.beRestServiceUrl}/protected/IotController/togglePower`, deviceNameRequest)
    }
    toggleAreaPower(toggleAreaPowerRequest: ToggleAreaPowerRequest): Observable<void> {
        console.log('RestService.toggleAreaPower')
        return this.http.post<void>(`${this.beRestServiceUrl}/protected/IotController/toggleAreaPower`, toggleAreaPowerRequest)
    }

    publishConnectionState(deviceNameRequest: DeviceNameRequest): Observable<void> {
        console.log('RestService.triggerPublishConnectionState')
        return this.http.post<void>(`${this.beRestServiceUrl}/protected/IotController/publishConnectionState`, deviceNameRequest)
    }

    triggerPublishState(deviceNameRequest: DeviceNameRequest): Observable<void> {
        console.log('RestService.triggerPublishState')
        return this.http.post<void>(`${this.beRestServiceUrl}/protected/IotController/triggerPublishState`, deviceNameRequest)
    }

    triggerPublishSensorData(deviceNameRequest: DeviceNameRequest): Observable<void> {
        console.log('RestService.triggerPublishSensorData')
        return this.http.post<void>(`${this.beRestServiceUrl}/protected/IotController/triggerPublishSensorData`, deviceNameRequest)
    }

    getCommandList(): Observable<Array<CommandResponse>> {
        return this.http.get<Array<CommandResponse>>(`${this.beRestServiceUrl}/protected/IotController/getCommandList`)
    }

    executeFreeFormatCommand(freeFormatCommandRequest: FreeFormatCommandRequest): Observable<string> {
        console.log('RestService.triggerSensorData')
        return this.http.post<string>(`${this.beRestServiceUrl}/protected/IotController/executeFreeFormatCommand`, freeFormatCommandRequest)
    }

    getTimers(deviceName: string): Observable<TimersRequestResponse> {
        return this.http.get<TimersRequestResponse>(`${this.beRestServiceUrl}/protected/IotController/getTimers?deviceName=${deviceName}`)
    }
    setTimers(timersRequestResponse: TimersRequestResponse): Observable<string> {
        return this.http.post<string>(`${this.beRestServiceUrl}/protected/IotController/setTimers`, timersRequestResponse)
    }
}
