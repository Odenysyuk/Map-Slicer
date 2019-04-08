class NodeService{
    private readonly strokeWidthDefault: number;
    private readonly svgSize: number;

    constructor() {
        this.strokeWidthDefault = 1;
        this.svgSize = 10;
    }

    async drawCircleNode(dataView: MapViewModel[], format: SensorFormat): Promise<any> {
        const gradientColor = RgbColor.hexToRgb(format.color, format.transparency / 100).toString();    
        const gradientColorLine = format.showline ? RgbColor.hexToRgb(format.color, 1).toString() : gradientColor;  
        const circle = this.CreateCircle(gradientColor, gradientColorLine); 
        return Promise.all(dataView.map(node => this.CreatePushpin(node, circle)));  
    }
    
    async CreatePushpin(node: MapViewModel, svg: string){
        const point = Microsoft.Maps.WellKnownText.read(node.Location) as  Microsoft.Maps.Pushpin;   
        point.setOptions({
            icon: svg,
            anchor: new Microsoft.Maps.Point(this.svgSize, this.svgSize)
        })
        return { point: point, data: node };
    }

    private CreateCircle(fillColor: string, strokeColor: string): string {
        //Create an SVG string of a circle with the specified radius and color.
        const svg = ['<svg xmlns="http://www.w3.org/2000/svg" width="', (this.svgSize * 2),
            '" height="', (this.svgSize * 2), '"><circle cx="', this.svgSize, '" cy="', this.svgSize, '" r="',
            (this.svgSize - this.strokeWidthDefault), '" stroke="', strokeColor, '" stroke-width="', this.strokeWidthDefault, '" fill="', fillColor, '"/></svg>'];

        return svg.join('');
    }
}