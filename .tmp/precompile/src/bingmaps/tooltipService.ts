module powerbi.extensibility.visual.mapSlicerB1146AB518024EEF8B19C181A7ECC49E  {
    "use strict";

    export class TooltipService {

        private tooltip: Microsoft.Maps.Infobox;
        private tooltipTemplate: string;

        constructor(map: Microsoft.Maps.Map) {
            this.tooltip = new Microsoft.Maps.Infobox(map.getCenter(), {
                visible: false,
                showPointer: false,
                showCloseButton: false,
                offset: new Microsoft.Maps.Point(-75, 30)
            });
            this.tooltip.setMap(map);
            this.tooltipTemplate = this.getTooltipTemplate();
        }

        async add(sensorNode: SensorNodeModel) {

            if(!sensorNode.data.value){
                return;
            }

            const text = sensorNode.data.value.toString();
            if (text && text !== '') {
                Microsoft.Maps.Events.addHandler(sensorNode.node, 'mouseover', e => {
                    this.tooltip.setOptions({ visible: false });
                    //Set the infobox options with the metadata of the pushpin.
                    this.tooltip.setOptions({
                        location: (e as Microsoft.Maps.IMouseEventArgs).location,
                        htmlContent: this.tooltipTemplate.replace('{title}', text),
                        visible: true
                    });

                });
                Microsoft.Maps.Events.addHandler(sensorNode.node, 'mouseout', x => { this.tooltip.setOptions({ visible: false }) });
            }
        }

        private getTooltipTemplate(): string {
            return '<div class="tooltip"><span class="tooltiptext">{title}</span></div>';
        }
    }
}