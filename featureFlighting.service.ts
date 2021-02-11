import { Injectable, Renderer, ElementRef } from '@angular/core'; 
import { Observable } from 'rxjs';
import { FeatureFlightingDataContract,FeatureNameValue, FeatureFlightingKey, FeatureFlightingResponseModel, FeatureFlightingInputs, FeatureFlightingHandleType, FlightingInitialState,  } from './featureFlighting.model';
import { config } from '../../app.config';
import { UserService } from '../user/user.service';
import { SessionStorageService } from 'ngx-webstorage';
import { Router } from '@angular/router';
import { ConfigurationApiHttpProxy } from '../auth/configuration-api-http-proxy.service'; 

@Injectable()
export class FeatureFlightingService { 

  constructor(private configurationAPI: ConfigurationApiHttpProxy,
      private userService: UserService,
      private router: Router,
      private sessionStorage: SessionStorageService ) { 
  }

  /**
   * 
   * @param featureParamName Loads And Handles Flighting Visibility at Screen Level
   * @param featureType 
   */
  public loadAndHandleFlightingDetailsForLoggedInUser(featureParamName: string, featureType: FeatureFlightingHandleType) {
      var model = this.getFlightedModelForLoggedInUserForFeature(featureParamName);
      var cacheValue = this.loadFlightingDetailsFromCache(model);
      if(cacheValue) {
        this.handleFeatureVisibility(featureParamName, cacheValue, featureType);
      } else {
        this.getFlightingDetails(model).subscribe((res)=> {
          this.storeFlightingDetailsInCache(model, res);
          this.handleFeatureVisibility(featureParamName, res.isFlighted, featureType);
        });
      }
    }
  
    private handleFeatureVisibility(featureParamName: string, isFlighted: boolean, featureType: FeatureFlightingHandleType) {

      if(isFlighted) {
        return;
      }
  
      switch(featureType) {
        case FeatureFlightingHandleType.RedirectToHomeIfNotFlighted:
          this.router.navigate(['/home']);
          break;
  
      }
    } 
    
    /**
     * Handle Element Visibility
     * @param isFlighted 
     * @param featureType 
     * @param renderer 
     * @param el 
     */
    public handleElementVisbilityAndAction(isFlighted: boolean, featureInputs: FeatureFlightingInputs, renderer: Renderer, el: ElementRef) {
     
      switch(featureInputs.handleType) {
        case FeatureFlightingHandleType.RedirectToHomeIfNotFlighted:
          if(isFlighted) {
            return;
          } else {
            this.router.navigate(['/home']);
          }
          break;

        case FeatureFlightingHandleType.HiddenIfNotFlighted:
          if(isFlighted) {
            renderer.setElementStyle(el.nativeElement, 'display', '');
            return;
          } else {
            renderer.setElementStyle(el.nativeElement, 'display', 'none');
          }
          break;

        case FeatureFlightingHandleType.HiddenIfFlighted:
          if(isFlighted) {
            renderer.setElementStyle(el.nativeElement, 'display', 'none');
          } else {
            renderer.setElementStyle(el.nativeElement, 'display', '');
            return;
          }
          break;
      }
    }

    /**
     * Store Response In Cache
     * @param contract 
     * @param value 
     */
    public storeFlightingDetailsInCache(contract: FeatureFlightingDataContract ,value: FeatureFlightingResponseModel): void {
        if(null == value) {
            return;
        }
        var cacheKey = this.getCacheNameForFlighting(contract);
        var flightingDetails = this.getFlightingSessionObject();
        flightingDetails[cacheKey] = value;
        this.sessionStorage.store("flightingDetails", flightingDetails);
    }

    /**
     * Load Data From Cache For a Flighting Model
     * @param contract 
     */
    public loadFlightingDetailsFromCache(contract: FeatureFlightingDataContract ): boolean {

        var flightingDetails = this.loadFlightingObjectFromCache(contract);
        if(flightingDetails) {
            return flightingDetails.isFlighted;
        }
        return undefined;
    }
 
    private getFlightingSessionObject() {
      var flightingDetails = this.sessionStorage.retrieve("flightingDetails") as {};
        if(!flightingDetails || Object.keys(flightingDetails).length == 0) {
          flightingDetails = {};
        }
        return flightingDetails;
    }

    
    /**
     * 
     * @param contract Returns the Cache Name Stored for contract Model
     */
    public getCacheNameForFlighting (contract: FeatureFlightingDataContract ): string {
        return "FeatureFlighting-" + contract.featureKey + "-" + contract.featureParams.name+"-"+ contract.featureParams.value;
    }

    
    /**
     * Returns Feature Flighting Input User Data Contract For API For a Particular Input Feature
     * @param featureParamName 
     */
    public getFlightedModelForLoggedInUserForFeature(featureParamName: string): FeatureFlightingDataContract {
        return this.getFlightedModel(FeatureFlightingKey.ByAlias, featureParamName, this.userService.loggedInUser.emailAlias);
    }   


    /**
     * Returns Feature Flighting Input User Data Contract For API
     * @param featureKey 
     * @param featureParamName 
     * @param featureParamValue 
     */
    public getFlightedModel(featureKey: string, featureParamName: string, featureParamValue: string): FeatureFlightingDataContract {
        return {
          featureKey : featureKey,
          featureParams: {
            name : featureParamName,
            value: featureParamValue
          }
        } as FeatureFlightingDataContract;
    }
    
    /**
     * Get Feature Fighting Input Model For Logged In User
     * @param featureParamName 
     * @param handleType 
     */
    public getFlightedInputModelForLoggedInUserForFeature(featureParamName: string, handleType: FeatureFlightingHandleType, initState: FlightingInitialState): FeatureFlightingInputs {
      return {
        featureKey : FeatureFlightingKey.ByAlias,
        featureParams: {
          name : featureParamName,
          value: this.userService.loggedInUser.emailAlias
        },
        handleType: handleType,
        initialState: initState
      } as FeatureFlightingInputs;
  }   

  /**
   * 
   * @param contract Invoke Feature Flighing API and subscribe to result
   */
    public getFlightingDetails(contract: FeatureFlightingDataContract):  Observable<FeatureFlightingResponseModel> {
        var cachedData = this.loadFlightingObjectFromCache(contract);
        
        if(cachedData) {
          return Observable.of(cachedData);
        } else {
          return this.configurationAPI.post<FeatureFlightingResponseModel>(config().api.configurationApi.endpoint.featureFligtingDetails, contract);
        }
    }

    private loadFlightingObjectFromCache(contract: FeatureFlightingDataContract ): FeatureFlightingResponseModel {

      var flightingDetails = this.getFlightingSessionObject();
      var cacheKey = this.getCacheNameForFlighting(contract);
      return flightingDetails[cacheKey] as FeatureFlightingResponseModel;
    }
}