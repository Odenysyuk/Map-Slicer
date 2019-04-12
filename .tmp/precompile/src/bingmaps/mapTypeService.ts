module powerbi.extensibility.visual.mapSlicerB1146AB518024EEF8B19C181A7ECC49E  {    
    export class MapTypeService {        

        async restyleMap(map: Microsoft.Maps.Map, fm: MapLayerSettings) {
            const mapTypeId = this.mapType(fm);
            if (map.getMapTypeId() !== mapTypeId) {   
                map.setMapType(mapTypeId);
            }
        }

        private  mapType(v: MapLayerSettings) {
            switch (v.type) {
                case 'aerial': return Microsoft.Maps.MapTypeId.aerial;
                case 'road': return Microsoft.Maps.MapTypeId.road;
                case 'canvasDark': return Microsoft.Maps.MapTypeId.canvasDark;
                case 'canvasLight': return Microsoft.Maps.MapTypeId.canvasLight;
                case 'grayscale': return Microsoft.Maps.MapTypeId.grayscale;
            }
        }   
    }
}