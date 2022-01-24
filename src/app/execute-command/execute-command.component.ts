import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { DeviceResponse } from '../dashboard/DeviceResponse';
import { RestService } from '../service/rest.service';
import { CommandResponse } from './CommandResponse';
import { FreeFormatCommandRequest } from './FreeFormatCommandRequest';

@Component({
    selector: 'app-execute-command',
    templateUrl: './execute-command.component.html',
    styleUrls: ['./execute-command.component.css']
})
export class ExecuteCommandComponent implements OnInit {

    deviceResponseList: Array<DeviceResponse> = {} as Array<DeviceResponse>;
    commandResponseList: Array<CommandResponse> = {} as Array<CommandResponse>;
    deviceList: string[] = []
    commandList: string[] = []
    selectedDevice: string = ''
    selectedCommand: string = ''
    arguments: string = ''
    commandResult: string = ''

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
                this.deviceResponseList.forEach(deviceResponse => {
                    this.deviceList.push(deviceResponse.name)
                })
            });

        this.restService.getCommandList()
            .subscribe((commandResponseList: Array<CommandResponse>) => {
                console.log('commandResponseList', commandResponseList)
                this.commandResponseList = commandResponseList
                this.commandResponseList.forEach(commandResponse => {
                    this.commandList.push(commandResponse.command)
                })
            });
    }

    onSelectDevice(event: any) {
        console.log('this.selectedDevice', this.selectedDevice)
    }
    onSelectCommand(event: any) {
        console.log('this.selectedCommand', this.selectedCommand)
    }
    onSubmit(event: any) {
        console.log('this.arguments', this.arguments)

        const ffr: FreeFormatCommandRequest = { deviceName: this.selectedDevice, command: this.selectedCommand, arguments: this.arguments }
        this.restService.executeFreeFormatCommand(ffr)
            .subscribe((response: any) => {
                console.log('response', response)
                delete response.timestamp;
                this.commandResult = response
            })
    }
}
