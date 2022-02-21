import { Component, OnInit } from '@angular/core';
import { CustomUserDetails } from '../login/CustomUserDetails';
import { SessionService } from '../service/session.service';

@Component({
    selector: 'app-menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {

    items: any

    constructor(
        private sessionService: SessionService,
    ) { }

    ngOnInit(): void {
        console.log('ngOnInit()')
        this.sessionService.customUserDetailsBehaviorSubject.subscribe(message => {
            let customUserDetails: CustomUserDetails = message;
            if (customUserDetails?.id) {
                console.log('this.customUserDetails?.id is true')
                this.items = [
                    {
                        label: 'Dashboard', routerLink: ['/home']
                    },
                    {
                        label: 'Devices', routerLink: ['/deviceList']
                    },
                    {
                        label: 'Admin',
                        items: [
                            { label: 'Command', routerLink: ['/executeCommand'] },
                            { label: 'Timers', routerLink: ['/timers'] }
                        ]
                    },
                    {
                        icon: 'pi pi-user',
                        items: [
                            { label: 'Logout', routerLink: [''] }
                        ]
                    },
                ];
            } else {
                this.items = [];
            }
        });
    }

}
