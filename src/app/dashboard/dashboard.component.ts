import { Component, OnDestroy, OnInit } from '@angular/core';
import { RxStompService } from '@stomp/ng2-stompjs';
import { Message } from '@stomp/stompjs';
import { MessageService } from 'primeng/api';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { RestService } from '../service/rest.service';
import { DeviceAttributes } from './DeviceAttributes';
import { DeviceNameRequest } from './DeviceNameRequest';
import { DeviceResponse } from './DeviceResponse';
import { PowerStateResponse } from './PowerStateResponse';
import { SensorDataResponse } from './SensorDataResponse';
import { ConnectionStateResponse } from './ConnectionStateResponse';
import { TogglePowerRequest } from './TogglePowerRequest';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {

    powerStateOptions: any = [{ label: 'Off', value: 'OFF' }, { label: 'On', value: 'ON' }]

    deviceResponseList: Array<DeviceResponse> = {} as Array<DeviceResponse>;
    deviceAttributesMap: Record<string, DeviceAttributes> = {} as any;

    subscriptionArray: Array<Subscription> = []

    selectedDeviceNameForSensorData: string = ''

    constructor(
        private restService: RestService,
        private rxStompService: RxStompService,
        private messageService: MessageService
    ) { }

    ngOnInit(): void {
        console.log('ngOnInit')
        this.messageService.clear()

        this.restService.getDeviceList()
            .subscribe((deviceResponseList: Array<DeviceResponse>) => {
                console.log('deviceResponseList', deviceResponseList)
                this.deviceResponseList = deviceResponseList
                this.deviceResponseList.forEach(deviceResponse => {
                    this.deviceAttributesMap[deviceResponse.name] = { description: deviceResponse.description, telemetry: deviceResponse.telemetry, powerState: {} as PowerStateResponse, sensorData: {} as SensorDataResponse, connectionStateSubject: new BehaviorSubject<ConnectionStateResponse>({} as ConnectionStateResponse) }
                })


                this.rxStompService.activate()

                //console.log('connected?', this.rxStompService.connected())

                // wait for connection to be established before subscribing to topics
                let rxStompServiceConnectedSubscription = this.rxStompService.connected$.subscribe(rsStompState => {
                    // console.log('rsStompState', rsStompState)
                    // console.log('connected?', this.rxStompService.connected())
                    this.webSocketConnectAndSubscribe()
                    this.triggerPublishConnectionState()
                    this.triggerPublishPowerState()

                    console.log('this.deviceAttributesMap', this.deviceAttributesMap)
                })
                this.subscriptionArray.push(rxStompServiceConnectedSubscription)
            });

    }

    // code is based on https://github.com/stomp-js/ng2-stompjs-angular7
    private webSocketConnectAndSubscribe(): void {
        // this.rxStompService.activate()

        Object.keys(this.deviceAttributesMap).forEach(deviceName => {

            // subscribe to POWER state topic
            console.log(`subscribing to topic: /topic/state-and-telemetry/stat/${deviceName}/POWER`)
            let powerTopicSubscription: Subscription = this.rxStompService.watch(`/topic/state-and-telemetry/stat/${deviceName}/POWER`).subscribe((message: Message) => {
                console.log('topic: [%s], message: [%s]', message.headers['destination'], message.body)

                this.deviceAttributesMap[deviceName].powerState = JSON.parse(message.body);
            });
            this.subscriptionArray.push(powerTopicSubscription)

            // subscribe to SENSOR telemetry topic if device is capable of sending telemetry data
            if (this.deviceAttributesMap[deviceName]?.telemetry) {

                console.log(`subscribing to topic: /topic/state-and-telemetry/stat/${deviceName}/SENSOR`)
                let sensorTopSubscription: Subscription = this.rxStompService.watch(`/topic/state-and-telemetry/tele/${deviceName}/SENSOR`).subscribe((message: Message) => {
                    console.log('topic: [%s], message: [%s]', message.headers['destination'], message.body)
                    this.deviceAttributesMap[deviceName].sensorData = JSON.parse(message.body);
                });
                this.subscriptionArray.push(sensorTopSubscription)
            }

            // subscribe to LWT (last will and testament) topic, it contains device state Online or Offline
            console.log(`subscribing to topic: /topic/state-and-telemetry/tele/${deviceName}/LWT`)
            let lwtTopicSubscription: Subscription = this.rxStompService.watch(`/topic/state-and-telemetry/tele/${deviceName}/LWT`).subscribe((message: Message) => {
                console.log('topic: [%s], message: [%s]', message.headers['destination'], message.body)

                //this.deviceAttributesMap[deviceName].connectionState = JSON.parse(message.body);
                this.deviceAttributesMap[deviceName].connectionStateSubject.next(JSON.parse(message.body));
            });
            this.subscriptionArray.push(lwtTopicSubscription)

        })
    }

    private webSocketUnsubscribeAndDisconnect(): void {
        this.subscriptionArray.forEach(topicSubscription => {
            console.log('unsubscribing from Web Socket topic', topicSubscription)
            topicSubscription.unsubscribe()
        })
        this.rxStompService.deactivate();
    }

    private triggerPublishConnectionState() {
        console.log('triggerPublishConnectionState()')

        Object.keys(this.deviceAttributesMap).forEach(deviceName => {
            const deviceNameRequest: DeviceNameRequest = {} as DeviceNameRequest;
            deviceNameRequest.deviceName = deviceName

            this.restService.triggerPublishConnectionState(deviceNameRequest).subscribe()
        })
    }

    private triggerPublishPowerState() {
        console.log('triggerPublishPowerState()')

        Object.keys(this.deviceAttributesMap).forEach(deviceName => {

            let connectionStateSubscription = this.deviceAttributesMap[deviceName].connectionStateSubject
                .subscribe((connectionStateResponse: ConnectionStateResponse) => {
                    console.log('deviceName: [%s] connectionStateResponse: [%o]', deviceName, connectionStateResponse)
                    if (connectionStateResponse.LWT === 'Online') {
                        const deviceNameRequest: DeviceNameRequest = {} as DeviceNameRequest;
                        deviceNameRequest.deviceName = deviceName

                        // trigger publishing power state
                        this.restService.triggerPublishPowerState(deviceNameRequest).subscribe()
                    }
                })
            this.subscriptionArray.push(connectionStateSubscription)
        });
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
        if (this.selectedDeviceNameForSensorData && this.deviceAttributesMap[this.selectedDeviceNameForSensorData]?.connectionStateSubject.getValue().LWT === 'Online') {
            this.triggerPublishSensorData(this.selectedDeviceNameForSensorData)
        }
    }

    onRefreshSensorData(event: any) {
        console.log('onRefreshSensorData, selectedDeviceNameForSensorData', this.selectedDeviceNameForSensorData)
        this.triggerPublishSensorData(this.selectedDeviceNameForSensorData)
    }

    ngOnDestroy(): void {
        this.webSocketUnsubscribeAndDisconnect()
    }

    private sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
