module powerbi.extensibility.visual.mapSlicerB1146AB518024EEF8B19C181A7ECC49E  {
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
            this.contextMenu.handleMap(this.map, (category: CategoryModel, shape: Microsoft.Maps.IPrimitive)=>{

                if(!this.filterDictionary[category.name]){
                    this.filterDictionary[category.name] = [];
                }
                this.filterDictionary[category.name].push({value:shape.metadata.nodeId});

                const existFilter = this.filterTarget.filter((f:IFilterColumnTarget) => f.table == category.table && f.column == category.column);
                if (existFilter.length === 0) {
                    this.filterTarget.push({
                        column: category.column,
                        table: category.table
                    });
                }

                debugger;
                let values = this.filterTarget.map((f:IFilterColumnTarget) => this.filterDictionary[f.column]);  
                let tupleValues = this.cartesianJoin(values);

                // values = [
                //     [
                //         // the 1st column combination value (aka column tuple/vector value) that the filter will pass through
                //         {
                //             value: null // the value for `Team` column of `DataTable` table
                //         },
                //         {
                //             value: 1020 // the value for `Value` column of `DataTable` table
                //         }
                //     ],
                //     [
                //         // the 1st column combination value (aka column tuple/vector value) that the filter will pass through
                //         {
                //             value:1040 // the value for `Team` column of `DataTable` table
                //         },
                //         {
                //             value: 1002 // the value for `Value` column of `DataTable` table
                //         }
                //     ],

                // ];

 
                let filter: ITupleFilter =
                {
                    $schema: "http://powerbi.com/product/schema#tuple",
                    filterType: window['powerbi-models'].FilterType.Tuple,
                    operator: "In",
                    target: this.filterTarget,
                    values: tupleValues
                }
                this.host.applyJsonFilter(filter, "general", "filter", FilterAction.merge);     
            });
        }


        private  cartesianObject(a: ITupleElementValue[], b: ITupleElementValue[]): ITupleElementValue[][] {
            return  [].concat(...a.map(a2 => b.map(b2 => [].concat(a2, b2))));
        }


        private cartesianJoin(values: ITupleElementValue[][]): ITupleElementValue[][]{             
            let cartesianArray:ITupleElementValue[][] = [];

            debugger;
            for (let index = 0; index < values.length; index++) {

                if (!values[index] || values[index].length === 0) {
                    return cartesianArray;  
                }
                else if(cartesianArray.length === 0){
                    cartesianArray =  values[index].map(b => [].concat(b));   
                }else{
                    cartesianArray = [].concat(...cartesianArray.map(a2 => values[index].map(b2 => [].concat(a2, b2))));   
                }    
            }

            console.log(cartesianArray);
      
            return cartesianArray;
            // const [arrayFrom, ...arrayTo] = values;

            // if (!arrayTo || arrayTo.length === 0) {
            //     return arrayFrom.map(b => [].concat(b));     
            // }

            // return [].concat(... arrayFrom.map(a => arrayTo[0].map(b => [].concat(a, b)))); 
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