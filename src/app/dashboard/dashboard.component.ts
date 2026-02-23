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
import { ZigbeeState } from './ZigbeeState';
import { JsonHighlightPipe } from "./JsonHighlightPipe";
import { ToggleSwitchChangeEvent, ToggleSwitchModule } from 'primeng/toggleswitch';
import { ToggleAreaPowerRequest } from './ToggleAreaPowerRequest';

@Component({
    standalone: true,
    selector: 'app-dashboard',
    imports: [CommonModule, FormsModule, SelectModule, /*SelectButtonModule,*/ ButtonModule, TabsModule, CardModule, PopoverModule, JsonHighlightPipe, ToggleSwitchModule],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent extends BaseComponent implements OnInit, OnDestroy {

    powerStateOptions: any = [{ label: 'Off', value: 'off' }, { label: 'On', value: 'on' }]

    selectedDeviceNameForSensorData: string = ''

    activeTab: number = 0

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

    // getDevicePower(deviceName: string) {
    //     console.log(`getDevicePower(${deviceName})`)
    //     if (this.deviceAttributesMap[deviceName].device.bridge === 'TASMOTA') {
    //         return this.deviceAttributesMap[deviceName].powerState.power
    //     }
    //     return this.extractStateFromJsonString(this.deviceAttributesMap[deviceName].zigbeeState)
    // }

    // toggleDevicePower(event: SelectButtonChangeEvent, deviceName: string) {
    //     console.log('toggleDevicePower')
    //     console.log('event', event)
    //     console.log('changedValue', event.value)
    //     console.log('domEvent', event.originalEvent)
    //     const powerStateRequested = event.value
    //     const togglePowerRequest: TogglePowerRequest = { deviceName, powerStateRequested }

    //     if (powerStateRequested === this.deviceAttributesMap[deviceName].savedPowerState.power) {
    //         return
    //     }

    //     this.restService.togglePower(togglePowerRequest)
    //         .subscribe(
    //             {
    //                 complete: () => {
    //                     // trigger sensor data only if device supports telemetry
    //                     if (this.deviceAttributesMap[deviceName]?.device.telemetry) {
    //                         this.restService.triggerPublishSensorData(togglePowerRequest).subscribe()
    //                     }

    //                 },
    //             });
    // }
    toggleDevicePower2(event: ToggleSwitchChangeEvent, deviceName: string) {
        console.log('toggleDevicePower')
        console.log('event', event)
        console.log('event.checked', event.checked)
        console.log('domEvent', event.originalEvent)
        const powerStateRequested = event.checked ? 'ON' : 'OFF'
        const togglePowerRequest: TogglePowerRequest = { deviceName, powerStateRequested }

        // if (powerStateRequested === this.deviceAttributesMap[deviceName].savedPowerState.power) {
        //     return
        // }

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

    // areaPowerState(zone: string, area: string): boolean {
    //     console.log('areaPowerState', zone, area)
    //     this.groupedDeviceAttributesMap[zone]?.[area] && console.log('groupedDeviceAttributesMap[zone][area]', this.groupedDeviceAttributesMap[zone][area])
    //     if (this.groupedDeviceAttributesMap[zone]?.[area]) {

    //         const deviceAttributesList = Object.values(this.groupedDeviceAttributesMap[zone][area])
    //         if (deviceAttributesList.length > 0) {
    //             const someOn = deviceAttributesList.some(deviceAttribute => {
    //                 return deviceAttribute.device.bridge === 'TASMOTA' && deviceAttribute.powerState.power === 'on' ||
    //                     deviceAttribute.device.bridge === 'ZIGBEE2MQTT' && deviceAttribute.zigbeeState?.state === 'ON'
    //             })
    //             console.log('someOn', someOn)
    //             return someOn
    //         }
    //         return false
    //     }
    //     return false
    // }

    toggleAreaPower(event: ToggleSwitchChangeEvent, zoneName: string, areaName: string) {
        console.log('toggleAreaPower')
        console.log('event', event)
        console.log('event.checked', event.checked)
        console.log('zone', zoneName)
        console.log('area', areaName)
        const toggleAreaPowerRequest: ToggleAreaPowerRequest = { zoneName: zoneName, areaName: areaName, powerStateRequested: event.checked }

        this.restService.toggleAreaPower(toggleAreaPowerRequest)
            .subscribe(
                {
                    complete: () => {

                        console.log('toggled area power, now triggering publish state for all devices in the area to update their state in the UI')
                        const devicesInArea = this.filterOnZoneAndArea(zoneName, areaName)
                        console.log('devicesInArea', devicesInArea)

                        // trigger sensor data only if device supports telemetry
                        // if (this.deviceAttributesMap[deviceName]?.device.telemetry) {
                        //     this.restService.triggerPublishSensorData(togglePowerRequest).subscribe()
                        // }

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

    extractStateFromJsonString(jsonString: ZigbeeState | null): string {
        const state = this.extractFromJsonString(jsonString, 'state')
        if (state === '-') return '-'
        console.log('state', state)
        return String(state).toLowerCase()
    }
    extractOccupancyFromJsonString(jsonString: ZigbeeState | null): string {
        const occupancy = this.extractFromJsonString(jsonString, 'occupancy')
        if (occupancy === '-') return '-'
        return (occupancy === true || occupancy === 'true') ? 'Detected' : 'Clear'
    }
    extractFromJsonString(zigbeeState: ZigbeeState | null, key: keyof ZigbeeState, fallback: string = '-'): any {
        if (!zigbeeState) return fallback;

        try {
            //const jsonObject = JSON.parse(jsonString);
            // Use optional chaining and nullish coalescing to find the key
            return zigbeeState?.[key] ?? fallback;
        } catch (error) {
            console.error('Error parsing JSON:', error);
            return fallback;
        }
    }

    onTabChange(tabValue: string | number) {
        this.selectedDeviceNameForSensorData = ''
    }

    override ngOnDestroy(): void {
        super.ngOnDestroy()
    }

    private sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
