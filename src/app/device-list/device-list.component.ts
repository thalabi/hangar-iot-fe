import { Component, OnInit } from '@angular/core';
import { MessageService, SharedModule } from 'primeng/api';
import { Device } from '../dashboard/Device';
import { RestService } from '../service/rest.service';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';

@Component({
    standalone: true,
    selector: 'app-page1',
    imports: [CommonModule, FormsModule, TableModule, MultiSelectModule],
    templateUrl: './device-list.component.html',
    styleUrls: ['./device-list.component.css']
})
export class DeviceListComponent implements OnInit {
    deviceNameList: Array<string> = []
    deviceList: Array<Device> = []

    allColumns = [
        { field: 'name', header: 'Name' },
        { field: 'make', header: 'Make' },
        { field: 'model', header: 'Model' },
        { field: 'deviceType', header: 'Type' },
        { field: 'bridge', header: 'Bridge' },
        { field: 'description', header: 'Description' },
        { field: 'telemetry', header: 'Telemetry' },
        { field: 'enableDataSaver', header: 'Data saver' },
        { field: 'passive', header: 'Passive' },
        { field: 'isManaged', header: 'Managed' },
    ];
    selectedColumns = this.allColumns; // Start with all visible

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
