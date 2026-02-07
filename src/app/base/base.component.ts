import { Component, DestroyRef, inject, OnDestroy, OnInit } from '@angular/core';
import { RxStompService } from '@stomp/ng2-stompjs';
import { Message } from '@stomp/stompjs';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { BehaviorSubject, distinctUntilChanged, skip, Subscription, switchMap, take, tap } from 'rxjs';
import { ConnectionStateResponse } from '../dashboard/ConnectionStateResponse';
import { DeviceAttributes } from '../dashboard/DeviceAttributes';
import { DeviceNameRequest } from '../dashboard/DeviceNameRequest';
import { Device } from '../dashboard/Device';
import { PowerStateResponse } from '../dashboard/PowerStateResponse';
import { SensorDataResponse } from '../dashboard/SensorDataResponse';
import { RestService } from '../service/rest.service';
import { Zone } from '../dashboard/Zone';
import { Area } from '../dashboard/Area';

@Component({
    selector: 'app-base',
    template: `
    <p>
      base works!
    </p>
  `,
    styleUrls: ['./base.component.css']
})
export class BaseComponent implements OnInit, OnDestroy {

    protected destroyRef = inject(DestroyRef);

    public deviceAttributesMap: Record<string, DeviceAttributes> = {} as any;
    public zoneMap: Record<string, Zone> = {} as any;
    public areaMap: Record<string, Area> = {} as any;
    /**
     * groupedDeviceAttributesMap[zoneId][areaId] = DeviceAttributes
     *
     * - Outer key (number): zone.id
     * - Inner key (number): area.id
     * - string: device.name
     */
    public groupedDeviceAttributesMap: Record<string, Record<string, Record<string, DeviceAttributes>>> = {} as any;

    constructor(
        // protected destroyRef: DestroyRef,
        protected restService: RestService,
        protected rxStompService: RxStompService
    ) {
        console.log('In BaseComponent constructor')
    }

    public ngOnInit() {
        this.restService.getDeviceList()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((deviceResponseList: Array<Device>) => {
                console.log('deviceResponseList', deviceResponseList)
                //this.deviceResponseList = deviceResponseList
                this.populateDeviceAttributesMap(deviceResponseList);
                // this.populateZoneAndAreaMaps(deviceResponseList);

                this.rxStompService.activate();

                // wait for connection to be established before subscribing to topics
                this.rxStompService.connected$
                    .pipe(takeUntilDestroyed(this.destroyRef)) // automatically unsubscribe on destroy
                    .subscribe(rsStompState => {
                        this.webSocketConnectAndSubscribe();
                        this.publishConnectionState();
                        this.triggerPublishState();

                        console.log('this.deviceAttributesMap', this.deviceAttributesMap);
                        console.log('this.groupedDeviceAttributesMap', this.groupedDeviceAttributesMap);
                    });
            });

    }

    private populateDeviceAttributesMap(deviceResponseList: Array<Device>) {
        deviceResponseList.forEach(deviceResponse => {
            this.deviceAttributesMap[deviceResponse.name] = { device: deviceResponse, powerState: {} as PowerStateResponse, savedPowerState: {} as PowerStateResponse, sensorData: {} as SensorDataResponse, connectionStateBehaviorSubject: new BehaviorSubject<ConnectionStateResponse>({} as ConnectionStateResponse), zigbee2MqttState: null } as DeviceAttributes;
            // ensure zone map exists
            this.groupedDeviceAttributesMap[deviceResponse.zone?.name || 0] = this.groupedDeviceAttributesMap[deviceResponse.zone?.name || 0] || {};
            // ensure area map exists within the zone
            this.groupedDeviceAttributesMap[deviceResponse.zone?.name || 0][deviceResponse.area?.name || 0] = this.groupedDeviceAttributesMap[deviceResponse.zone?.name || 0][deviceResponse.area?.name || 0] || {};
            // assign device attributes by device name into the area map
            this.groupedDeviceAttributesMap[deviceResponse.zone?.name || 0][deviceResponse.area?.name || 0][deviceResponse.name] = this.deviceAttributesMap[deviceResponse.name];
        });
    }
    private populateZoneAndAreaMaps(deviceResponseList: Array<Device>) {
        deviceResponseList.forEach(deviceResponse => {
            if (deviceResponse.zone) {
                this.zoneMap[deviceResponse.zone.name] = deviceResponse.zone;
            }
            if (deviceResponse.area) {
                this.areaMap[deviceResponse.area.name] = deviceResponse.area;
            }
        });
        console.log('this.zoneMap', this.zoneMap)
        console.log('this.areaMap', this.areaMap)
    }

    // code is based on https://github.com/stomp-js/ng2-stompjs-angular7
    private webSocketConnectAndSubscribe(): void {
        console.log('webSocketConnectAndSubscribe()')
        Object.keys(this.deviceAttributesMap).forEach(deviceName => {

            // subscribe to POWER topic
            console.log(`subscribing to topic: /topic/${deviceName}/power`)
            this.rxStompService.watch(`/topic/${deviceName}/power`)
                .pipe(takeUntilDestroyed(this.destroyRef)) // automatically unsubscribe on destroy
                .subscribe((message: Message) => {
                    console.log('topic: [%s], message: [%s]', message.headers['destination'], message.body)

                    this.deviceAttributesMap[deviceName].powerState = JSON.parse(message.body);
                    this.deviceAttributesMap[deviceName].savedPowerState = JSON.parse(message.body);
                });

            // subscribe to SENSOR telemetry topic if device is capable of sending telemetry data
            if (this.deviceAttributesMap[deviceName]?.device.telemetry) {

                console.log(`subscribing to topic: /topic/state-and-telemetry/stat/${deviceName}/SENSOR`)
                this.rxStompService.watch(`/topic/state-and-telemetry/tele/${deviceName}/SENSOR`)
                    .pipe(takeUntilDestroyed(this.destroyRef)) // automatically unsubscribe on destroy
                    .subscribe((message: Message) => {
                        console.log('topic: [%s], message: [%s]', message.headers['destination'], message.body)
                        this.deviceAttributesMap[deviceName].sensorData = JSON.parse(message.body);
                    });
            }

            // subscribe to state topic
            console.log(`subscribing to topic: /topic/${deviceName}/state`)
            this.rxStompService.watch(`/topic/${deviceName}/state`)
                .pipe(takeUntilDestroyed(this.destroyRef))// automatically unsubscribe on destroy
                .subscribe((message: Message) => {
                    console.log('topic: [%s], message: [%s]', message.headers['destination'], message.body)

                    this.deviceAttributesMap[deviceName].connectionStateBehaviorSubject.next(JSON.parse(message.body));
                });

            // subscribe to zigbee2mqtt state topic
            if (this.deviceAttributesMap[deviceName]?.device.bridge === 'ZIGBEE2MQTT') {
                console.log(`subscribing to topic: /topic/zigbee2mqtt/${deviceName}`)
                this.rxStompService.watch(`/topic/zigbee2mqtt/${deviceName}`)
                    .pipe(takeUntilDestroyed(this.destroyRef))// automatically unsubscribe on destroy
                    .subscribe((message: Message) => {
                        console.log('topic: [%s], message: [%s]', message.headers['destination'], message.body)
                        this.deviceAttributesMap[deviceName].zigbee2MqttState = message.body;
                    });
            }
        })

    }

    private webSocketCleanup() {
        console.log('webSocketCleanup()')
        console.log('this.rxStompService.deactivate()')
        this.rxStompService.deactivate()
        console.log('connected?', this.rxStompService.connected())
    }

    private publishConnectionState() {
        console.log('publishConnectionState()')

        Object.keys(this.deviceAttributesMap).forEach(deviceName => {
            const deviceNameRequest: DeviceNameRequest = {} as DeviceNameRequest;
            deviceNameRequest.deviceName = deviceName

            this.restService.publishConnectionState(deviceNameRequest).subscribe()
        })
    }

    private triggerPublishState() {
        console.log('triggerPublishState()')

        Object.keys(this.deviceAttributesMap).forEach(deviceName => {

            this.deviceAttributesMap[deviceName].connectionStateBehaviorSubject
                .pipe(
                    takeUntilDestroyed(this.destroyRef),
                    distinctUntilChanged((prev, curr) => prev.state === curr.state), // Only fire if state actually changes
                    skip(1) // Ignore the current value emitted on subscribe
                )
                .subscribe((connectionStateResponse: ConnectionStateResponse) => {
                    console.log('deviceName: [%s] connectionStateResponse: [%o]', deviceName, connectionStateResponse)
                    const deviceNameRequest: DeviceNameRequest = {} as DeviceNameRequest;
                    deviceNameRequest.deviceName = deviceName

                    // trigger publishing state
                    this.restService.triggerPublishState(deviceNameRequest).pipe(take(1)).subscribe()
                })
        });
    }

    private sleep2(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    public ngOnDestroy() {
        console.log('BaseComponent.ngOnDestroy()')
        this.webSocketCleanup()
    }
}

