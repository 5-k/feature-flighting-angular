import { Directive, ElementRef, Input, Renderer, AfterViewInit } from '@angular/core'; 
import { FeatureFlightingService } from '../core';
import { FeatureFlightingInputs, FlightingFeatureNames, FeatureFlightingHandleType, FeatureFlightingKey, FlightingInitialState } from './models/featureFlighting.model'; 

@Directive({ selector: '[handle-flighting]' })
export class HandleFeatureFlightDirective implements AfterViewInit {
    
    @Input() flightingOptions: FeatureFlightingInputs;
    
    constructor(private el: ElementRef,private renderer: Renderer,
        private userFligtingService: FeatureFlightingService) {
    }

    ngAfterViewInit(): void {
        if(null == this.flightingOptions || undefined == this.flightingOptions) {
            throw new Error("Missing: Feature Flighting inputs");
        }

        this.initState();
        
        var flightingModel = this.userFligtingService.getFlightedModel(this.flightingOptions.featureKey, this.flightingOptions.featureParams.name, this.flightingOptions.featureParams.value);
        this.userFligtingService.getFlightingDetails(flightingModel).subscribe(res=> {
            this.userFligtingService.storeFlightingDetailsInCache(flightingModel, res);
            this.userFligtingService.handleElementVisbilityAndAction(res.isFlighted, this.flightingOptions, this.renderer, this.el );
        });
         
    }

    initState() {
        switch(this.flightingOptions.initialState) {
            case FlightingInitialState.Hidden:
                this.renderer.setElementStyle(this.el.nativeElement, 'display', 'none');
                break;

            case FlightingInitialState.Shown:
                break;
        }
    }

}
