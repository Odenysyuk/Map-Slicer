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
module powerbi.extensibility.visual {
    "use strict";

    // export interface IFilter{
    //     $schema: string;
    //     target: IFilterTarget;
    // }

    import ISelectionId = powerbi.visuals.ISelectionId; 

    export interface IBasicFilter extends IFilter {
        operator: BasicFilterOperators;
        values: (string | number | boolean)[];
    }  

    export class Visual implements IVisual {        
        private map: Microsoft.Maps.Map;
        private divMap: d3.Selection<HTMLElement>;
        private visualSettings: VisualSettings;
        private host: powerbi.extensibility.visual.IVisualHost;
        private selectionIdBuilder: ISelectionIdBuilder;
        private selectionManager: ISelectionManager;
        private loadedMap: boolean;
        private mapController: BingMapController;
        private nodeModels: NodeModel[];

        constructor(options: VisualConstructorOptions) {  
            this.host = options.host;
            this.selectionIdBuilder = options.host.createSelectionIdBuilder();
            this.selectionManager = options.host.createSelectionManager();
            this.mapController = new BingMapController(this.selectionManager);
            
            this.divMap = d3.select(options.element)            
                .append('div')
                .classed('map', true)
                .attr({ id: "map_id" });  

            const data = ['From', 'To', 'From', 'To', 'To','From', 'To','From', 'To','From', 'To'];
            
            let row =   d3.select(options.element)
                          .append('div')
                          .classed('row', true)
                          .attr({ id: "container" });       

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
            this.loadedMap = false;
        }

        public update(options: VisualUpdateOptions) { 
            this.visualSettings = Visual.parseSettings(options && options.dataViews && options.dataViews[0]);

            if (!this.loadedMap) {
                BingMapsLoader.load(this.divMap.node() as HTMLDivElement, this.visualSettings)
                    .then(res => {
                        this.map = res as Microsoft.Maps.Map;
                        this.loadedMap = true;
                        this.mapController.setMap(this.map);
                        this.drawMap(options);
                    });
                return;
            }    
            
            this.drawMap(options);         
        }    

        private drawMap(options: VisualUpdateOptions) {

            try {
                this.nodeModels = ConverterHelper.Convert(options && options.dataViews && options.dataViews[0], this.host);

                if (this.nodeModels.length) {
                    this.divMap.style("height", '80%');
                }

                this.mapController.drawMap(this.nodeModels, this.visualSettings);
            }
            catch (e) {
                console.error("Couldn't draw map", e);
            }                    
      

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

        /** 
         * This function gets called for each of the objects defined in the capabilities files and allows you to select which of the 
         * objects and properties you want to expose to the users in the property pane.
         * 
         */
        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
            return VisualSettings.enumerateObjectInstances(this.visualSettings || VisualSettings.getDefault(), options);
        }

        
    }        
}