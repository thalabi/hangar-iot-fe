import { Component, DestroyRef, inject, OnDestroy, OnInit } from '@angular/core';
import { RxStompService } from '@stomp/ng2-stompjs';
import { MessageService } from 'primeng/api';
import { BaseComponent } from '../base/base.component';
import { Device } from '../dashboard/Device';
import { RestService } from '../service/rest.service';
import { Timer } from './Timer';
import { TimersRequestResponse } from './TimersRequestResponse';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DeviceAttributes } from '../dashboard/DeviceAttributes';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BehaviorSubject } from 'rxjs';
import { ConnectionStateResponse } from '../dashboard/ConnectionStateResponse';
import { PowerStateResponse } from '../dashboard/PowerStateResponse';
import { SensorDataResponse } from '../dashboard/SensorDataResponse';
import { Message } from '@stomp/stompjs';
import { DeviceNameRequest } from '../dashboard/DeviceNameRequest';

@Component({
    standalone: true,
    selector: 'app-timers',
    imports: [CommonModule, FormsModule, SelectModule, ButtonModule, TableModule, MultiSelectModule],
    templateUrl: './timers.component.html',
    styleUrls: ['./timers.component.css']
})
export class TimersComponent /*extends BaseComponent*/ implements OnInit /*, OnDestroy*/ {

    destroyRef = inject(DestroyRef);

    deviceResponseList: Array<Device> = {} as Array<Device>;
    deviceAttributesMap: Record<string, DeviceAttributes> = {} as any;

    timersRequestResponse: TimersRequestResponse = {} as TimersRequestResponse
    selectedDevice: string = ''
    timersEnable: boolean = false
    timerTable: Array<Timer> = []
    editingFlag: number = 0

    savedTimers: { [s: string]: Timer; } = {};

    enableDisableTimers: any = [{ label: 'Off', value: 'OFF' }, { label: 'On', value: 'ON' }]

    // yesNo: string[] = ['Yes', 'No']
    yesNo = [
        { label: 'Yes', value: 'Yes' },
        { label: 'No', value: 'No' }
    ];
    // onOff: string[] = ['On', 'Off']
    onOff = [
        { label: 'On', value: 'On' },
        { label: 'Off', value: 'Off' }
    ];

    // minutes: string[] = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '50', '51', '52', '53', '54', '55', '56', '57', '58', '59']
    minutes = Array.from({ length: 60 }, (_, i) => {
        const m = i.toString().padStart(2, '0');
        return { label: m, value: m };
    });
    // hours: string[] = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23']
    hours = Array.from({ length: 24 }, (_, i) => {
        const h = i.toString().padStart(2, '0');
        return { label: h, value: h };
    });
    daysOfWeek = [
        { name: 'Sunday', code: 'Su' },
        { name: 'Monday', code: 'M' },
        { name: 'Tuesday', code: 'Tu' },
        { name: 'Wednesday', code: 'W' },
        { name: 'Thursday', code: 'Th' },
        { name: 'Friday', code: 'F' },
        { name: 'Saturday', code: 'Sa' }
    ];

    constructor(
        // protected override restService: RestService,
        // protected override rxStompService: RxStompService,
        private restService: RestService,
        private rxStompService: RxStompService,
        private messageService: MessageService
    ) {
        // super(restService, rxStompService);
    }

    // override ngOnInit(): void {
    ngOnInit(): void {
        console.log('ngOnInit')
        this.messageService.clear()

        // super.ngOnInit()
        this.restService.getDeviceList()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((deviceResponseList: Array<Device>) => {
                console.log('deviceResponseList', deviceResponseList)
                //this.deviceResponseList = deviceResponseList
                this.populateTasmotaDeviceAttributesMap(deviceResponseList);
                // this.populateZoneAndAreaMaps(deviceResponseList);

                this.rxStompService.activate();

                // wait for connection to be established before subscribing to topics
                this.rxStompService.connected$
                    .pipe(takeUntilDestroyed(this.destroyRef)) // automatically unsubscribe on destroy
                    .subscribe(rsStompState => {
                        this.webSocketConnectAndSubscribe();
                        this.publishConnectionState();
                        // this.triggerPublishState();

                        console.log('this.deviceAttributesMap', this.deviceAttributesMap);
                        // console.log('this.groupedDeviceAttributesMap', this.groupedDeviceAttributesMap);
                        // console.log('this.zoneDeviceAttributesMap', this.zoneSensorDeviceAttributesMap);
                    });
            });

    }
    private populateTasmotaDeviceAttributesMap(deviceResponseList: Array<Device>) {
        deviceResponseList.forEach(deviceResponse => {
            if (deviceResponse.bridge === 'TASMOTA') {
                this.deviceAttributesMap[deviceResponse.name] = { device: deviceResponse, powerState: {} as PowerStateResponse, savedPowerState: {} as PowerStateResponse, sensorData: {} as SensorDataResponse, connectionStateBehaviorSubject: new BehaviorSubject<ConnectionStateResponse>({} as ConnectionStateResponse), zigbeeState: null, espresenseState: null, attributeChanges: null } as DeviceAttributes;
            }

        });
    }
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
                    // this.deviceAttributesMap[deviceName].savedPowerState = JSON.parse(message.body);
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

            // // subscribe to zigbee2mqtt state topic
            // if (this.deviceAttributesMap[deviceName]?.device.bridge === 'ZIGBEE2MQTT') {
            //     console.log(`subscribing to topic: /topic/zigbee2mqtt/${deviceName}`)
            //     this.rxStompService.watch(`/topic/zigbee2mqtt/${deviceName}`)
            //         .pipe(takeUntilDestroyed(this.destroyRef))// automatically unsubscribe on destroy
            //         .subscribe((message: Message) => {
            //             console.log('topic: [%s], message: [%s]', message.headers['destination'], message.body)
            //             // 1. Parse the string body into a JSON object
            //             // 2. Assert it matches your ZigbeeState interface
            //             const zigbeeState = JSON.parse(message.body) as ZigbeeState;
            //             this.deviceAttributesMap[deviceName].zigbeeState = zigbeeState;
            //         });
            // }
        })

    }
    private publishConnectionState() {
        console.log('publishConnectionState()')

        Object.keys(this.deviceAttributesMap).forEach(deviceName => {
            const deviceNameRequest: DeviceNameRequest = {} as DeviceNameRequest;
            deviceNameRequest.deviceName = deviceName

            this.restService.publishConnectionState(deviceNameRequest).subscribe()
        })
    }

    onSelectDevice(event: any) {
        console.log('this.selectedDevice', this.selectedDevice)
        if (this.deviceAttributesMap[this.selectedDevice]?.connectionStateBehaviorSubject?.getValue().state === 'ONLINE') {
            this.getTimers()
        }
    }

    onRowEditInit(timer: Timer) {
        this.savedTimers[timer.id] = { ...timer }
        this.editingFlag++

    }

    onRowEditSave(timer: Timer) {
        // save timer
        timer.enable = timer.enableUi === 'Yes' ? 1 : 0
        timer.time = timer.timeHh + ":" + timer.timeMm
        timer.days = ''
        timer.days += timer.daysUi.includes('Su') ? '1' : '0'
        timer.days += timer.daysUi.includes('M') ? '1' : '0'
        timer.days += timer.daysUi.includes('Tu') ? '1' : '0'
        timer.days += timer.daysUi.includes('W') ? '1' : '0'
        timer.days += timer.daysUi.includes('Th') ? '1' : '0'
        timer.days += timer.daysUi.includes('F') ? '1' : '0'
        timer.days += timer.daysUi.includes('Sa') ? '1' : '0'
        timer.action = timer.actionUi === 'On' ? 1 : 0
        console.log('timer', timer)
        console.log('this.timerTable', this.timerTable)
        delete this.savedTimers[timer.id];
        this.editingFlag--
    }

    onRowEditCancel(timer: Timer, index: number) {
        this.timerTable[index] = this.savedTimers[timer.id];
        delete this.savedTimers[timer.id];
        this.editingFlag--
    }

    onSave(event: any) {
        console.log('onSave')
        this.timerTable.forEach(timerTable => {
            if (timerTable.enable === 1) {
                timerTable.repeat = 1
            } else {
                timerTable.repeat = 0
            }
        })
        this.timersRequestResponse.deviceName = this.selectedDevice;

        console.log('timersRequestResponse before', this.timersRequestResponse)
        if ((this.timersRequestResponse.timers === "ON") !== this.timersEnable) {
            this.timersRequestResponse.timers = this.timersEnable ? "ON" : "OFF"
            this.timersRequestResponse.timersModified = true
        } else {
            this.timersRequestResponse.timersModified = false
        }

        this.timersRequestResponse.timerModifiedArray = new Array()

        for (let i: number = 0; i < 16; i++) {

            if (!this.timerEqual(this.timersRequestResponse.timerArray[i], this.timerTable[i])) {
                this.timersRequestResponse.timerArray[i] = this.timerTable[i]
                this.timersRequestResponse.timerModifiedArray[i] = true
            } else {
                this.timersRequestResponse.timerModifiedArray[i] = false
            }
        }
        console.log('timersRequestResponse after', this.timersRequestResponse)

        this.messageService.clear()
        let response: string = ''
        this.restService.setTimers(this.timersRequestResponse)
            .subscribe(
                {
                    next: (resp: string) => {
                        response = resp
                        console.log(response)
                    },
                    complete: () => {
                        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Timers updated' });
                        this.getTimers()
                    },
                    error: () => {
                        this.messageService.add({ severity: 'error', summary: 'Timers failed to update', detail: response });
                        // exception handled by http-error-interceptor
                        this.getTimers()
                    }
                })


    }

    // override ngOnDestroy(): void {
    ngOnDestroy(): void {
        // super.ngOnDestroy()
        console.log('webSocketCleanup()')
        console.log('this.rxStompService.deactivate()')
        this.rxStompService.deactivate()
        console.log('connected?', this.rxStompService.connected())
    }
    // }

    private getTimers() {
        this.restService.getTimers(this.selectedDevice)
            .subscribe((response: TimersRequestResponse) => {
                this.timersRequestResponse = response
                console.log('timersRequestResponse', this.timersRequestResponse)
                this.transformTimersResponse(this.timersRequestResponse)
            });

    }
    private transformTimersResponse(timersRequestResponse: TimersRequestResponse) {
        console.log('timersRequestResponse.timers', timersRequestResponse.timers)
        this.timersEnable = timersRequestResponse.timers === "ON"
        for (let i: number = 0; i < 16; i++) {
            this.timerTable[i] = { ...timersRequestResponse.timerArray[i] }
        }

        let i = 0
        this.timerTable.forEach(timer => {
            timer.id = ++i
            timer.enableUi = timer.enable === 1 ? 'Yes' : 'No'
            timer.timeHh = timer.time.substring(0, 2)
            timer.timeMm = timer.time.substring(3, 5)
            timer.daysUi = []
            if (timer.days[0] === '1') {
                timer.daysUi.push('Su')
            }
            if (timer.days[1] === '1') {
                timer.daysUi.push('M')
            }
            if (timer.days[2] === '1') {
                timer.daysUi.push('Tu')
            }
            if (timer.days[3] === '1') {
                timer.daysUi.push('W')
            }
            if (timer.days[4] === '1') {
                timer.daysUi.push('Th')
            }
            if (timer.days[5] === '1') {
                timer.daysUi.push('F')
            }
            if (timer.days[6] === '1') {
                timer.daysUi.push('Sa')
            }
            timer.actionUi = timer.action === 1 ? 'On' : 'Off'
        })
        console.log('timerTable', this.timerTable)
    }

    private timerEqual(timer1: Timer, timer2: Timer): boolean {
        if (timer1.enable === timer2.enable && timer1.time === timer2.time && timer1.days === timer2.days && timer1.action === timer2.action) {
            return true
        } else {
            return false
        }
    }
}
