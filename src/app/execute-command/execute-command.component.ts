import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Device } from '../dashboard/Device';
import { RestService } from '../service/rest.service';
import { CommandResponse } from './CommandResponse';
import { FreeFormatCommandRequest } from './FreeFormatCommandRequest';
import { CommonModule } from '@angular/common';
import { FieldsetModule } from 'primeng/fieldset'
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';

@Component({
    standalone: true,
    selector: 'app-execute-command',
    imports: [CommonModule, FormsModule, SelectModule, FieldsetModule, ButtonModule],
    templateUrl: './execute-command.component.html',
    styleUrls: ['./execute-command.component.css']
})
export class ExecuteCommandComponent implements OnInit {

    deviceResponseList: Array<Device> = []//{} as Array<DeviceResponse>;
    commandResponseList: Array<CommandResponse> = []//{} as Array<CommandResponse>;
    deviceList: string[] = []
    commandList: string[] = []
    selectedDevice: string = ''
    selectedCommand: string = ''
    arguments: string = ''
    commandResult: string = ''

    htmlSnippetDisabled = true

    constructor(
        private restService: RestService,
        private messageService: MessageService
    ) { }

    ngOnInit(): void {
        console.log('ngOnInit')
        this.messageService.clear()
        console.log('this.deviceList', this.deviceList)
        console.log('this.commandList', this.commandList)



        this.restService.getDeviceList()
            .subscribe((deviceResponseList: Array<Device>) => {
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
        this.commandResult = ''
    }
    onSelectCommand(event: any) {
        console.log('this.selectedCommand', this.selectedCommand)
        this.commandResult = ''
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
