declare var loadMap;
type Action<T> = (i: T) => void;

class MapController {
    private _div: HTMLDivElement;
    private _map: Microsoft.Maps.Map;
    private _then: Action<Microsoft.Maps.Map>;
    private _format: VisualFormat;
    private _nodesData: PointDataModel[];
    private _nodeService: NodeService;
    private _tooltipService: TooltipService;
    private _titleService: TitleSevice;
    private _contextMenu: ContextMenuService;
 
    constructor(div: HTMLDivElement, data: MapViewModel[], format: VisualFormat) {
        this._div = div;
        this._format = format;
        this._nodeService = new NodeService();
        this._titleService = new TitleSevice();   

        loadMap = () => {
            this._remap();
            this._then && this._then(this._map);
            this._then = null;
            this._tooltipService = new TooltipService(this._map);
            this._contextMenu = new ContextMenuService(this._map);
            this.drawMap(data, format)
        }
    }

    public drawMap(data: MapViewModel[], format: VisualFormat) {
        if (Microsoft.Maps.WellKnownText) {
            return this.reDrawMap(data, format);
        }
        else {
            Microsoft.Maps.loadModule('Microsoft.Maps.WellKnownText', () => {
                return  this.reDrawMap(data, format);
            });
        }
    }

    async reDrawMap(data: MapViewModel[], format: VisualFormat) {
        this._format = format;
        this.resetMap();
        await Promise.all([
            this.restyleMap(format.mapLayers),
            this.drawSensors(data, format)]);

        await  Promise.all([
            this.drawSensorsLabel(),
            this.setBestView(), 
            this.drawTooltip(),
            this.drawContextMenu()]);
    }
    
    async restyleMap(fm: MapLayerFormat) {
        let mapTypeId = this.mapType(fm);
        if (this._map.getMapTypeId() !== mapTypeId) {
            this._map.setMapType(mapTypeId);
        }
    }

    async drawSensors(data: MapViewModel[], format: VisualFormat){
        this._nodesData = await this._nodeService.drawCircleNode(data, format.sensor);   
        this._map.entities.add(this._nodesData.map(x => x.point));    
    }

    async drawTooltip(){
        if(this._format.tooltip.show){
            this._nodesData.filter(model => model.data.SensorName).forEach(model => {
                const sensorLabels = model.data.DataLabels.filter(l => l.columnName == ColumnView.SensorName);  
                if(sensorLabels.length){
                    this._tooltipService.add(model.point, sensorLabels[0].toString());
                }
            }); 
        }      
    }

    async drawContextMenu(){
        this._nodesData.forEach(node => this._contextMenu.add(node));   
    }

    async drawSensorsLabel(){
        if(this._format.sensorLabel.show){
            const lables = await this._titleService.draw(this._nodesData, this._format.sensorLabel);   
            this._map.entities.add(lables);    
        }
    }   

    async resetMap() {
        this._map.entities.clear();
    }

    async setBestView() {
        const nodes = this._nodesData.map(x => x.point)
        this._map.setView({ 
            bounds: Microsoft.Maps.SpatialMath.Geometry.bounds(nodes), 
            padding: 5 });
    }

    private _remap(): Microsoft.Maps.Map {
        var setting = this.getMapParameter(this._map, this._div, this._format);
        this._map = new Microsoft.Maps.Map(this._div, setting);
        Microsoft.Maps.loadModule('Microsoft.Maps.SpatialMath');
        Microsoft.Maps.loadModule('Microsoft.Maps.WellKnownText');
        Microsoft.Maps.loadModule('Microsoft.Maps.SpatialMath');
        return this._map;
    }

    private getMapParameter(map: Microsoft.Maps.Map, div: HTMLDivElement, fm: VisualFormat): Microsoft.Maps.IMapLoadOptions {
        var para = {
            credentials: 'AidYBxBA7LCx2Uo3v-4QJE2zRVgvqg4KquhupR_dRRIGbmKd1A1CpWnjEJulgAUe',
            showDashboard: false,
            showTermsLink: false,
            showLogo: false,
            mapTypeId: this.mapType(fm.mapLayers),
            liteMode: false
        } as Microsoft.Maps.IMapLoadOptions;

        if (map) {
            para.center = map.getCenter();
            para.zoom = map.getZoom()
        }
        else {
            para.center = new Microsoft.Maps.Location(0, 0);
            para.zoom = this.defaultZoom(div.offsetWidth, div.offsetHeight);
        }
        return para;
    }

    private mapType(v: MapLayerFormat) {
        switch (v.type) {
            case 'aerial': return Microsoft.Maps.MapTypeId.aerial;
            case 'road': return Microsoft.Maps.MapTypeId.road;
            case 'canvasDark': return Microsoft.Maps.MapTypeId.canvasDark;
            case 'canvasLight': return Microsoft.Maps.MapTypeId.canvasLight;
            case 'grayscale': return Microsoft.Maps.MapTypeId.grayscale;
        }
    }

    private defaultZoom(width: number, height: number): number {
        var min = Math.min(width, height);
        for (var level = 1; level < 20; level++) {
            if (256 * Math.pow(2, level) > min) {
                break;
            }
        }
        return level;
    } 
}