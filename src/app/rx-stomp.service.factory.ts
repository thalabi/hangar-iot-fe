import { RxStompService } from '@stomp/ng2-stompjs';
import { rxStompConfig } from './rx-stomp.config';

export function rxStompServiceFactory() {
    const rxStompService = new RxStompService();
    rxStompService.configure(rxStompConfig);
    rxStompService.activate();
    return rxStompService;
}
