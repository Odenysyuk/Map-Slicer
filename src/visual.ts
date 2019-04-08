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

let mapctl: MapController;
function init(div: HTMLDivElement, setting: MapViewModel[], format: VisualFormat) {
    if (!mapctl) {
    mapctl = new MapController(div, setting, format);
  }
  else {
    mapctl.drawMap(setting, format);
  }
}

module powerbi.extensibility.visual {
    "use strict";
    export class Visual implements IVisual {

        private divMap: d3.Selection<HTMLElement>;
        private viewModel: MapViewModel[];
      //  private target: HTMLElement;
        //private updateCount: number;
        private visualSettings: VisualSettings;
        private host: IVisualHost;
        //private textNode: Text;

        constructor(options: VisualConstructorOptions) {     
            this.host = options.host;
            this.divMap = d3.select(options.element)            
                .append('div')
                .classed('map', true)
                .attr({ id: "map_id" });
       //     console.log('Visual constructor', options);
          //  this.target = options.element;
            //this.updateCount = 0;
            // if (typeof document !== "undefined") {
            //     const new_p: HTMLElement = document.createElement("p");
            //     new_p.appendChild(document.createTextNode("Update count:"));
            //     const new_em: HTMLElement = document.createElement("em");
            //     this.textNode = document.createTextNode(this.updateCount.toString());
            //     new_em.appendChild(this.textNode);
            //     new_p.appendChild(new_em);
            //     this.target.appendChild(new_p);
            // }
        }

        public update(options: VisualUpdateOptions) {

            this.visualSettings = Visual.parseSettings(options && options.dataViews && options.dataViews[0]);
            try {
               this.viewModel = this.getViewModel(options.dataViews);
            } catch (e) {
               console.error("Couldn't parse models", e)
            }
            
            init(this.divMap.node() as HTMLDivElement, this.viewModel, this.visualSettings);

            // if (typeof this.textNode !== "undefined") {
            //     this.textNode.textContent = (this.updateCount++).toString();
            // }
        }

        private static parseSettings(dataView: DataView): VisualSettings {  
            return VisualSettings.parse(dataView) as VisualSettings;
        }

        private getViewModel(dv: DataView[]): MapViewModel[] {
            let viewModel: MapViewModel[] = [];

            if (!dv || !dv[0] || !dv[0].table || !dv[0].table.columns || !dv[0].table.rows) {
                return viewModel;
            }

            let columns = dv[0].table.columns;
            let rows = dv[0].table.rows;
            let columnIndexes: any = columns.map(c => { return { ...c.roles, index: c.index, fieldName: c.displayName }; });

            for (let i = 0, len = rows.length; i < len; i++) {
                let polyline = new MapViewModel();       
                ColumnView.toArray().forEach(columnName => {
                    var col = columnIndexes.find(x => x[columnName]);
                    if (col) {
                        polyline[columnName] = rows[i][col.index];   
                        polyline.DataLabels.push(new DataLabel(columnName, col.fieldName, rows[i][col.index]));                     
                    }
                });
                viewModel.push(polyline);
            }
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
    }
}