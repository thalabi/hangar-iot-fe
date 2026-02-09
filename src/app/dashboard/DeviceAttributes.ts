import { PowerStateResponse } from "./PowerStateResponse";
import { SensorDataResponse } from "./SensorDataResponse";
import { ConnectionStateResponse } from "./ConnectionStateResponse";
import { BehaviorSubject } from "rxjs";
import { Device } from "./Device";
import { ZigbeeState } from "./ZigbeeState";

export interface DeviceAttributes {
    device: Device
    powerState: PowerStateResponse
    savedPowerState: PowerStateResponse
    sensorData: SensorDataResponse
    connectionStateBehaviorSubject: BehaviorSubject<ConnectionStateResponse>
    zigbeeState: ZigbeeState | null
}