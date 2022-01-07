import { Component, OnDestroy, OnInit } from '@angular/core';
import { RxStompService } from '@stomp/ng2-stompjs';
import { Message } from '@stomp/stompjs';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { RestService } from '../service/rest.service';
import { DeviceAttributes } from './DeviceAttributes';
import { DeviceNameRequest } from './DeviceNameRequest';
import { DeviceResponse } from './DeviceResponse';
import { PowerStateResponse } from './PowerStateResponse';
import { SensorDataResponse } from './SensorDataResponse';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {

    powerStateOptions: any = [{ label: 'Off', value: 'OFF' }, { label: 'On', value: 'ON' }]

    deviceAttributesMap: Record<string, DeviceAttributes> = {} as any;

    topicSubscriptionArray: Array<Subscription> = []

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
                deviceResponseList.forEach(deviceResponse => {
                    this.deviceAttributesMap[deviceResponse.name] = { description: deviceResponse.description, powerState: {} as PowerStateResponse, sensorData: {} as SensorDataResponse }
                })


                this.rxStompService.activate()

                //console.log('connected?', this.rxStompService.connected())

                // wait for connection to be established before subscribing to topics
                this.rxStompService.connected$.subscribe(rsStompState => {
                    // console.log('rsStompState', rsStompState)
                    // console.log('connected?', this.rxStompService.connected())
                    this.webSocketConnectAndSubscribe()
                    this.retrieveData()

                    console.log('this.deviceAttributesMap', this.deviceAttributesMap)
                })

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
            this.topicSubscriptionArray.push(powerTopicSubscription)

            // subscribe to SENSOR telemetry topic
            console.log(`subscribing to topic: /topic/state-and-telemetry/stat/${deviceName}/SENSOR`)
            let sensorTopSubscription: Subscription = this.rxStompService.watch(`/topic/state-and-telemetry/tele/${deviceName}/SENSOR`).subscribe((message: Message) => {
                console.log('topic: [%s], message: [%s]', message.headers['destination'], message.body)
                this.deviceAttributesMap[deviceName].sensorData = JSON.parse(message.body);
            });
            this.topicSubscriptionArray.push(sensorTopSubscription)

        })
    }

    private webSocketUnsubscribeAndDisconnect(): void {
        this.topicSubscriptionArray.forEach(topicSubscription => topicSubscription.unsubscribe())
        this.rxStompService.deactivate();
    }

    private retrieveData() {
        console.log('retrieveData()')

        Object.keys(this.deviceAttributesMap).forEach(deviceName => {

            const deviceNameRequest: DeviceNameRequest = {} as DeviceNameRequest;
            deviceNameRequest.deviceName = deviceName
            this.restService.triggerPowerState(deviceNameRequest)
                .subscribe(
                    {
                        complete: () => {

                        },
                        error: (err: any /*HttpErrorResponse*/) => {
                        }
                    });
            this.restService.triggerSensorData(deviceNameRequest)
                .subscribe(
                    {
                        complete: () => {

                        },
                        error: (err: any /*HttpErrorResponse*/) => {
                        }
                    });

        });
    }

    toggleDevicePower(deviceName: string) {
        console.log('cabinHeaterPowerStateToggle')
        console.log('deviceName', deviceName)
        const deviceNameRequest: DeviceNameRequest = {} as DeviceNameRequest;
        deviceNameRequest.deviceName = deviceName

        this.restService.togglePower(deviceNameRequest)
            .subscribe(
                {
                    complete: () => {
                        const deviceNameRequest: DeviceNameRequest = {} as DeviceNameRequest;
                        deviceNameRequest.deviceName = deviceName
                        this.restService.triggerSensorData(deviceNameRequest)
                            .subscribe(
                                {
                                    complete: () => {

                                    },
                                    error: (err: any /*HttpErrorResponse*/) => {
                                    }
                                });

                    },
                });
    }

    onRefresh(event: any) {
        this.retrieveData()
    }

    onSensorDataForDeviceName(event: any) {

    }

    ngOnDestroy(): void {
        this.webSocketUnsubscribeAndDisconnect()
    }

    private sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
