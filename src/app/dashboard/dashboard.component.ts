import { Component, OnDestroy, OnInit } from '@angular/core';
import { RxStompService } from '@stomp/ng2-stompjs';
import { MessageService } from 'primeng/api';
import { RestService } from '../service/rest.service';
import { DeviceNameRequest } from './DeviceNameRequest';
import { TogglePowerRequest } from './TogglePowerRequest';
import { BaseComponent } from '../base/base.component';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent extends BaseComponent implements OnInit, OnDestroy {

    powerStateOptions: any = [{ label: 'Off', value: 'OFF' }, { label: 'On', value: 'ON' }]

    selectedDeviceNameForSensorData: string = ''

    constructor(
        protected override restService: RestService,
        protected override rxStompService: RxStompService,
        private messageService: MessageService
    ) {
        super(restService, rxStompService);
    }

    ngOnInit(): void {
        console.log('ngOnInit')
        this.messageService.clear()

        super.init()
    }

    private triggerPublishSensorData(deviceName: string) {
        console.log('triggerPublishSensorData()')
        // trigger publishing sensor data if device supports it
        if (this.deviceAttributesMap[deviceName]?.telemetry) {
            const deviceNameRequest: DeviceNameRequest = {} as DeviceNameRequest;
            deviceNameRequest.deviceName = deviceName
            this.restService.triggerPublishSensorData(deviceNameRequest).subscribe()
        }
    }

    toggleDevicePower(event: { originalEvent: PointerEvent, value: string }, deviceName: string) {
        console.log('toggleDevicePower')
        console.log('event', event)
        console.log('changedValue', event.value)
        console.log('domEvent', event.originalEvent)
        const powerStateRequested = event.value
        const togglePowerRequest: TogglePowerRequest = { deviceName, powerStateRequested }

        if (powerStateRequested === this.deviceAttributesMap[deviceName].savedPowerState.POWER) {
            return
        }

        this.restService.togglePower(togglePowerRequest)
            .subscribe(
                {
                    complete: () => {
                        // trigger sensor data only if device supports telemetry
                        if (this.deviceAttributesMap[deviceName]?.telemetry) {
                            this.restService.triggerPublishSensorData(togglePowerRequest).subscribe()
                        }

                    },
                });
    }

    onSelectSensorDataForDeviceName(event: any) {
        console.log('onSensorDataForDeviceName, selectedDeviceNameForSensorData', this.selectedDeviceNameForSensorData)
        if (this.selectedDeviceNameForSensorData && this.deviceAttributesMap[this.selectedDeviceNameForSensorData]?.connectionStateBehaviorSubject.getValue().state === 'ONLINE') {
            this.triggerPublishSensorData(this.selectedDeviceNameForSensorData)
        }
    }

    onRefreshSensorData(event: any) {
        console.log('onRefreshSensorData, selectedDeviceNameForSensorData', this.selectedDeviceNameForSensorData)
        this.triggerPublishSensorData(this.selectedDeviceNameForSensorData)
    }

    ngOnDestroy(): void {
        super.destroy()
    }

    private sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
