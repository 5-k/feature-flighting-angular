
export class FeatureFlightingDataContract {

    featureKey: string; //Flighting By alias, req code etc
    featureParams: FeatureNameValue;
}

export class FeatureFlightingInputs extends FeatureFlightingDataContract {
    handleType: FeatureFlightingHandleType;
    initialState: FlightingInitialState;
}

export class FeatureNameValue {
    name: string; //Can be a page Name, div name, element on page
    value: string; //Can be user alias, or Requsiition class or etc
}

export class FeatureFlightingResponseModel {

    responseCode: number;
    response: string;
    isFlighted: boolean;
}
 
export enum FeatureFlightingHandleType {
    HiddenIfFlighted,
    HiddenIfNotFlighted,
    RedirectToHomeIfNotFlighted
}

export enum FlightingInitialState {
    Hidden,
    Shown
}

export const FeatureFlightingKey = {
    ByEmailId : "ByEmailId",
    ByCountryCode : "ByCountryCode"
}

export const FlightingFeatureNames = {
    EditProfile : "EditProfile",
    GetReports : "GetReports"
}