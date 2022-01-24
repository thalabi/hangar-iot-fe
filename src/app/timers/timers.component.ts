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
    selectedDevice: string = ''
    timersEnable: string = ''
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
            .subscribe((timersRequestResponse: TimersRequestResponse) => {
                console.log('timersRequestResponse', timersRequestResponse)
                this.transformTimersResponse(timersRequestResponse)
            });

    }

    onRowEditInit(timer: Timer) {
        this.savedTimers[timer.id] = timer
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
        const timersRequestResponse: TimersRequestResponse = {} as TimersRequestResponse
        timersRequestResponse.deviceName = this.selectedDevice;
        timersRequestResponse.timers = this.timersEnable
        timersRequestResponse.timer1 = this.timerTable[0]
        timersRequestResponse.timer2 = this.timerTable[1]
        timersRequestResponse.timer3 = this.timerTable[2]
        timersRequestResponse.timer4 = this.timerTable[3]
        timersRequestResponse.timer5 = this.timerTable[4]
        timersRequestResponse.timer6 = this.timerTable[5]
        timersRequestResponse.timer7 = this.timerTable[6]
        timersRequestResponse.timer8 = this.timerTable[7]
        timersRequestResponse.timer9 = this.timerTable[8]
        timersRequestResponse.timer10 = this.timerTable[9]
        timersRequestResponse.timer11 = this.timerTable[10]
        timersRequestResponse.timer12 = this.timerTable[11]
        timersRequestResponse.timer13 = this.timerTable[12]
        timersRequestResponse.timer14 = this.timerTable[13]
        timersRequestResponse.timer15 = this.timerTable[14]
        timersRequestResponse.timer16 = this.timerTable[15]
        console.log('timersRequestResponse', timersRequestResponse)

        this.restService.setTimers(timersRequestResponse)
            .subscribe((response: any) => {
                console.log('response', response)
            })
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Timers updated' });

    }

    private transformTimersResponse(timersRequestResponse: TimersRequestResponse) {
        this.timersEnable = timersRequestResponse.timers
        this.timerTable[0] = timersRequestResponse.timer1
        this.timerTable[1] = timersRequestResponse.timer2
        this.timerTable[2] = timersRequestResponse.timer3
        this.timerTable[3] = timersRequestResponse.timer4
        this.timerTable[4] = timersRequestResponse.timer5
        this.timerTable[5] = timersRequestResponse.timer6
        this.timerTable[6] = timersRequestResponse.timer7
        this.timerTable[7] = timersRequestResponse.timer8
        this.timerTable[8] = timersRequestResponse.timer9
        this.timerTable[9] = timersRequestResponse.timer10
        this.timerTable[10] = timersRequestResponse.timer11
        this.timerTable[11] = timersRequestResponse.timer12
        this.timerTable[12] = timersRequestResponse.timer13
        this.timerTable[13] = timersRequestResponse.timer14
        this.timerTable[14] = timersRequestResponse.timer15
        this.timerTable[15] = timersRequestResponse.timer16
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
}
