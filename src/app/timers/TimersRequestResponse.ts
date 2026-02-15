import { Timer } from "./Timer";

export interface TimersRequestResponse {
    deviceName: string

    timers: string
    timersModified: boolean

    timerArray: Array<Timer>
    timerModifiedArray: Array<boolean>

    timestamp: number
}
