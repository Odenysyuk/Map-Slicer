/*
 *  Power BI Visualizations
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */

module powerbi.extensibility.visual.mapSlicerB1146AB518024EEF8B19C181A7ECC49E  {
  "use strict";
  import DataViewObjectsParser = powerbi.extensibility.utils.dataview.DataViewObjectsParser;

  export class VisualSettings extends DataViewObjectsParser {
    public mapLayers: MapLayerSettings = new MapLayerSettings();
    public sensor: SensorSettings = new SensorSettings("01B8AA", true, 50);
    public sensorLabel: SensorLabelSettings = new SensorLabelSettings();
    public fromSensor: SensorSettings = new SensorSettings("0052FF", true, 50);
    public toSensor: SensorSettings  = new SensorSettings("FF8C00", true, 50);
  }

  export class MapLayerSettings {
    public type: string = "road";
  }

  export class SensorSettings {
    public color: string;
    public showline: boolean;
    public transparency: number;
    constructor(color: string, showline: boolean, transparency: number) {
      this.color = color; 
      this.showline = showline;
      this.transparency = transparency;
    }
  }

  export class SensorLabelSettings {
    public show: boolean = false;
    public fontType: string = "helvetica, arial, sans-serif";
    public fontSize: number = 10;
    public fontColor: string = "#293537";
    public textAlignment: string = "center";
  }

  export class TooltipSettings {
    public show: boolean = true;
  }
}