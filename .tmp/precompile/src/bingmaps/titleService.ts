module powerbi.extensibility.visual.mapSlicerB1146AB518024EEF8B19C181A7ECC49E  {
    "use strict";

    export class TitleSevice {

        private readonly textColorDefault: string;;
        private readonly fontSizeDefault: number;
        private readonly fontFamilyDefault: string;
        private readonly nodeSizeDefault: number;

        constructor() {
            this.textColorDefault = '#7F898A';
            this.fontSizeDefault = 10;
            this.fontFamilyDefault = 'Arial';
            this.nodeSizeDefault = 20;
        }

        private offScreenCanvas: any;

        async draw(node: NodeModel, format: SensorLabelSettings): Promise<Microsoft.Maps.Pushpin> {
            if(format.show){
                return this.createLabelPushpin(node, this.nodeSizeDefault, format);
            }
        }

        private measureTextWidth(text: string, fontSize: number, fontFamily: string): number {
            if (!this.offScreenCanvas) {
                this.offScreenCanvas = document.createElement('canvas').getContext("2d");
            }
            this.offScreenCanvas.font = fontSize + 'px ' + fontFamily;
            return this.offScreenCanvas.measureText(text).width;
        }

        private createLabelIcon(text: string, textColor: string, fontSize: number, fontFamily: string) {
            let labelPushpinTemplate = '<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}"><text x="{x}" y="{y}" style="font-size:{fontSize}px;fill:{textColor};font-family:{fontFamily}" text-anchor="middle">{text}</text></svg>';
            textColor = textColor || 'black';
            fontSize = fontSize || 16;
            fontFamily = fontFamily || 'arial';
            let width = this.measureTextWidth(text, fontSize, fontFamily);
            return labelPushpinTemplate.replace('{width}', width.toString())
                .replace('{height}', (fontSize * 1.2).toString())
                .replace('{x}', (width / 2).toString())
                .replace('{y}', fontSize.toString())
                .replace('{textColor}', textColor)
                .replace('{fontSize}', fontSize.toString())
                .replace('{fontFamily}', fontFamily);
        }

        private createLabelPushpin(node: NodeModel, size: number, format: SensorLabelSettings): Microsoft.Maps.Pushpin {
            const point = Microsoft.Maps.WellKnownText.read(`${node.value}`) as Microsoft.Maps.Pushpin;
            const location = point.getLocation() as Microsoft.Maps.Location;
            const text = node.category.toString();
            let textColor = format.fontColor || this.textColorDefault;
            let fontSize = format.fontSize || this.fontSizeDefault;
            let fontFamily = format.fontType || this.fontFamilyDefault;
            var width = this.measureTextWidth(text, fontSize, fontFamily);

            point.setOptions({
                icon: this.createLabelIcon(text, textColor, fontSize, fontFamily),
                text: text,
                anchor: new Microsoft.Maps.Point(this.getAligmantOfTitle(format.textAlignment, width), size / 2 + fontSize * 1)
            
            })
       
            //Store font info in metadata so we can update icons if needed.
            point.metadata = {
                textColor: textColor,
                fontSize: fontSize,
                fontFamily: fontFamily
            };
            return point;
        }

        private getAligmantOfTitle(textAlignment: string, width: number): number {
            switch (textAlignment) {
                case 'left': return width;
                case 'center': return width / 2;
                default: return 0;
            }
        }
    }
}