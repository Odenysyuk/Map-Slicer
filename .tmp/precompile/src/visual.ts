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
        private visualSettings: VisualSettings;
        private host: powerbi.extensibility.visual.IVisualHost;
        private loadedMap: boolean;
        private mapController: BingMapController;
        private nodeModels: NodeModel[];
        private tooltipServiceWrapper: tooltip.ITooltipServiceWrapper;

        constructor(options: VisualConstructorOptions) {
            this.host = options.host;
            this.tooltipServiceWrapper = tooltip.createTooltipServiceWrapper(this.host.tooltipService, options.element);

            this.divMap = d3.select(options.element)
                .append('div')
                .classed('map', true)
                .attr({ id: "map_id" });

            this.containerFilter = d3.select(options.element)
                .append('div')
                .classed('container', true)
                .attr({ id: "container" });       
                
            this.mapController = new BingMapController(this.host, options.element,  this.containerFilter);   
            this.loadedMap = false;
        }

        public update(options: VisualUpdateOptions) {   
            this.visualSettings = Visual.parseSettings(options && options.dataViews && options.dataViews[0]);

            if (!this.loadedMap) {
                BingMapsLoader.load(this.divMap.node() as HTMLDivElement, this.visualSettings.mapLayers)
                    .then(res => {
                        this.map = res as Microsoft.Maps.Map;
                        this.loadedMap = true;
                        this.mapController.setMap(this.map);            
                        this.drawMap(options);            
                    });
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
                } else {
                    this.divMap.style("height", height+ 'px');
                    this.containerFilter.style("height", '0px');   
                }

                this.mapController.drawMap(categoryNames, this.nodeModels, this.visualSettings, options.jsonFilters);           
            }
            catch (e) {
                console.error("Couldn't draw map", e);
            }          
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