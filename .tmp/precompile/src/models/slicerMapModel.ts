module powerbi.extensibility.visual.mapSlicerB1146AB518024EEF8B19C181A7ECC49E  {
  
    export interface NodeModel {
        value: PrimitiveValue;
        location: PrimitiveValue;
    }  

    export interface CategoryModel {
        icon: string;
        name: string;
        format: SensorSettings;
        column: string;
        table: string;
    } 

    export interface ISliceFilter extends IBasicFilter {
        target:IFilterColumnTarget;
    }
}