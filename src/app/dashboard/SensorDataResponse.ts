export interface SensorDataResponse {
    Time: Date //    "2021-12-15T20:43:40"
    ENERGY: {
        TotalStartTime: Date //"2021-12-11T01:58:25",
        Total: number // kWh
        Yesterday: number // kWh
        Today: number // kWh
        Period: number
        Power: number // Watts
        ApparentPower: number
        ReactivePower: number
        Factor: number
        Voltage: number // Volts
        Current: number // Amps
    }
}