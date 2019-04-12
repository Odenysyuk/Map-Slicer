module powerbi.extensibility.visual {

    /**
     * Interface for SensorNode models
     * 
     * @interface
     */
    export interface SensorNodeModel {
        node: Microsoft.Maps.Pushpin
        label: Microsoft.Maps.Pushpin,
        tooltip: Microsoft.Maps.Pushpin
        data: SlicerMapModel;        
    }    
}