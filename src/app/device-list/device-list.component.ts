import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Device } from '../dashboard/Device';
import { DeviceResponse } from '../dashboard/DeviceResponse';
import { RestService } from '../service/rest.service';

@Component({
    selector: 'app-page1',
    templateUrl: './device-list.component.html',
    styleUrls: ['./device-list.component.css']
})
export class DeviceListComponent implements OnInit {
    deviceNameList: Array<string> = []
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
                deviceResponseList.forEach(deviceResponse => {
                    this.deviceNameList.push(deviceResponse.name)
                })
            })
    }

}
