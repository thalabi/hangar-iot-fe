import { Component, OnDestroy, OnInit } from '@angular/core';
import { RxStompService } from '@stomp/ng2-stompjs';
import { Message } from '@stomp/stompjs';

import { BehaviorSubject, Subscription } from 'rxjs';
import { ConnectionStateResponse } from '../dashboard/ConnectionStateResponse';
import { DeviceAttributes } from '../dashboard/DeviceAttributes';
import { DeviceNameRequest } from '../dashboard/DeviceNameRequest';
import { DeviceResponse } from '../dashboard/DeviceResponse';
import { PowerStateResponse } from '../dashboard/PowerStateResponse';
import { SensorDataResponse } from '../dashboard/SensorDataResponse';
import { RestService } from '../service/rest.service';

@Component({
    selector: 'app-base',
    template: `
    <p>
      base works!
    </p>
  `,
    styleUrls: ['./base.component.css']
})
export class BaseComponent /*implements OnInit, OnDestroy*/ {

    public deviceAttributesMap: Record<string, DeviceAttributes> = {} as any;
    public subscriptionArray: Array<Subscription> = []

    constructor(
        protected restService: RestService,
        protected rxStompService: RxStompService
    ) {
    }

    // ngOnInit(): void {
    // }

    protected init() {
        this.restService.getDeviceList()
            .subscribe((deviceResponseList: Array<DeviceResponse>) => {
                console.log('deviceResponseList', deviceResponseList)
                //this.deviceResponseList = deviceResponseList
                deviceResponseList.forEach(deviceResponse => {
                    this.deviceAttributesMap[deviceResponse.name] = { description: deviceResponse.description, telemetry: deviceResponse.telemetry, powerState: {} as PowerStateResponse, savedPowerState: {} as PowerStateResponse, sensorData: {} as SensorDataResponse, connectionStateBehaviorSubject: new BehaviorSubject<ConnectionStateResponse>({} as ConnectionStateResponse) }
                })


                this.rxStompService.activate();


                //console.log('connected?', this.rxStompService.connected())

                // wait for connection to be established before subscribing to topics
                let rxStompServiceConnectedSubscription = this.rxStompService.connected$.subscribe(rsStompState => {
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
                this.deviceAttributesMap[deviceName].savedPowerState = JSON.parse(message.body);
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

            console.log(`subscribing to topic: /topic/state-and-telemetry/tele/${deviceName}/STATE`)
            let stateTopicSubscription: Subscription = this.rxStompService.watch(`/topic/state-and-telemetry/tele/${deviceName}/STATE`).subscribe((message: Message) => {
                console.log('topic: [%s], message: [%s]', message.headers['destination'], message.body)

                //this.deviceAttributesMap[deviceName].connectionState = JSON.parse(message.body);
                this.deviceAttributesMap[deviceName].connectionStateBehaviorSubject.next(JSON.parse(message.body));

            });
            this.subscriptionArray.push(stateTopicSubscription)

        })
    }

    private webSocketUnsubscribeAndDisconnect() {
        this.subscriptionArray.forEach(topicSubscription => {
            console.log('unsubscribing from Web Socket topic', topicSubscription)
            topicSubscription.unsubscribe()
        })
        // this.rxStompService.deactivate()
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

            let connectionStateSubscription = this.deviceAttributesMap[deviceName].connectionStateBehaviorSubject
                .subscribe((connectionStateResponse: ConnectionStateResponse) => {
                    console.log('deviceName: [%s] connectionStateResponse: [%o]', deviceName, connectionStateResponse)
                    if (connectionStateResponse.state === 'ONLINE') {
                        const deviceNameRequest: DeviceNameRequest = {} as DeviceNameRequest;
                        deviceNameRequest.deviceName = deviceName

                        // trigger publishing power state
                        this.restService.triggerPublishPowerState(deviceNameRequest).subscribe()
                    }
                })
            this.subscriptionArray.push(connectionStateSubscription)
        });
    }

    // ngOnDestroy(): void {
    // }
    private sleep2(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    protected destroy() {
        this.webSocketUnsubscribeAndDisconnect()
    }
}
