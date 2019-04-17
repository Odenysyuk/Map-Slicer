class ContextMenuService{
    
    private contextMenu: Microsoft.Maps.Infobox;
    private tooltipTemplate: string;

    constructor(map: Microsoft.Maps.Map) {
        this.contextMenu = new Microsoft.Maps.Infobox(map.getCenter(), {
            visible: false,
            showPointer: false,
            showCloseButton: false,
            htmlContent: this.getTooltipTemplate(),
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
    }

    private getTooltipTemplate(): string {
        return `  
        <div class="dropdown-menu">
            <a class="dropdown-item" onclick ="getTrainingName(1)"><i class="far fa-circle"></i> From</a>
            <a class="dropdown-item"><i class="fas fa-play"></i> To</a>
        </div>
        `;
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

function getTrainingName(){
    console.log("getTrainingName");
}