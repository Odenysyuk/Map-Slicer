module powerbi.extensibility.visual {
    "use strict";

    /**
     * Class for Bing map controller
     * @class
     */
    export class BingMapController {

        private map: Microsoft.Maps.Map;
        private mapType: MapTypeService;
        private selectionManager: ISelectionManager;
        private nodeService: NodeService;
        private titleService: TitleSevice;
        private tooltipService: TooltipService;
        private sensorNodeModels: SensorNodeModel[];
        private host: IVisualHost;
        private contextMenu: ContextMenuService;
        private categoryNames: CategoryModel[] = [];   
        private filterDictionary: {[key:string]:ITupleElementValue[]}
        private filterTarget: ITupleFilterTarget;

        constructor(selectionManager: ISelectionManager, host: IVisualHost, rootElement: HTMLElement) {
            this.selectionManager = selectionManager;
            this.host = host;
            this.nodeService = new NodeService();
            this.mapType = new MapTypeService();
            this.titleService = new TitleSevice(); 
            this.contextMenu = new ContextMenuService(rootElement, this.host); 
            this.sensorNodeModels = [];
            this.filterDictionary = {};
            this.filterTarget = [];
        }

        public setMap(map: Microsoft.Maps.Map) {
            this.map = map;
            this.tooltipService = new TooltipService(map);
            debugger;
            const filterType = FilterType.Tuple
            this.contextMenu.handleMap(this.map, (category: CategoryModel, shape: Microsoft.Maps.IPrimitive)=>{
           
                if(!this.filterDictionary[category.name]){
                    this.filterDictionary[category.name] = [];
                }
                this.filterDictionary[category.name].push({value:shape.metadata.nodeId});  

                debugger;
                const existFilter = this.filterTarget.filter((f:IFilterColumnTarget) => f.table == category.table && f.column == category.column);
                if (existFilter.length === 0) {
                    this.filterTarget.push({
                        column: category.column,
                        table: category.table
                    });
                }

                const values = this.filterTarget.map(f => this.filterDictionary[category.name]);   

                debugger;
                let filter: ITupleFilter = {
                    $schema: "http://powerbi.com/product/schema#tuple",
                    filterType: 6,
                    operator: "In",
                    target: this.filterTarget,
                    values: values
                }

                //let filter: IBasicFilter = new window['powerbi-models'].BasicFilter(this.filterTarget, "In", values);
                this.host.applyJsonFilter(filter, "general", "filter", FilterAction.merge);
            });            
        }

        public drawMap(categoryNames: CategoryModel[], data: NodeModel[], format: VisualSettings) {
            
            if(this.isCategoryNameUpdates(categoryNames)){
                this.categoryNames = categoryNames;   
                this.contextMenu.draw(this.categoryNames); 
            }

            if (Microsoft.Maps.WellKnownText) {
                return this.updateMap(data, format);
            }
            else {
                Microsoft.Maps.loadModule('Microsoft.Maps.WellKnownText', () => {
                    return this.updateMap(data, format);
                });
            }
        }

        async updateMap(data: NodeModel[], format: VisualSettings) {
            await this.resetMap();
 
            await Promise.all([
                this.mapType.restyleMap(this.map, format.mapLayers),
                this.drawSensors(data, format)
            ]);
            await this.setBestView();
        }

        async resetMap() {
            this.map.entities.clear();
        }

        async drawSensors(data: NodeModel[], format: VisualSettings) {
            this.sensorNodeModels = await Promise.all(data.map(sensorData => this.drawSensor(sensorData, format, this.map)));
        }

        async drawSensor(sensorData: NodeModel, format: VisualSettings, map: Microsoft.Maps.Map) {
           
            let node = null;
            let label = null;
            let tooltip = null;

            //NOTE: A
            node = await this.nodeService.drawCircleNode(sensorData, format.sensor);
            this.map.entities.add(node);

            if(format.sensorLabel.show){
                label = await this.titleService.draw(sensorData, format.sensorLabel);
                this.map.entities.add(label);
            }

            const sensorNode = {
                 data: sensorData,
                 label: label,
                 node: node,
                 tooltip: tooltip
            } as SensorNodeModel;

            // if (format.tooltip.show) {
            //     await this.tooltipService.add(sensorNode);
            // }

            return sensorNode;
        }

        async setBestView() {
            const nodes = this.sensorNodeModels.map(x => x.node)
            this.map.setView({
                bounds: Microsoft.Maps.SpatialMath.Geometry.bounds(nodes),
                padding: 5
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
    }
}