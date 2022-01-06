import { Component, OnInit } from '@angular/core';
import { environment } from '../environments/environment';
import { AppInfoService } from './service/appInfo.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    title = 'hangar-iot-fe';
    clientBuildInfo: string = ''
    serverBuildInfo: string = ''

    constructor(
        private versionService: AppInfoService
    ) { }

    ngOnInit() {
        this.clientBuildInfo = environment.buildVersion + '_' + environment.buildTimestamp;

        this.versionService.getBuildInfo().subscribe({
            next: data => {
                this.serverBuildInfo = data;
                console.log('this.serverBuildInfo: ', this.serverBuildInfo);
            }
        });
    }

}
