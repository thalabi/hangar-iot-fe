import { Component, OnDestroy, OnInit } from '@angular/core';
import { waitForAsync } from '@angular/core/testing';
import { SelectMultipleControlValueAccessor } from '@angular/forms';
import { RxStompService } from '@stomp/ng2-stompjs';
import { Message } from '@stomp/stompjs';
import { MessageService } from 'primeng/api';
import { delay, Subject, Subscription, takeUntil } from 'rxjs';
import { RestService } from '../service/rest.service';
import { SessionService } from '../service/session.service';
import { Device } from './Device';
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
    cabinHeaterPowerState: string = 'OFF'
    tanisHeaterPowerState: string = 'OFF'
    pingResponse: any;

    deviceNameList: Array<string> = []
    deviceList: Array<Device> = []
    deviceNameForSensorData: string = ''
    deviceNameSensorDataMap: Record<string, SensorDataResponse> = {} as any;
    deviceNamePowerStateMap: Record<string, PowerStateResponse> = {} as any;

    //id: any
    cabinHeaterMessage: string | undefined;
    tanisHeaterMessage: string | undefined;

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
                    let device: Device = { name: deviceResponse.name, description: deviceResponse.description }
                    this.deviceList.push(device)
                    this.deviceNameList.push(device.name)
                })

                this.webSocketConnectAndSubscribe()
                // sleep for some time for subscriptions to be processed before triggering power state and sensor data
                setTimeout(() => {
                    console.log('sleep');
                    this.retrieveData()
                }, 1000);
                //this.retrieveData()
            });

    }

    // code is based on https://github.com/stomp-js/ng2-stompjs-angular7
    private webSocketConnectAndSubscribe(): void {
        this.rxStompService.activate()

        this.deviceNameList.forEach(deviceName => {

            // subscribe to POWER state topic
            let powerTopicSubscription: Subscription = this.rxStompService.watch(`/topic/state-and-telemetry/stat/${deviceName}/POWER`).subscribe((message: Message) => {
                console.log('topic: [%s], message: [%s]', message.headers['destination'], message.body)
                //this.cabinHeaterMessage = message.body;

                // TODO load power state into a map
                this.deviceNamePowerStateMap[deviceName] = JSON.parse(message.body);
            });
            this.topicSubscriptionArray.push(powerTopicSubscription)

            // subscribe to SENSOR telemetry topic
            let sensorTopSubscription: Subscription = this.rxStompService.watch(`/topic/state-and-telemetry/tele/${deviceName}/SENSOR`).subscribe((message: Message) => {
                console.log('topic: [%s], message: [%s]', message.headers['destination'], message.body)
                //this.cabinHeaterMessage = message.body;
                this.deviceNameSensorDataMap[deviceName] = JSON.parse(message.body);
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

        this.deviceList.forEach(device => {

            const deviceNameRequest: DeviceNameRequest = {} as DeviceNameRequest;
            deviceNameRequest.deviceName = device.name
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

    cabinHeaterPowerStateToggle(deviceName: string) {
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
