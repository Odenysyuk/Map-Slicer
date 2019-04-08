class ColumnView{
    static SensorName: string = "SensorName"
    static Location: string = "Location"
    static toArray() {
        return [
            this.SensorName, 
            this.Location]
    }
}