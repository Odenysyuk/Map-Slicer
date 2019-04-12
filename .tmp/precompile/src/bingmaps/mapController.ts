// declare var loadMap;

// class MapController {
//     private _div: HTMLDivElement;
//     private _map: Microsoft.Maps.Map;
//     private _format: VisualFormat;
//     private _nodesData: PointDataModel[];
//     private _tooltipService: TooltipService;
//     
//     private _contextMenu: ContextMenuService;

//     constructor(div: HTMLDivElement, data: MapViewModel[], format: VisualFormat) {
//         this._div = div;
//         this._format = format;
//         

//         loadMap = () => {
//             this._tooltipService = new TooltipService(this._map);
//             this._contextMenu = new ContextMenuService(this._map);
//             this.drawMap(data, format)
//         }
//     }

//     public drawMap(data: MapViewModel[], format: VisualFormat) {
//         if (Microsoft.Maps.WellKnownText) {
//             return this.reDrawMap(data, format);
//         }
//         else {
//             Microsoft.Maps.loadModule('Microsoft.Maps.WellKnownText', () => {
//                 return this.reDrawMap(data, format);
//             });
//         }
//     }

//     async reDrawMap(data: MapViewModel[], format: VisualFormat) {
//         this._format = format;
//         this.resetMap();
//         await Promise.all([
//             //this.restyleMap(format.mapLayers),
//             this.drawSensors(data, format)]);

//         await Promise.all([
//             this.drawSensorsLabel(),
//             this.setBestView(),
//             this.drawTooltip(),
//             //  this.drawContextMenu()
//         ]);
//     }

//     async drawSensors(data: MapViewModel[], format: VisualFormat) {
//         this._nodesData = await this._nodeService.drawCircleNode(data, format.sensor);
//         this._map.entities.add(this._nodesData.map(x => x.point));
//     }

//     async drawTooltip() {
//         if (this._format.tooltip.show) {
//             this._nodesData.filter(model => model.data.SensorName).forEach(model => {
//                 const sensorLabels = model.data.DataLabels.filter(l => l.columnName == ColumnView.SensorName);
//                 if (sensorLabels.length) {
//                     this._tooltipService.add(model.point, sensorLabels[0].toString());
//                 }
//             });
//         }
//     }

//     async drawSensorsLabel() {
//         if (this._format.sensorLabel.show) {
//             const lables = await this._titleService.draw(this._nodesData, this._format.sensorLabel);
//             this._map.entities.add(lables);
//         }
//     }

//     async resetMap() {
//         this._map.entities.clear();
//     }

//     async setBestView() {
//         const nodes = this._nodesData.map(x => x.point)
//         this._map.setView({
//             bounds: Microsoft.Maps.SpatialMath.Geometry.bounds(nodes),
//             padding: 5
//         });
//     }
// }