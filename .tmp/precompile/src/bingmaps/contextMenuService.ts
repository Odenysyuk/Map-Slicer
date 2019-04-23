
module powerbi.extensibility.visual.mapSlicerB1146AB518024EEF8B19C181A7ECC49E  {
    "use strict";

    type Action<T, K> = (p1:T, p2: K) => void;

    export class ContextMenuService {

        private contextMenuElem: d3.Selection<HTMLElement>;
        private menuItem: d3.Selection<CategoryModel>;
        private categoryNames: CategoryModel[] = [];
        private host: IVisualHost;

        constructor(element: HTMLElement, host: IVisualHost) {
            this.host = host;
            this.init(element);
        }

        private init(element: HTMLElement) {
            let menu = d3.select(element)
                .append('div')
                .classed('context-menu', true)
                .attr({ id: "menu" });

            this.contextMenuElem = menu.append('div')
                .classed('dropdown-menu', true)
                .attr({ id: "popupmenu" });

            this.contextMenuElem.on('mouseleave', (e) => {
                this.removePopupMenu();
            });
        }

        public draw(categories: CategoryModel[]) {
            this.categoryNames = categories;
            this.contextMenuElem.html('');
            this.menuItem = this.contextMenuElem.selectAll('div')
                .data(this.categoryNames)
                .enter()
                .append("a")
                .classed('dropdown-item', true);

            this.menuItem.append('i')
                .attr('class', function (d) {
                    return d.icon;
                })

            this.menuItem.append('span')
                .text(function (d) {
                    return ` ${d.name}`;
                });
        }

        public handleMap(map: Microsoft.Maps.Map, menuFunction: Action<CategoryModel, Microsoft.Maps.IPrimitive>) {
            Microsoft.Maps.Events.addHandler(map, 'rightclick', e => {
                this.removePopupMenu();
                var event = (e as Microsoft.Maps.IMouseEventArgs);
                var shape = event.primitive;

                if (shape instanceof Microsoft.Maps.Pushpin && !shape.metadata.categoryId) {
                    this.showPopupMenu(event);
                    this.menuItem.on('click', function (d) {                  
                        menuFunction(d, shape);
                        document.getElementById('popupmenu').style.display = 'none';  
                    }); 
                }
            });
        }

        private showPopupMenu(e: Microsoft.Maps.IMouseEventArgs) {
            var menu = document.getElementById('popupmenu');
            menu.style.display = 'block'; //Showing the menu
            menu.style.left = e.pageX + "px"; //Positioning the menu
            menu.style.top = e.pageY + "px";
        }

        private removePopupMenu() {
            document.getElementById('popupmenu').style.display = 'none';
        }
    }
}