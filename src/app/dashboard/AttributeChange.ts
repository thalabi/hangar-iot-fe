export interface AttributeChange {
    timestamp: Date;
    changes: PropertyChange[];
}

export interface PropertyChange {
    path: string;
    oldValue: any;
    newValue: any;
}
