import { Component, OnInit } from '@angular/core';
import { RxStompService } from '@stomp/ng2-stompjs';
import { RxStompState } from '@stomp/rx-stomp';
import { map, Observable } from 'rxjs';

@Component({
    selector: 'app-status',
    templateUrl: './status.component.html',
    styleUrls: ['./status.component.css']
})
export class StatusComponent implements OnInit {

    public connectionStatus$: Observable<string>;

    constructor(
        public rxStompService: RxStompService
    ) {
        this.connectionStatus$ = rxStompService.connectionState$.pipe(map((state) => {
            // convert numeric RxStompState to string
            return RxStompState[state];
        }));
    }

    ngOnInit(): void {
    }

}
