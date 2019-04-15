module powerbi.extensibility.visual.mapSlicerB1146AB518024EEF8B19C181A7ECC49E  {

    /**
     * Interface for SensorNode models
     * 
     * @interface
     */
    export interface SensorNodeModel {
        node: Microsoft.Maps.Pushpin
        label: Microsoft.Maps.Pushpin,
        tooltip: Microsoft.Maps.Pushpin
        data: NodeModel;        
    }    
}