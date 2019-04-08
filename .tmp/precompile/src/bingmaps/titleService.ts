class TitleSevice {

    private readonly _textColorDefault: string;;
    private readonly _fontSizeDefault: number;
    private readonly _fontFamilyDefault: string;
    private readonly nodeSizeDefault: number;

    constructor() {
        this._textColorDefault = '#7F898A';
        this._fontSizeDefault = 10;
        this._fontFamilyDefault = 'Arial';
        this.nodeSizeDefault = 20;
    }

    private offScreenCanvas: any;

    async draw(nodes: PointDataModel[], format: SensorLabelSettings): Promise<any> {
        return Promise.all(nodes.map(node => this.createLabelPushpin(node, this.nodeSizeDefault, format)));   
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

    async createLabelPushpin(node: PointDataModel, size: number, format: SensorLabelSettings): Promise<Microsoft.Maps.Pushpin> {
        
        const location = node.point.getLocation() as Microsoft.Maps.Location;
        const text =  node.data.SensorName.toString();
        let textColor = format.fontColor || this._textColorDefault;
        let fontSize = format.fontSize || this._fontSizeDefault;
        let fontFamily = format.fontType || this._fontFamilyDefault;
        var width = this.measureTextWidth(text, fontSize, fontFamily);

        var pin = new Microsoft.Maps.Pushpin(location, {
            icon: this.createLabelIcon(text, textColor, fontSize, fontFamily),
            text: text,
            anchor: new Microsoft.Maps.Point(this.getAligmantOfTitle(format.textAlignment, width), size / 2 + fontSize * 1)
        });
        
        //Store font info in metadata so we can update icons if needed.
        pin.metadata = {
            textColor: textColor,
            fontSize: fontSize,
            fontFamily: fontFamily
        };
        return pin;
    }

    private getAligmantOfTitle(textAlignment: string, width: number): number {
        switch (textAlignment) {
            case 'left': return width;
            case 'center': return width / 2;
            default: return 0;
        }
    }
}