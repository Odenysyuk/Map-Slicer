interface VisualFormat {
    mapLayers: MapLayerFormat;
    sensor: SensorFormat;
    sensorLabel: SensorLabelSettings;
    fromSensor: SensorFormat;
    toSensor: SensorFormat;
    tooltip: TooltipFormat;
}

interface SensorFormat {
    color: string;
    showline: boolean;
    transparency: number;
}

interface MapLayerFormat {
    type: string;
}

interface SensorLabelSettings {
    show?: boolean;
    fontType: string;
    fontSize: number;
    fontColor: string;
    textAlignment: string; 
}

interface TooltipFormat {
    show: boolean;
}