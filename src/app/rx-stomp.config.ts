import { InjectableRxStompConfig } from '@stomp/ng2-stompjs';
import { environment } from '../environments/environment';
import { SessionService } from './service/session.service';


export class RxStompConfig extends InjectableRxStompConfig {
    constructor(/*private sessionService: SessionService*/) {
        super()

        // let token: string = ''
        // this.sessionService.tokenObservable.subscribe(message => token = message)
        // console.log('token before setting in websocket header', token)


        // Which server?
        this.brokerURL = environment.websocketUrl

        // Headers
        // Typical keys: login, passcode, host
        // connectHeaders: {
        //     login: 'guest',
        //     passcode: 'guest'
        // },

        // How often to heartbeat?
        // Interval in milliseconds, set to 0 to disable
        this.heartbeatIncoming = 0 // Typical value 0 - disabled
        this.heartbeatOutgoing = 0 // Typical value 20000 - every 20 seconds

        // Wait in milliseconds before attempting auto reconnect
        // Set to 0 to disable
        // Typical value 5000 (5 seconds)
        this.reconnectDelay = 200

        // Will log diagnostics on console
        // It can be quite verbose, not recommended in production
        // Skip this key to stop logging to console
        this.debug = (msg: string): void => {
            console.log(new Date(), msg);
        }

        // Below code does not work in setting the header

        // this.beforeConnect = (stompClient: any): Promise<void> => {
        //     console.log('beforeConnect')
        //     console.log('stompClient', stompClient)
        //     return new Promise<void>((resolve, _) => {
        //         let token: string = ''
        //         this.sessionService.tokenObservable.subscribe(message => token = message)
        //         console.log('token before setting in websocket header', token)
        //         stompClient.connectHeaders = {
        //             Authorization: `Bearer ${token}`

        //         }
        //         resolve();
        //     })
        // }
    }
};