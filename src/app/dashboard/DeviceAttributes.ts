import { PowerStateResponse } from "./PowerStateResponse";
import { SensorDataResponse } from "./SensorDataResponse";

export interface DeviceAttributes {
    description: string
    powerState: PowerStateResponse
    sensorData: SensorDataResponse
}