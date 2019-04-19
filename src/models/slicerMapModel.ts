module powerbi.extensibility.visual {

    /**
     * Interface for SlicerMap models
     * 
     * @interface
     * @property {string} SensorName        - Sensor name
     * @property {string} Sensor            - Sensor point
     * @property {string} FromName          - From sensor name
     * @property {string} FromSensor        - From sensor point
     * @property {string} ToName            - To sensor name    
     * @property {string} ToSensor          - To sensor name
     * @property {ISelectionId} selectionId - Id assigned to data point for cross filtering
     * @property {DataLabel} dataLabels   - Collection of 
     * 
     *                                        and visual interaction.
     */
    export interface SlicerMapModel{
        sensorName: string;
        sensor:string;
        fromName: string;
        fromSensor:string;
        toName: string;
        toSensor:string;
        dataLabels: DataLabel;
        selectionId: ISelectionId;
    } 
    
    export interface NodeModel {
        value: PrimitiveValue;
        location: PrimitiveValue;
    }  

    export interface NodeSlicerModel {
        nodes: NodeModel[];
        selectionId: ISelectionId;
    } 

    export interface CategoryModel {
        icon: string;
        name: string;
        format: SensorSettings;
        column: string;
        table: string;
    } 
}