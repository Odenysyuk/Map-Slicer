class ContextMenuService{
    
    private contextMenu: Microsoft.Maps.Infobox;
    private tooltipTemplate: string;

    constructor(map: Microsoft.Maps.Map) {
        this.contextMenu = new Microsoft.Maps.Infobox(map.getCenter(), {
            visible: false,
            showPointer: false,
            showCloseButton: false,
            htmlContent: this.getTooltipTemplate1(),
            offset: new Microsoft.Maps.Point(-75, 10)
        });

        this.contextMenu.setMap(map);
        this.tooltipTemplate = this.getTooltipTemplate();
        Microsoft.Maps.Events.addHandler(map, 'rightclick', e => {
            this.contextMenu.setOptions({ visible: false });
            var event = (e as Microsoft.Maps.IMouseEventArgs);

            var shape = event.primitive;
            if (shape instanceof Microsoft.Maps.Pushpin) {
                console.log('Pushpin right clicked');

                //Set the infobox options with the metadata of the pushpin.
                this.contextMenu.setOptions({
                    location: event.location,
                    visible: true
                });               
            }
        });

        Microsoft.Maps.Events.addHandler(map, 'click', e => {
            this.contextMenu.setOptions({ visible: false });
            var event = (e as Microsoft.Maps.IMouseEventArgs);

            var shape = event.primitive;
            if (shape instanceof Microsoft.Maps.Pushpin) {
                console.log('Pushpin right clicked');

                //Set the infobox options with the metadata of the pushpin.
                this.contextMenu.setOptions({
                    location: event.location,
                    visible: true
                });     
                
                const sensorOperation = new SensorFilterOperation();
            }
        }); 
    }

    private getTooltipTemplate(): string {
        return '<div style="background-color:gray;border:1px solid black;padding:10px;"><input type="button" value="zoom in" onclick="map.setView({zoom: map.getZoom() + 1});closeContextMenu();"/></div>';
    }

    private getTooltipTemplate1(): string {
        return `<ul class="context-menu">            
                    <li class="context-item" id="setFromBtn"><i class="fa fa-home"></i><a onclick="getTrainingName(923)">From</a></li>         
                    <li class="context-item" id="setToBtn"><a><i class="fa fa-home"></i>To</a></li>
                </ul>`;
    }
}

class SensorFilterOperation{
    private setFromBtn: HTMLElement;
    private setToBtn: HTMLElement
    constructor(){
        debugger;
        this.setFromBtn = document.getElementById("setFromBtn");  
        if(  this.setFromBtn )   {
            this.setFromBtn.addEventListener("click", (e:Event) => this.getTrainingName(4));
        }

        this.setToBtn = document.getElementById("setToBtn");
        if(this.setToBtn){
            this.setToBtn.addEventListener("click", (e:Event) => this.getTrainingName(4));
        }
    }

    getTrainingName(n:number){
        console.log(n);
        // button click handler
     }
}


