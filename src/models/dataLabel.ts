
module powerbi.extensibility.visual {

    export class DataLabel {

        private labels: IFiledLabel[] = [];

        public push(item: IFiledLabel){
            this.labels.push(item);
        }

        public toString(columnName: string) {
            const data = this.labels.filter(x => x.columnName === columnName);

            if (data.length) {
                return data[0].fieldName + " : " + data[0].value.toString();
            }
            return '';
        }
    }

    /**
     * Interface for Field label
     * 
     * @interface
     * @property {T} [key: string]  - key value
     */
    interface IFiledLabel {
        columnName: string;
        fieldName: string;
        value: any;
    }
}