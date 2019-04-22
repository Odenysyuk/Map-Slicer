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

    import ISelectionId = powerbi.visuals.ISelectionId;

    import tooltip = powerbi.extensibility.utils.tooltip;
    import TooltipEnabledDataPoint = powerbi.extensibility.utils.tooltip.TooltipEnabledDataPoint;
    import TooltipEventArgs = powerbi.extensibility.utils.tooltip.TooltipEventArgs;

    export interface IBasicFilter extends IFilter {
        operator: BasicFilterOperators;
        values: (string | number | boolean)[];
    }

    export class Visual implements IVisual {
        private map: Microsoft.Maps.Map;
        private divMap: d3.Selection<HTMLElement>;        
        private containerFilter: d3.Selection<HTMLElement>;
        private rowContainer: d3.Selection<HTMLElement>;
        private visualSettings: VisualSettings;
        private host: powerbi.extensibility.visual.IVisualHost;
        private selectionIdBuilder: ISelectionIdBuilder;
        private selectionManager: ISelectionManager;
        private loadedMap: boolean;
        private mapController: BingMapController;
        private nodeModels: NodeModel[];
        private tooltipServiceWrapper: tooltip.ITooltipServiceWrapper;
        private categoryNames: CategoryModel[] = [];

        constructor(options: VisualConstructorOptions) {
            this.host = options.host;
            this.selectionIdBuilder = options.host.createSelectionIdBuilder();
            this.selectionManager = options.host.createSelectionManager();
            this.tooltipServiceWrapper = tooltip.createTooltipServiceWrapper(this.host.tooltipService, options.element);
            this.mapController = new BingMapController(this.selectionManager, this.host, options.element);

            this.divMap = d3.select(options.element)
                .append('div')
                .classed('map', true)
                .attr({ id: "map_id" });

            this.containerFilter = d3.select(options.element)
                .append('div')
                .classed('container', true)
                .attr({ id: "container" });

            this.rowContainer = this.containerFilter
                .append('div')
                .classed('row', true);             
   
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
            } else {
                this.drawMap(options);
            }
        }

        private drawMap(options: VisualUpdateOptions) {        
            const height = options.viewport.height;

            try {
                const dataView = options && options.dataViews && options.dataViews[0];
                this.nodeModels = ConverterHelper.Convert(dataView, this.host);
                const categoryNames = ConverterHelper.ConvertCategoryNames(dataView, this.visualSettings);
                
                if (this.nodeModels && this.nodeModels.length) {
                    const mapHeight = height * 0.8;
                    const containerHeight = height - mapHeight;
                    this.divMap.style("height", mapHeight + 'px');
                    this.containerFilter.style("height", containerHeight + 'px');

                    if(this.isCategoryNameUpdates(categoryNames)){
                        this.categoryNames = categoryNames;                     
                        this.drawContainerFilter(options); 
                    }
                          
                } else {
                    this.divMap.style("height", height);
                }

                this.mapController.drawMap(categoryNames, this.nodeModels || [], this.visualSettings);
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
            // let filter: IBasicFilter = new window['powerbi-models'].BasicFilter(target, "In", [1038]);
            // this.host.applyJsonFilter(filter, "general", "filter", FilterAction.merge);

            // this.divMap.on('click', () => {

            //     selectionManager.select(selectionId, false).then((ids: ISelectionId[]) =>{
            //                 console.log(ids);
            //              }).catch(e => console.error(e))


            // });
            //  Microsoft.Maps.Events.addHandler(this.map, 'rightclick', function (e: Microsoft.Maps.IMouseEventArgs)  {
            //     console.log('marker identity is ');           
            //     // selectionManager.select(selectionId, false).then((ids: ISelectionId[]) =>{
            //     //      console.log(ids);
            //     //  }).catch(e => console.error(e));                     
            //  });          
        }

        private drawContainerFilter(options: VisualUpdateOptions) {

            this.rowContainer.html('');
            let column = this.rowContainer
                .selectAll('div')
                .data(this.categoryNames )
                .enter()
                .append("div")
                .classed('col', true);

            let header = column
                .append("div")
                .classed('card', true)
                .append("div")
                .classed('card-header text-center', true)
                .append("h6")
                .classed('mb-0', true);

                header.append('i')
                .attr('class', function (d) {
                    return d.icon;
                });
                header.append('span')
                .text(function (d) {
                    return ` ${d.name}`;
                });  
        }

        private isCategoryNameUpdates(categories: CategoryModel[]) : boolean{
           
            if(this.categoryNames.length !== categories.length){
                return true;
            }

            const differentData = categories.filter((d, i)=>{
                d.icon !== this.categoryNames[i].icon
                || d.name !== this.categoryNames[i].name
            })

            return !differentData.length;
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