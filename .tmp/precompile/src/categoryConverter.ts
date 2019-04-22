module powerbi.extensibility.visual.mapSlicerB1146AB518024EEF8B19C181A7ECC49E  {

    export class ConverterHelper {

        public static getCategoryIcon(): string[]{
            return ['far fa-circle', 'fas fa-play'];
        }

        public static Convert(dataView: DataView, host: IVisualHost) {
            let models: NodeModel[] = [];
            if (!dataView ||
                !dataView.categorical ||
                !dataView.categorical.categories ||
                !dataView.categorical.categories[0] ||
                !dataView.categorical.values ||
                !(dataView.categorical.values.length > 0)) {
                return models;
            }

            const categories = dataView.categorical.categories
            const values = dataView.categorical.values;            

            for (let c = 0; c < Math.min(categories.length, values.length); c++) {
                const category = categories[c];
                const dataValue = values[c];    

                if(!dataValue){
                    continue;
                }

                for (let i = 0, len = Math.max(category.values.length, dataValue.values.length); i < len; i++) {
                    const model = {
                        location: dataValue.values[i],
                        value: category.values[i],
                    };

                    const existElement = models.filter(elem => {
                        return elem.location === model.location
                            && elem.value === model.value
                    })

                    if (!existElement.length) {
                        models.push(model);
                    }
                }
            }

            return models;
        }

        public static ConvertCategoryNames(dataView: DataView, visualSettings: VisualSettings): CategoryModel[] {
            if (!dataView ||
                !dataView.categorical ||
                !dataView.categorical.categories ||
                !dataView.categorical.categories[0] ||
                !dataView.categorical.categories[0].source) {
                return;
            }

            const categoryFormats = [visualSettings.fromSensor, visualSettings.toSensor];
            const categoryIcons = this.getCategoryIcon();
            return dataView.categorical
                           .categories
                           .map((c, i) => 
                           {
                               return {
                                   icon: categoryIcons[i],
                                   name: c.source.displayName,
                                   format: categoryFormats[i],
                                   column: c.source.displayName,
                                   table: c.source.queryName.substr(0, c.source.queryName.indexOf('.'))
                                }
                           });  
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