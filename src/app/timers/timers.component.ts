import { Component, OnDestroy, OnInit } from '@angular/core';
import { RxStompService } from '@stomp/ng2-stompjs';
import { MessageService } from 'primeng/api';
import { BaseComponent } from '../base/base.component';
import { DeviceResponse } from '../dashboard/DeviceResponse';
import { RestService } from '../service/rest.service';
import { Timer } from './Timer';
import { TimersRequestResponse2 } from './TimersRequestResponse2';

@Component({
    selector: 'app-timers',
    templateUrl: './timers.component.html',
    styleUrls: ['./timers.component.css']
})
export class TimersComponent extends BaseComponent implements OnInit, OnDestroy {

    deviceResponseList: Array<DeviceResponse> = {} as Array<DeviceResponse>;
    timersRequestResponse: TimersRequestResponse2 = {} as TimersRequestResponse2
    selectedDevice: string = ''
    timersEnable: boolean = false
    timerTable: Array<Timer> = []
    editingFlag: number = 0

    savedTimers: { [s: string]: Timer; } = {};

    enableDisableTimers: any = [{ label: 'Off', value: 'OFF' }, { label: 'On', value: 'ON' }]

    yesNo: string[] = ['Yes', 'No']
    hours: string[] = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23']
    minutes: string[] = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '50', '51', '52', '53', '54', '55', '56', '57', '58', '59']
    onOff: string[] = ['On', 'Off']
    daysOfWeek: any = [{ name: 'Sunday', code: 'Su' }, { name: 'Monday', code: 'M' }, { name: 'Tuesday', code: 'Tu' }, { name: 'Wednesday', code: 'W' }, { name: 'Thursday', code: 'Th' }, { name: 'Friday', code: 'F' }, { name: 'Saturday', code: 'Sa' }]


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

    ngOnDestroy(): void {
        super.destroy()
    }

    private getTimers() {
        this.restService.getTimers(this.selectedDevice)
            .subscribe((response: TimersRequestResponse2) => {
                this.timersRequestResponse = response
                console.log('timersRequestResponse', this.timersRequestResponse)
                this.transformTimersResponse(this.timersRequestResponse)
            });

    }
    private transformTimersResponse(timersRequestResponse: TimersRequestResponse2) {
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
