class ColumnView{
    static sensorName: string = "sensorName"
    static sensor: string = "sensor"
    static fromName: string = "fromName"
    static fromSensor: string = "fromSensor"
    static toName: string = "toName"
    static toSensor: string = "toSensor"
    static toArray() {
        return [
            this.sensorName, 
            this.sensor,
            this.fromName,
            this.fromSensor,
            this.toName,
            this.toSensor
        ]
    }
}