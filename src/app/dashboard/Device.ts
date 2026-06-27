import { Zone } from "./Zone"
import { Area } from "./Area"

export interface Device {
    name: string
    address: string
    description: string
    deviceType: string
    telemetry: boolean
    make: string
    model: string
    enableDataSaver: boolean
    location: string
    bridge: string
    passive: boolean
    isManaged: boolean
    zone: Zone | null
    area: Area | null
}