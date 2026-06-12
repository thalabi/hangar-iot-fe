import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SharedModule } from 'primeng/api';
import { MessagesModule } from 'primeng/messages';
import { PopoverModule } from 'primeng/popover';
import { AuthService } from './auth/auth.service';
import { BackendStacktraceDisplayComponent } from './backend-stacktrace-display/backend-stacktrace-display.component';
import { MenuComponent } from './menu/menu.component';
import { AppInfoService } from './service/appInfo.service';
import { SessionService } from './service/session.service';
import { environment } from '../environments/environment';
import { OverlayModule } from 'primeng/overlay';

@Component({
    standalone: true,
    selector: 'app-root',
    imports: [MessagesModule, RouterOutlet, PopoverModule, SharedModule, OverlayModule, BackendStacktraceDisplayComponent, MenuComponent /*, ButtonModule*/],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
    title = 'iot-fe';
    clientBuildInfo: string = ''
    serverBuildInfo: string = ''


    disableParentMessages: boolean = false;

    constructor(
        private versionService: AppInfoService, private authService: AuthService, private sessionService: SessionService
    ) { }

    ngOnInit() {
        this.clientBuildInfo = environment.buildVersion + '_' + environment.buildTimestamp;

        this.versionService.getBuildInfo().subscribe({
            next: data => {
                this.serverBuildInfo = data;
                console.log('this.serverBuildInfo: ', this.serverBuildInfo);
            }
        });

        this.sessionService.disableParentMessages$.subscribe(data => this.disableParentMessages = data)

    }

}
