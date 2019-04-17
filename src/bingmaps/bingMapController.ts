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
        private contextMenu: ContextMenuService;

        constructor(selectionManager: ISelectionManager) {
            this.selectionManager = selectionManager;
            this.nodeService = new NodeService();
            this.mapType = new MapTypeService();
            this.titleService = new TitleSevice();      
            this.sensorNodeModels = [];
        }

        public setMap(map: Microsoft.Maps.Map) {
            this.map = map;
            this.tooltipService = new TooltipService(map);
            this.contextMenu = new ContextMenuService(this.map);
        }

        public drawMap(data: NodeModel[], format: VisualSettings) {
            if (Microsoft.Maps.WellKnownText) {
                return this.reDrawMap(data, format);
            }
            else {
                Microsoft.Maps.loadModule('Microsoft.Maps.WellKnownText', () => {
                    return this.reDrawMap(data, format);
                });
            }
        }

        async reDrawMap(data: NodeModel[], format: VisualSettings) {
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

            // let selectionManager =  this.selectionManager;
             debugger;

            // this.selectionManager.registerOnSelectCallback(
            // (ids: ISelectionId[]) => {
            //     //called when a selection was set by Power BI
            // });


            // Microsoft.Maps.Events.addHandler(node, 'click', function (e: Microsoft.Maps.IMouseEventArgs)  {
            //     console.log('marker identity is ', sensorData.selectionId);
            //     selectionManager.select(sensorData.selectionId, false).then((ids: ISelectionId[]) =>{
            //         console.log(ids);
            //     }).catch(e => console.error(e));                     
            // });
            
            return sensorNode;
        }



        async setBestView() {
            const nodes = this.sensorNodeModels.map(x => x.node)
            this.map.setView({
                bounds: Microsoft.Maps.SpatialMath.Geometry.bounds(nodes),
                padding: 5
            });
        }
    }
}