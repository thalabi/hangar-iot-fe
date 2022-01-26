import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { DeviceResponse } from '../dashboard/DeviceResponse';
import { RestService } from '../service/rest.service';
import { Timer } from './Timer';
import { TimersRequestResponse } from './TimersRequestResponse';

@Component({
    selector: 'app-timers',
    templateUrl: './timers.component.html',
    styleUrls: ['./timers.component.css']
})
export class TimersComponent implements OnInit {

    deviceResponseList: Array<DeviceResponse> = {} as Array<DeviceResponse>;
    timersRequestResponse: TimersRequestResponse = {} as TimersRequestResponse
    selectedDevice: string = ''
    timersEnable: boolean = false
    timerTable: Array<Timer> = []
    editingFlag: number = 0

    savedTimers: { [s: string]: Timer; } = {};

    enableDisableTimers: any = [{ label: 'Off', value: 'OFF' }, { label: 'On', value: 'ON' }]

    yesNo: string[] = ['Yes', 'No']
    hours: string[] = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23']
    minutes: string[] = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '50', '51', '52', '53', '54', '55', '56', '57', '58', '59']
    onOff: string[] = ['On', 'Off']
    daysOfWeek: any = [{ name: 'Sunday', code: 'Su' }, { name: 'Monday', code: 'M' }, { name: 'Tuesday', code: 'Tu' }, { name: 'Wednesday', code: 'W' }, { name: 'Thursday', code: 'Th' }, { name: 'Friday', code: 'F' }, { name: 'Saturday', code: 'Sa' }]


    constructor(
        private restService: RestService,
        private messageService: MessageService
    ) { }

    ngOnInit(): void {
        console.log('ngOnInit')
        this.messageService.clear()

        this.restService.getDeviceList()
            .subscribe((deviceResponseList: Array<DeviceResponse>) => {
                console.log('deviceResponseList', deviceResponseList)
                this.deviceResponseList = deviceResponseList
            });
    }

    onSelectDevice(event: any) {
        console.log('this.selectedDevice', this.selectedDevice)
        this.restService.getTimers(this.selectedDevice)
            .subscribe((response: TimersRequestResponse) => {
                this.timersRequestResponse = response
                console.log('timersRequestResponse', this.timersRequestResponse)
                this.transformTimersResponse(this.timersRequestResponse)
            });

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
        }

        console.log('this.timersRequestResponse.timer1', this.timersRequestResponse.timer1, 'this.timerTable[0]', this.timerTable[0])
        if (!this.timerEqual(this.timersRequestResponse.timer1, this.timerTable[0])) {
            this.timersRequestResponse.timer1 = this.timerTable[0]
            this.timersRequestResponse.timer1Modified = true
        } else {
            this.timersRequestResponse.timer1Modified = false
        }
        if (!this.timerEqual(this.timersRequestResponse.timer2, this.timerTable[1])) {
            this.timersRequestResponse.timer2 = this.timerTable[1]
            this.timersRequestResponse.timer2Modified = true
        } else {
            this.timersRequestResponse.timer2Modified = false
        }
        if (!this.timerEqual(this.timersRequestResponse.timer3, this.timerTable[2])) {
            this.timersRequestResponse.timer3 = this.timerTable[2]
            this.timersRequestResponse.timer3Modified = true
        } else {
            this.timersRequestResponse.timer3Modified = false
        }
        if (!this.timerEqual(this.timersRequestResponse.timer4, this.timerTable[3])) {
            this.timersRequestResponse.timer4 = this.timerTable[3]
            this.timersRequestResponse.timer4Modified = true
        } else {
            this.timersRequestResponse.timer4Modified = false
        }
        if (!this.timerEqual(this.timersRequestResponse.timer5, this.timerTable[4])) {
            this.timersRequestResponse.timer5 = this.timerTable[4]
            this.timersRequestResponse.timer5Modified = true
        } else {
            this.timersRequestResponse.timer5Modified = false
        }
        if (!this.timerEqual(this.timersRequestResponse.timer6, this.timerTable[5])) {
            this.timersRequestResponse.timer6 = this.timerTable[5]
            this.timersRequestResponse.timer6Modified = true
        } else {
            this.timersRequestResponse.timer6Modified = false
        }
        if (!this.timerEqual(this.timersRequestResponse.timer7, this.timerTable[6])) {
            this.timersRequestResponse.timer7 = this.timerTable[6]
            this.timersRequestResponse.timer7Modified = true
        } else {
            this.timersRequestResponse.timer7Modified = false
        }
        if (!this.timerEqual(this.timersRequestResponse.timer8, this.timerTable[7])) {
            this.timersRequestResponse.timer8 = this.timerTable[7]
            this.timersRequestResponse.timer8Modified = true
        } else {
            this.timersRequestResponse.timer8Modified = false
        }
        if (!this.timerEqual(this.timersRequestResponse.timer9, this.timerTable[8])) {
            this.timersRequestResponse.timer9 = this.timerTable[8]
            this.timersRequestResponse.timer9Modified = true
        } else {
            this.timersRequestResponse.timer9Modified = false
        }
        if (!this.timerEqual(this.timersRequestResponse.timer10, this.timerTable[9])) {
            this.timersRequestResponse.timer10 = this.timerTable[9]
            this.timersRequestResponse.timer10Modified = true
        } else {
            this.timersRequestResponse.timer10Modified = false
        }
        if (!this.timerEqual(this.timersRequestResponse.timer11, this.timerTable[10])) {
            this.timersRequestResponse.timer11 = this.timerTable[10]
            this.timersRequestResponse.timer11Modified = true
        } else {
            this.timersRequestResponse.timer11Modified = false
        }
        if (!this.timerEqual(this.timersRequestResponse.timer12, this.timerTable[11])) {
            this.timersRequestResponse.timer12 = this.timerTable[11]
            this.timersRequestResponse.timer12Modified = true
        } else {
            this.timersRequestResponse.timer12Modified = false
        }
        if (!this.timerEqual(this.timersRequestResponse.timer13, this.timerTable[12])) {
            this.timersRequestResponse.timer13 = this.timerTable[12]
            this.timersRequestResponse.timer13Modified = true
        } else {
            this.timersRequestResponse.timer13Modified = false
        }
        if (!this.timerEqual(this.timersRequestResponse.timer14, this.timerTable[13])) {
            this.timersRequestResponse.timer14 = this.timerTable[13]
            this.timersRequestResponse.timer14Modified = true
        } else {
            this.timersRequestResponse.timer14Modified = false
        }
        if (!this.timerEqual(this.timersRequestResponse.timer15, this.timerTable[14])) {
            this.timersRequestResponse.timer15 = this.timerTable[14]
            this.timersRequestResponse.timer15Modified = true
        } else {
            this.timersRequestResponse.timer15Modified = false
        }
        if (!this.timerEqual(this.timersRequestResponse.timer16, this.timerTable[15])) {
            this.timersRequestResponse.timer16 = this.timerTable[15]
            this.timersRequestResponse.timer16Modified = true
        } else {
            this.timersRequestResponse.timer16Modified = false
        }
        console.log('timersRequestResponse after', this.timersRequestResponse)

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
                    },
                    error: () => {
                        this.messageService.add({ severity: 'error', summary: 'Timers failed to update', detail: response });
                        // exception handled by http-error-interceptor
                    }
                })


    }

    private transformTimersResponse(timersRequestResponse: TimersRequestResponse) {
        this.timersEnable = timersRequestResponse.timers === "ON"
        this.timerTable[0] = { ...timersRequestResponse.timer1 }
        this.timerTable[1] = { ...timersRequestResponse.timer2 }
        this.timerTable[2] = { ...timersRequestResponse.timer3 }
        this.timerTable[3] = { ...timersRequestResponse.timer4 }
        this.timerTable[4] = { ...timersRequestResponse.timer5 }
        this.timerTable[5] = { ...timersRequestResponse.timer6 }
        this.timerTable[6] = { ...timersRequestResponse.timer7 }
        this.timerTable[7] = { ...timersRequestResponse.timer8 }
        this.timerTable[8] = { ...timersRequestResponse.timer9 }
        this.timerTable[9] = { ...timersRequestResponse.timer10 }
        this.timerTable[10] = { ...timersRequestResponse.timer11 }
        this.timerTable[11] = { ...timersRequestResponse.timer12 }
        this.timerTable[12] = { ...timersRequestResponse.timer13 }
        this.timerTable[13] = { ...timersRequestResponse.timer14 }
        this.timerTable[14] = { ...timersRequestResponse.timer15 }
        this.timerTable[15] = { ...timersRequestResponse.timer16 }
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
