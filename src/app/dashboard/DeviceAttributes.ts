import { PowerStateResponse } from "./PowerStateResponse";
import { SensorDataResponse } from "./SensorDataResponse";
import { ConnectionStateResponse } from "./ConnectionStateResponse";
import { BehaviorSubject } from "rxjs";
import { Device } from "./Device";

export interface DeviceAttributes {
    device: Device
    // description: string
    // telemetry: boolean
    powerState: PowerStateResponse
    savedPowerState: PowerStateResponse
    sensorData: SensorDataResponse
    connectionStateBehaviorSubject: BehaviorSubject<ConnectionStateResponse>
}