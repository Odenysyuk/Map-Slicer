module powerbi.extensibility.visual.mapSlicerB1146AB518024EEF8B19C181A7ECC49E  {
    "use strict";

    export class NodeService {
        private readonly strokeWidthDefault: number;
        private readonly svgSize: number;

        constructor() {
            this.strokeWidthDefault = 1;
            this.svgSize = 10;
        }
        
        async drawCircleNode(dataView: NodeModel, format: SensorFormat): Promise<Microsoft.Maps.Pushpin>  {
            const gradientColor = RgbColor.hexToRgb(format.color, format.transparency / 100).toString();
            const gradientColorLine = format.showline ? RgbColor.pickHex(format.color).toString() : gradientColor;
            const circle = this.CreateCircle(gradientColor, gradientColorLine);

            return this.CreatePushpin(dataView, circle);
        }

        private CreatePushpin(node: NodeModel, svg: string): Microsoft.Maps.Pushpin {
            const point = Microsoft.Maps.WellKnownText.read(`${node.value}`) as Microsoft.Maps.Pushpin;
            if (point) {
                point.setOptions({
                    icon: svg,
                    anchor: new Microsoft.Maps.Point(this.svgSize, this.svgSize)
                })
            }
            return point;
        }

        private CreateCircle(fillColor: string, strokeColor: string): string {
            //Create an SVG string of a circle with the specified radius and color.
            const svg = ['<svg xmlns="http://www.w3.org/2000/svg" width="', (this.svgSize * 2),
                '" height="', (this.svgSize * 2), 
                '"><circle cx="', this.svgSize, 
                '" cy="', this.svgSize, 
                '" r="', (this.svgSize - this.strokeWidthDefault), 
                '" stroke="', strokeColor, 
                '" stroke-width="', this.strokeWidthDefault, 
                '" fill="', fillColor, 
                '"/></svg>'];

            return svg.join('');
        }
    }
}