module powerbi.extensibility.visual {
  
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