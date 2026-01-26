import { Component, OnInit } from '@angular/core';
import { MessageService, SharedModule } from 'primeng/api';
import { Device } from '../dashboard/Device';
import { RestService } from '../service/rest.service';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';

@Component({
    standalone: true,
    selector: 'app-page1',
    imports: [CommonModule, FormsModule, TableModule],
    templateUrl: './device-list.component.html',
    styleUrls: ['./device-list.component.css']
})
export class DeviceListComponent implements OnInit {
    deviceNameList: Array<string> = []
    deviceList: Array<Device> = []
    constructor(
        private restService: RestService,
        private messageService: MessageService
    ) { }

    ngOnInit(): void {
        console.log('ngOnInit')
        this.messageService.clear()

        this.restService.getDeviceList()
            .subscribe((deviceResponseList: Array<Device>) => {
                console.log('deviceResponseList', deviceResponseList)
                this.deviceList = deviceResponseList
                deviceResponseList.forEach(deviceResponse => {
                    this.deviceNameList.push(deviceResponse.name)
                })
            })
    }

}
