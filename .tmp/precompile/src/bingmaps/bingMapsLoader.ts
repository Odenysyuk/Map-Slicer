declare var onBingLoaded;
const url = 'https://www.bing.com/api/maps/mapcontrol?callback=onBingLoaded&branch=release';

class BingMapsLoader {
    private static promise;

    public static load(div: HTMLDivElement, mapLayers: MapLayerFormat) {
        if (!BingMapsLoader.promise) {

            // Make promise to load
            BingMapsLoader.promise = new Promise(resolve => {

                // Set callback for when bing maps is loaded.
                onBingLoaded = (ev) => {

                    var setting = this.getMapParameter(div, mapLayers);
                    let map = new Microsoft.Maps.Map(div, setting);
                    Microsoft.Maps.loadModule('Microsoft.Maps.SpatialMath');
                    Microsoft.Maps.loadModule('Microsoft.Maps.WellKnownText');
                    Microsoft.Maps.loadModule('Microsoft.Maps.SpatialMath');
                    resolve(map);
                };

                const node = document.createElement('script');
                node.src = url;
                node.type = 'text/javascript';
                node.async = true;
                node.defer = true;
                document.getElementsByTagName('head')[0].appendChild(node);
            });
        }

        // Always return promise. When 'load' is called many times, the promise is already resolved.
        return BingMapsLoader.promise;
    }

    static getMapParameter(div: HTMLDivElement, mapLayers: MapLayerFormat): Microsoft.Maps.IMapLoadOptions {
        var para = {
            credentials: 'AidYBxBA7LCx2Uo3v-4QJE2zRVgvqg4KquhupR_dRRIGbmKd1A1CpWnjEJulgAUe',
            showDashboard: false,
            showTermsLink: false,
            showLogo: false,
            showScalebar: false,
            mapTypeId: this.mapType(mapLayers),
            liteMode: false
        } as Microsoft.Maps.IMapLoadOptions;

        para.center = new Microsoft.Maps.Location(0, 0);
        para.zoom = this.defaultZoom(div.offsetWidth, div.offsetHeight);

        return para;
    }

    static mapType(v: MapLayerFormat) {
        switch (v.type) {
            case 'aerial': return Microsoft.Maps.MapTypeId.aerial;
            case 'road': return Microsoft.Maps.MapTypeId.road;
            case 'canvasDark': return Microsoft.Maps.MapTypeId.canvasDark;
            case 'canvasLight': return Microsoft.Maps.MapTypeId.canvasLight;
            case 'grayscale': return Microsoft.Maps.MapTypeId.grayscale;
        }
    }

    static defaultZoom(width: number, height: number): number {
        var min = Math.min(width, height);
        for (var level = 1; level < 20; level++) {
            if (256 * Math.pow(2, level) > min) {
                break;
            }
        }
        return level;
    }
}