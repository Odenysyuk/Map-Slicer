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

module powerbi.extensibility.visual {
  "use strict";
  import DataViewObjectsParser = powerbi.extensibility.utils.dataview.DataViewObjectsParser;

  export class VisualSettings extends DataViewObjectsParser {
    public mapLayers: MapLayerSettings = new MapLayerSettings();
    public sensor: SensorSettings = new SensorSettings("01B8AA", true, 50);
    public sensorLabel: SensorLabelSettings = new SensorLabelSettings();
    public fromSensor: SensorSettings = new SensorSettings("0052FF", true, 50);
    public toSensor: SensorSettings  = new SensorSettings("3D68B8", true, 50);
    public tooltip: TooltipSettings = new TooltipSettings();
  }

  export class MapLayerSettings {
    public type: string = "road";
  }

  export class SensorSettings {
    public color: string = "01B8AA";
    public showline: boolean = true;
    public transparency: number = 50;
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

  // export class SensorSettings {
  //   public color: string = "0052FF";
  //   public showline: boolean = true;
  //   public transparency: number = 50;
  // }

  // export class ToSensorSettings {
  //   public color: string = "3D68B8";
  //   public showline: boolean = true;
  //   public transparency: number = 50;
  // }

  export class TooltipSettings {
    public show: boolean = true;
  }
}