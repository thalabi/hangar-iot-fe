import { Component, DestroyRef, OnDestroy, OnInit } from '@angular/core';
import { RxStompService } from '@stomp/ng2-stompjs';
import { MessageService } from 'primeng/api';
import { RestService } from '../service/rest.service';
import { DeviceNameRequest } from './DeviceNameRequest';
import { TogglePowerRequest } from './TogglePowerRequest';
import { BaseComponent } from '../base/base.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { SelectButtonChangeEvent, SelectButtonModule } from 'primeng/selectbutton';
import { ButtonModule } from 'primeng/button';
import { TabsModule } from 'primeng/tabs';
import { CardModule } from 'primeng/card';
import { DeviceAttributes } from './DeviceAttributes';
import { PopoverModule } from 'primeng/popover';

@Component({
    standalone: true,
    selector: 'app-dashboard',
    imports: [CommonModule, FormsModule, SelectModule, SelectButtonModule, ButtonModule, TabsModule, CardModule, PopoverModule],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent extends BaseComponent implements OnInit, OnDestroy {

    powerStateOptions: any = [{ label: 'Off', value: 'off' }, { label: 'On', value: 'on' }]

    selectedDeviceNameForSensorData: string = ''

    constructor(
        protected override restService: RestService,
        protected override rxStompService: RxStompService,
        private messageService: MessageService
    ) {
        super(restService, rxStompService);
    }

    override ngOnInit(): void {
        console.log('ngOnInit')
        this.messageService.clear()

        super.ngOnInit()
    }

    private triggerPublishSensorData(deviceName: string) {
        console.log('triggerPublishSensorData()')
        // trigger publishing sensor data if device supports it
        if (this.deviceAttributesMap[deviceName]?.device.telemetry) {
            const deviceNameRequest: DeviceNameRequest = {} as DeviceNameRequest;
            deviceNameRequest.deviceName = deviceName
            this.restService.triggerPublishSensorData(deviceNameRequest).subscribe()
        }
    }

    // toggleDevicePower(event: { originalEvent: PointerEvent, value: string }, deviceName: string) {
    toggleDevicePower(event: SelectButtonChangeEvent, deviceName: string) {
        console.log('toggleDevicePower')
        console.log('event', event)
        console.log('changedValue', event.value)
        console.log('domEvent', event.originalEvent)
        const powerStateRequested = event.value
        const togglePowerRequest: TogglePowerRequest = { deviceName, powerStateRequested }

        if (powerStateRequested === this.deviceAttributesMap[deviceName].savedPowerState.power) {
            return
        }

        this.restService.togglePower(togglePowerRequest)
            .subscribe(
                {
                    complete: () => {
                        // trigger sensor data only if device supports telemetry
                        if (this.deviceAttributesMap[deviceName]?.device.telemetry) {
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

    filterOnZone(zoneName: string): Record<string, DeviceAttributes> {
        return Object.fromEntries(
            Object.entries(this.deviceAttributesMap)
                .filter(
                    ([_, deviceAttribute]) => deviceAttribute?.device?.zone?.name === zoneName
                )
        );
    }
    filterOnZoneAndArea(zoneName: string, areaName: string): Record<string, DeviceAttributes> {
        return Object.fromEntries(
            Object.entries(this.deviceAttributesMap)
                .filter(
                    ([_, deviceAttribute]) => deviceAttribute?.device?.zone?.name === zoneName && deviceAttribute?.device?.area?.name === areaName
                )
        );
    }

    extractFromJsonStringOld(jsonString: string | null, fieldName: string): any | null {
        if (!jsonString) {
            return null;
        }
        let jsonObject: any;

        try {
            // Parse the string into a JavaScript object
            jsonObject = JSON.parse(jsonString);
        } catch (error) {
            console.error("Error parsing JSON string:", error);
            return null;
        }

        // Check if the field exists and is not undefined
        if (fieldName in jsonObject) {
            return jsonObject[fieldName];
        } else {
            console.warn(`Field '${fieldName}' not found.`);
            return null;
        }
    }
    extractOccupancyFromJsonString(jsonString: string | null): string {
        const occupancy = this.extractFromJsonString(jsonString, 'occupancy')
        if (occupancy === '-') return '-'
        return (occupancy === true || occupancy === 'true') ? 'Detected' : 'Clear'
    }
    extractFromJsonString(jsonString: string | null, key: string, fallback: string = '-'): any {
        if (!jsonString) return fallback;

        try {
            const jsonObject = JSON.parse(jsonString);
            // Use optional chaining and nullish coalescing to find the key
            return jsonObject?.[key] ?? fallback;
        } catch (error) {
            console.error('Error parsing JSON:', error);
            return fallback;
        }
    }

    override ngOnDestroy(): void {
        super.ngOnDestroy()
    }

    private sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
