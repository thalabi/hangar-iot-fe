export interface Device {
    name: string
    description: string
    deviceType: string
    telemetry: boolean
    make: string
    model: string
    enableDataSaver: boolean
    deviceConfig: {
        latitudeDegrees: number
        longtitudeDegrees: number
        timezoneOffset: string
        timeDst: string
        timeStd: string
    }
    location: string
    bridge: string
    passive: boolean
    isManaged: boolean
}