import { Component, OnInit } from '@angular/core';
import { Device } from '../dashboard/Device';
import { DeviceResponse } from '../dashboard/DeviceResponse';
import { RestService } from '../service/rest.service';

@Component({
    selector: 'app-page1',
    templateUrl: './page1.component.html',
    styleUrls: ['./page1.component.css']
})
export class Page1Component implements OnInit {
    deviceNameList: Array<string> = []
    constructor(
        private restService: RestService,
    ) { }

    ngOnInit(): void {
        console.log('ngOnInit')

        this.restService.getDeviceList()
            .subscribe((deviceResponseList: Array<DeviceResponse>) => {
                console.log('deviceResponseList', deviceResponseList)
                deviceResponseList.forEach(deviceResponse => {
                    this.deviceNameList.push(deviceResponse.name)
                })
            })
    }

}
