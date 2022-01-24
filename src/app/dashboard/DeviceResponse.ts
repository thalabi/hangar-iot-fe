export interface DeviceResponse {
    name: string
    description: string
    location: string
    deviceType: string
    telemetry: boolean
    iotDeviceMake: string
    iotDeviceModel: string
    config: {
        latitudeDegrees: number
        longtitudeDegrees: number
        timezoneOffset: string
        timeDst: string
        timeStd: string
    }
}