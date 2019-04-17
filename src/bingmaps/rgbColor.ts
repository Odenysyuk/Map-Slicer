module powerbi.extensibility.visual {
    "use strict";

    export class RgbColor {
        public Red: number = 0;
        public Green: number = 0;
        public Blue: number = 0;
        public Alpha?: number = 0;

        constructor(r: number, g: number, b: number, a?: number) {
            this.Red = r;
            this.Blue = b;
            this.Green = g;
            this.Alpha = a;
        }

        public toString = (): string => {
            return "rgba(" + this.Red + ", " + this.Green + ", " + this.Blue + "," + (this.Alpha || 0) + ")";
        }

        static hexToRgb(hex: string, alpha: number): RgbColor {
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? new RgbColor(
                parseInt(result[1], 16),
                parseInt(result[2], 16),
                parseInt(result[3], 16),
                alpha
            ) : null;
        }

        static pickHex(hex: string): RgbColor {
            const color1 = RgbColor.hexToRgb(hex, 1);
            const color2 = RgbColor.hexToRgb("#374649", 1);
            var p = 0.64;
            var w = p * 2 - 1;
            var w1 = (w / 1 + 1) / 2;
            var w2 = 1 - w1;
            return new RgbColor(
                Math.round(color1.Red * w1 + color2.Red * w2),
                Math.round(color1.Green * w1 + color2.Green * w2),
                Math.round(color1.Blue * w1 + color2.Blue * w2),
                1
            );
        }
    }
}