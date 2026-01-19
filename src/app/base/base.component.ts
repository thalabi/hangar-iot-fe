import { Component, DestroyRef, inject, OnDestroy, OnInit } from '@angular/core';
import { RxStompService } from '@stomp/ng2-stompjs';
import { Message } from '@stomp/stompjs';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { BehaviorSubject, distinctUntilChanged, skip, Subscription, switchMap, take, tap } from 'rxjs';
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
export class BaseComponent implements OnInit, OnDestroy {

    protected destroyRef = inject(DestroyRef);

    public deviceAttributesMap: Record<string, DeviceAttributes> = {} as any;
    public subscriptionArray: Array<Subscription> = []

    constructor(
        // protected destroyRef: DestroyRef,
        protected restService: RestService,
        protected rxStompService: RxStompService
    ) {
        console.log('In BaseComponent constructor')

        this.destroyRef.onDestroy(() => {
            console.log('Cleanup logic runs');
        });
    }

    public ngOnInit() {
        this.restService.getDeviceList()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((deviceResponseList: Array<DeviceResponse>) => {
                console.log('deviceResponseList', deviceResponseList)
                //this.deviceResponseList = deviceResponseList
                deviceResponseList.forEach(deviceResponse => {
                    this.deviceAttributesMap[deviceResponse.name] = { description: deviceResponse.description, telemetry: deviceResponse.telemetry, powerState: {} as PowerStateResponse, savedPowerState: {} as PowerStateResponse, sensorData: {} as SensorDataResponse, connectionStateBehaviorSubject: new BehaviorSubject<ConnectionStateResponse>({} as ConnectionStateResponse) };
                });

                this.rxStompService.activate();

                //console.log('connected?', this.rxStompService.connected())

                // wait for connection to be established before subscribing to topics
                this.rxStompService.connected$
                    .pipe(takeUntilDestroyed(this.destroyRef)) // automatically unsubscribe on destroy
                    .subscribe(rsStompState => {
                        this.webSocketConnectAndSubscribe();
                        this.triggerPublishConnectionState();
                        this.triggerPublishPowerState();

                        console.log('this.deviceAttributesMap', this.deviceAttributesMap);
                    });
            });

    }

    // code is based on https://github.com/stomp-js/ng2-stompjs-angular7
    private webSocketConnectAndSubscribe(): void {
        // Unsubscribe from previous topic listeners before creating new ones.
        // Otherwise, every reconnection adds a duplicate listener.
        this.subscriptionArray.forEach(sub => sub.unsubscribe());

        Object.keys(this.deviceAttributesMap).forEach(deviceName => {

            // subscribe to POWER state topic
            // console.log(`subscribing to topic: /topic/state-and-telemetry/stat/${deviceName}/POWER`)
            console.log(`subscribing to topic: /topic/${deviceName}/power`)
            // let powerTopicSubscription: Subscription = this.rxStompService.watch(`/topic/state-and-telemetry/stat/${deviceName}/POWER`).subscribe((message: Message) => {
            // let powerTopicSubscription: Subscription = this.rxStompService.watch(`/topic/${deviceName}/power`)
            this.rxStompService.watch(`/topic/${deviceName}/power`)
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe((message: Message) => {
                    console.log('topic: [%s], message: [%s]', message.headers['destination'], message.body)

                    this.deviceAttributesMap[deviceName].powerState = JSON.parse(message.body);
                    this.deviceAttributesMap[deviceName].savedPowerState = JSON.parse(message.body);
                });
            // this.subscriptionArray.push(powerTopicSubscription)

            // subscribe to SENSOR telemetry topic if device is capable of sending telemetry data
            if (this.deviceAttributesMap[deviceName]?.telemetry) {

                console.log(`subscribing to topic: /topic/state-and-telemetry/stat/${deviceName}/SENSOR`)
                // let sensorTopSubscription: Subscription = this.rxStompService.watch(`/topic/state-and-telemetry/tele/${deviceName}/SENSOR`)
                this.rxStompService.watch(`/topic/state-and-telemetry/tele/${deviceName}/SENSOR`)
                    .pipe(takeUntilDestroyed(this.destroyRef))
                    .subscribe((message: Message) => {
                        console.log('topic: [%s], message: [%s]', message.headers['destination'], message.body)
                        this.deviceAttributesMap[deviceName].sensorData = JSON.parse(message.body);
                    });
                // this.subscriptionArray.push(sensorTopSubscription)
            }

            console.log(`subscribing to topic: /topic/${deviceName}/state`)
            // let stateTopicSubscription: Subscription = this.rxStompService.watch(`/topic/${deviceName}/state`)
            this.rxStompService.watch(`/topic/${deviceName}/state`)
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe((message: Message) => {
                    console.log('topic: [%s], message: [%s]', message.headers['destination'], message.body)

                    //this.deviceAttributesMap[deviceName].connectionState = JSON.parse(message.body);
                    this.deviceAttributesMap[deviceName].connectionStateBehaviorSubject.next(JSON.parse(message.body));

                });
            // this.subscriptionArray.push(stateTopicSubscription)

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

            this.deviceAttributesMap[deviceName].connectionStateBehaviorSubject
                .pipe(
                    takeUntilDestroyed(this.destroyRef),
                    distinctUntilChanged((prev, curr) => prev.state === curr.state), // Only fire if state actually changes
                    skip(1) // Ignore the current value emitted on subscribe
                )
                .subscribe((connectionStateResponse: ConnectionStateResponse) => {
                    console.log('deviceName: [%s] connectionStateResponse: [%o]', deviceName, connectionStateResponse)
                    if (connectionStateResponse.state === 'ONLINE') {
                        const deviceNameRequest: DeviceNameRequest = {} as DeviceNameRequest;
                        deviceNameRequest.deviceName = deviceName

                        // trigger publishing power state
                        this.restService.triggerPublishPowerState(deviceNameRequest).pipe(take(1)).subscribe()
                    }
                })
        });
    }

    // ngOnDestroy(): void {
    // }
    private sleep2(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    public ngOnDestroy() {
        this.webSocketUnsubscribeAndDisconnect()
    }
}

