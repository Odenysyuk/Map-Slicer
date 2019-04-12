module powerbi.extensibility.visual.mapSlicerB1146AB518024EEF8B19C181A7ECC49E  {

    import Selection = d3.Selection;

    // powerbi.extensibility.utils.interactivity
    import ISelectionHandler = powerbi.extensibility.utils.interactivity.ISelectionHandler;
    import SelectableDataPoint = powerbi.extensibility.utils.interactivity.SelectableDataPoint;
    import IInteractiveBehavior = powerbi.extensibility.utils.interactivity.IInteractiveBehavior;
    import IInteractivityService = powerbi.extensibility.utils.interactivity.IInteractivityService;

    export interface SampleSlicerBehaviorOptions {
      //  slicerItemContainers: Selection<SelectableDataPoint>;
      //  dataPoints: SampleSlicerDataPoint[];
        interactivityService: IInteractivityService;
       //slicerSettings: Settings;
        isSelectionLoaded: boolean;
    }  

}