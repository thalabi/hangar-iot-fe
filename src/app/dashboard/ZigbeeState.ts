export interface ZigbeeState {
    state?: 'ON' | 'OFF';
    linkquality?: number;
    occupancy?: boolean;
    battery?: number;
    batteryLow?: boolean;
    timestamp: Date;
}
