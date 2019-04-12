/*
 *  Power BI Visual CLI
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */
module powerbi.extensibility.visual.mapSlicerB1146AB518024EEF8B19C181A7ECC49E  {
    "use strict";

    // export interface IFilter{
    //     $schema: string;
    //     target: IFilterTarget;
    // }

    export interface IBasicFilter extends IFilter {
        operator: BasicFilterOperators;
        values: (string | number | boolean)[];
    }

    import ISelectionId = powerbi.visuals.ISelectionId;

    export class Visual implements IVisual {        
        private map: Microsoft.Maps.Map;
        private divMap: d3.Selection<HTMLElement>;
        private viewModel: SlicerMapModel[];
        private visualSettings: VisualSettings;
        private host: powerbi.extensibility.visual.IVisualHost;
        private selectionIdBuilder: ISelectionIdBuilder;
        private selectionManager: ISelectionManager;
        private loadedMap: boolean;
        private mapController: BingMapController;

        constructor(options: VisualConstructorOptions) {  
            this.host = options.host;
            this.selectionIdBuilder = options.host.createSelectionIdBuilder();
            this.selectionManager = options.host.createSelectionManager();
          //  this.mapController = new BingMapController(this.selectionManager);
            
            this.divMap = d3.select(options.element)            
                .append('div')
                .classed('map', true)
                .attr({ id: "map_id" });  

            const data = ['From', 'To'];
            
            let row =   d3.select(options.element)
                          .append('div')
                          .classed('row', true)
                          .attr({ id: "container" }); ;  

            var checkBoxesData = row.selectAll(".checkboxes")
                                .append("label")
                                .classed('row', true)
                                .data(data)

            var checkBoxes = checkBoxesData
                                .enter()
                                .append("label")
                                .classed('checkbox-container', true)
                                .text(function(d) {
                                    return d;
                                });

            checkBoxes.append("input")       
                      .attr("type", "checkbox")
                      .attr("checked", "checked");

            checkBoxes.append("span").classed('checkmark', true);


            data.pop();
            checkBoxesData.exit().remove();
         
    

            let column = row.append('ul')

            // d3.select(options.element)
            //   .append('div')
            //   .selectAll("div")
            //   .data(data)
            //     .enter()
            //     .append('div')         
            //     .style("width", function(d) { return "10 px"; })
            //     .text(function(d) { return '$ ' + d; });

            this.loadedMap = false;
        }

        public update(options: VisualUpdateOptions) { 
            //this.visualSettings = Visual.parseSettings(options && options.dataViews && options.dataViews[0]);

            // if(!this.loadedMap){
            //     BingMapsLoader.load(this.divMap.node() as HTMLDivElement, this.visualSettings)
            //     .then(res => { 
            //         this.map =  res as Microsoft.Maps.Map;
            //         this.loadedMap = true;
            //         this.mapController.setMap(this.map);
            //         this.drawMap(options);   
            //     });
            //     return;
            // }    
            
            // this.drawMap(options);         
        }    

        private drawMap(options: VisualUpdateOptions) {
            try {
                this.viewModel = this.converter(options.dataViews, this.host);
            }
            catch (e) {
                console.error("Couldn't parse models", e);
            }
            this.mapController.drawMap(this.viewModel, this.visualSettings);

            // let selectionId = this.viewModel[0].selectionId;
            // let selectionManager = this.selectionManager;

            // this.selectionManager.select(selectionId).then((ids: ISelectionId[]) => {
            //     //called when setting the selection has been completed successfully
            // });

            // let categories =  options.dataViews[0].table.columns[0];
         

            //  let target =  {
            //     column: categories.displayName,
            //     table: categories.queryName.substr(0, categories.queryName.indexOf('.')),
            // };
    
            // debugger;
            // let filter: IBasicFilter = new window['powerbi-models'].BasicFilter(target, "In", [1038]);
            // this.host.applyJsonFilter(filter, "general", "filter", FilterAction.merge);

            // this.divMap.on('click', () => {
           
            //     selectionManager.select(selectionId, false).then((ids: ISelectionId[]) =>{
            //                 console.log(ids);
            //              }).catch(e => console.error(e))


            // });
            // Microsoft.Maps.Events.addHandler(this.map, 'click', function (e: Microsoft.Maps.IMouseEventArgs)  {
            //     debugger;
            //     console.log('marker identity is ', selectionId);
            //     debugger;
            //     selectionManager.select(selectionId, false).then((ids: ISelectionId[]) =>{
            //         console.log(ids);
            //     }).catch(e => console.error(e));                     
            // });          
        }

        private static parseSettings(dataView: DataView): VisualSettings {  
            return VisualSettings.parse(dataView) as VisualSettings;
        }

        private converter(dv: DataView[], host: IVisualHost): SlicerMapModel[] {
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

            debugger;
            return viewModel;
        }

        /** 
         * This function gets called for each of the objects defined in the capabilities files and allows you to select which of the 
         * objects and properties you want to expose to the users in the property pane.
         * 
         */
        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
            return VisualSettings.enumerateObjectInstances(this.visualSettings || VisualSettings.getDefault(), options);
        }

        private getSelectionIds(dataView: DataView, host: IVisualHost): ISelectionId[] {
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