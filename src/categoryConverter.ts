module powerbi.extensibility.visual {

    export class ConverterHelper {

        public static Convert(dataView: DataView, host: IVisualHost) {
            if (!dataView ||
                !dataView.categorical ||
                !dataView.categorical.categories ||
                !dataView.categorical.categories[0] ||
                !dataView.categorical.categories[0].values ||
                !(dataView.categorical.categories[0].values.length > 0)) {
                return;
            }

            const categories = dataView.categorical.categories
            const values = dataView.categorical.values;
            let models: NodeModel[] = [];

            for (let c = 0; c < categories.length; c++) {
                const category = categories[c];
                const dataValue = values[c];    

                if(!dataValue){
                    continue;
                }

                for (let i = 0, len = Math.max(category.values.length, dataValue.values.length); i < len; i++) {
                    const model = {
                        value: dataValue.values[i],
                        category: category.values[i],
                    };

                    const existElement = models.filter(elem => {
                        return elem.category === model.category
                            && elem.value === model.value
                    })

                    if (!existElement.length) {
                        models.push(model);
                    }
                }
            }

            return models;
        }

        public static ConvertCategoryNames(dataView: DataView, host: IVisualHost) {
            if (!dataView ||
                !dataView.categorical ||
                !dataView.categorical.categories ||
                !dataView.categorical.categories[0] ||
                !dataView.categorical.categories[0].source) {
                return;
            }

            return dataView.categorical.categories.map(c => c.source.displayName);  
        }

        public static ConvertTableToModel(dv: DataView[], host: IVisualHost): SlicerMapModel[] {
            let viewModel: SlicerMapModel[] = [];

            if (!dv || !dv[0] || !dv[0].table || !dv[0].table.columns || !dv[0].table.rows) {
                return viewModel;
            }

            const { columns, rows } = dv[0].table;
            let columnIndexes: any = columns.map(c => { return { ...c.roles, index: c.index, fieldName: c.displayName }; });

            const identities = this.getSelectionIds(dv[0], host);

            viewModel = rows.map(function (row, idx) {
                let data = {}
                let dataLabels = new DataLabel();
                ColumnView.toArray().forEach(columnName => {
                    var col = columnIndexes.find(x => x[columnName]);
                    if (col) {
                        data[columnName] = row[col.index];

                        dataLabels.push({
                            columnName: columnName,
                            fieldName: col.fieldName,
                            value: row[col.index]
                        });
                    }
                });

                data['dataLabels'] = dataLabels;


                const categoryColumn: DataViewCategoryColumn = {
                    source: dv[0].table.columns[1],
                    values: null,
                    identity: [dv[0].table.identity[idx]]
                };


                data['selectionId'] = identities[idx];

                return data as SlicerMapModel;
            })
            
            return viewModel;
        }

        public static getSelectionIds(dataView: DataView, host: IVisualHost): ISelectionId[] {
            return dataView.table.identity.map((identity, idx) => {
                const categoryColumn: DataViewCategoryColumn = {
                    source: dataView.table.columns[0],
                    values: null,
                    identity: [identity]
                };

                return host.createSelectionIdBuilder()
                    .withCategory(categoryColumn, 0)
                    .createSelectionId();
            });
        }
    }
}