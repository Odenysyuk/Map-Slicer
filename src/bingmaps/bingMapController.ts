module powerbi.extensibility.visual {
    "use strict";

    /**
     * Class for Bing map controller
     * @class
     */
    export class BingMapController {

        private map: Microsoft.Maps.Map;
        private mapType: MapTypeService;
        private nodeService: NodeService;
        private titleService: TitleSevice;
        private tooltipService: TooltipService;
        private sensorNodeModels: SensorNodeModel[];
        private host: IVisualHost;
        private contextMenu: ContextMenuService;
        private categoryNames: CategoryModel[] = [];
        private filterDictionary: { [key: string]: PrimitiveValue[] }
        private filterTarget: IFilterColumnTarget[];
        private containerFilter: d3.Selection<HTMLElement>;
        private rowContainer: d3.Selection<HTMLElement>;

        constructor(host: IVisualHost, rootElement: HTMLElement, containerFilter: d3.Selection<HTMLElement>) {
            this.host = host;
            this.nodeService = new NodeService();
            this.mapType = new MapTypeService();
            this.titleService = new TitleSevice();
            this.contextMenu = new ContextMenuService(rootElement, this.host);
            this.sensorNodeModels = [];
            this.filterDictionary = {};
            this.filterTarget = [];
            this.containerFilter = containerFilter;
            this.rowContainer = containerFilter
                .append('div')
                .classed('row', true);
        }

        public setMap(map: Microsoft.Maps.Map) {
            this.map = map;
            this.tooltipService = new TooltipService(map);
            this.contextMenu.handleMap(this.map, (category: CategoryModel, shape: Microsoft.Maps.Pushpin) => {

                if (!this.filterDictionary[category.name]) {
                    this.filterDictionary[category.name] = [];
                }

                this.filterDictionary[category.name].push(shape.metadata.nodeId);

                let existFilter = this.filterTarget.filter(f => f.column == category.column);

                if (!existFilter.length) {
                    this.filterTarget.push({ column: category.column, table: category.table });
                }

                this.filterData();
            });
        }

        private filterData() {
            let filters = this.filterTarget.map(filterTarget => new window['powerbi-models'].BasicFilter(filterTarget, "In", this.filterDictionary[filterTarget.column]));
            this.host.applyJsonFilter(filters as IBasicFilter[], "general", "filter", FilterAction.merge);
        }

        public drawMap(categoryNames: CategoryModel[], data: NodeModel[], format: VisualSettings, jsonFilter?: IFilter[]) {

            if (this.isCategoryNameUpdates(categoryNames)) {
                const basicFilters = jsonFilter as ISliceFilter[];   
                this.filterTarget = [];
                this.filterDictionary = {};

                if (basicFilters || basicFilters.length) {                    
                    const extractFilter =  basicFilters.filter(f => categoryNames.filter(c => c.column == f.target.column && c.table == f.target.table).length);
                    
                    if(extractFilter.length !== basicFilters.length){
                        this.host.applyJsonFilter(extractFilter, "general", "filter", FilterAction.merge);
                        return;
                    }
         
                    basicFilters.forEach(f => {
                        this.filterTarget.push(f.target);
                        this.filterDictionary[f.target.column] = f.values;
                    });
                }

                this.categoryNames = categoryNames;
                this.contextMenu.draw(this.categoryNames);
                this.drawContainerFilter();
                this.categoryNames.forEach(category => {
                    this.updateSensorsFilter(category.name, (sensorName: PrimitiveValue, categoryName: string) => {
                        this.removeSensorFromfilter(sensorName, categoryName);
                    });
                });
            }

            if (Microsoft.Maps.WellKnownText) {
                return this.updateMap(data, format);
            }
            else {
                Microsoft.Maps.loadModule('Microsoft.Maps.WellKnownText', () => {
                    return this.updateMap(data, format);
                });
            }
        }

        async updateMap(data: NodeModel[], format: VisualSettings) {
            await this.resetMap();

            await Promise.all([
                this.mapType.restyleMap(this.map, format.mapLayers),
                this.drawSensors(data, format)
            ]);
            await this.setBestView();
        }

        async resetMap() {
            this.map.entities.clear();
        }

        async drawSensors(data: NodeModel[], format: VisualSettings) {
            this.sensorNodeModels = await Promise.all(data.map(sensorData => this.drawSensor(sensorData, format)));
        }

        async drawSensor(sensorData: NodeModel, format: VisualSettings) {

            let node = null;
            let label = null;

            const categoryFilter = this.categoryNames.filter(category => {
                return this.filterDictionary[category.name]
                    && this.filterDictionary[category.name].filter(f => f === sensorData.value).length;
            });

            if (categoryFilter && categoryFilter.length) {
                const category = categoryFilter.shift();
                node = await this.nodeService.drawCircleNode(sensorData, category.format, category.name);
                this.map.entities.add(node);
            } else {
                node = await this.nodeService.drawCircleNode(sensorData, format.sensor);
                this.map.entities.add(node);
            }

            if (format.sensorLabel.show) {
                label = await this.titleService.draw(sensorData, format.sensorLabel);
                this.map.entities.add(label);       
            }        

            return {
                data: sensorData,
                label: label,
                node: node
            } as SensorNodeModel;    
        }

        async setBestView() {
            const nodes = this.sensorNodeModels.map(x => x.node)
            this.map.setView({
                bounds: Microsoft.Maps.SpatialMath.Geometry.bounds(nodes),
                padding: 5
            });
        }

        private isCategoryNameUpdates(categories: CategoryModel[]): boolean {

            if (this.categoryNames.length !== categories.length) {
                return true;
            }

            const differentData = categories.filter((d, i) => {
                d.icon !== this.categoryNames[i].icon
                    || d.name !== this.categoryNames[i].name
            })

            return !differentData.length;
        }

        private updateSensorsFilter(categoryName: string, removeSensorFromfilter: (PrimitiveValue, string) => void) {

            if (!this.filterDictionary[categoryName]) {
                return;
            }

            const data = this.filterDictionary[categoryName].map(sensor => {
                return {
                    sensorName: sensor,
                    categoryName: categoryName
                }
            });

            debugger;
            this.rowContainer.style('width').slice(0, -2)
            let columnFilter = this.rowContainer
                .select(`div#${categoryName}.col`);

            columnFilter.select("ul").remove();

            if (!data || !data.length) {
                return;
            }

            let list = columnFilter.append("ul")
                .classed("list-group list-group-flush", true);

            let liElement = list.selectAll('li')
                .data(data)
                .enter()
                .append("li")
                .classed('list-group-item list-group-item-action', true)
                .on("click", function (c) {
                    removeSensorFromfilter(c.sensorName, c.categoryName);
                    this.remove();
                })
                .append("div")
                .classed('checkbox-group', true);


            liElement.append("input")
                .attr("checked", true)
                .attr("type", "checkbox")
                .attr("id", function (d, i) { return categoryName + i; })

            liElement.append("label")
                .attr('for', function (d, i) { return categoryName + i; })
                .text(function (d) {
                    return ` ${d.sensorName}`;
                })
        }

        private removeSensorFromfilter(sensorName: PrimitiveValue, categoryName: string) {

            if (!this.filterDictionary[categoryName]) {
                return;
            }

            this.filterDictionary[categoryName] = this.filterDictionary[categoryName].filter(f => f !== sensorName);

            if (!this.filterDictionary[categoryName].length) {
                this.filterTarget = this.filterTarget.filter(f => f.column !== categoryName);
            }

            this.filterData();
        }

        private drawContainerFilter() {
            let containerHeight = this.containerFilter.style('height').slice(0, -2);
            this.rowContainer.html('');
            let column = this.rowContainer
                .selectAll('div')
                .data(this.categoryNames)
                .enter()
                .append("div")
                .classed('col', true)
                .attr('id', function (d) {
                    return d.name;
                })
                .style("height", containerHeight + 'px');  

            let header = column
                .append("div")
                .classed('card', true)
                .append("div")
                .classed('card-header text-center', true)
                .append("h6")
                .classed('mb-0', true);

            header.append('i')
                .attr('class', function (d) {
                    return d.icon;
                });
            header.append('span')
                .text(function (d) {
                    return ` ${d.name}`;
                });
        }
    }
}