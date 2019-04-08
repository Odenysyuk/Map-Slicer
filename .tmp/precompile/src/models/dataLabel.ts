class DataLabel{
    public columnName: string;
    public fieldName: string;
    public value: any;

    constructor(columnName: string, fieldName: string, value: any) {
        this.columnName = columnName;
        this.fieldName = fieldName;
        this.value = value;
    }
     
    public toString = (): string => {
        return this.fieldName + " : " + this.value.toString();
    }
}