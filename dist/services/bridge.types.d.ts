/** Subset of RESO Property + Media as returned by Bridge OData. */
export interface BridgeMediaItem {
    MediaURL?: string;
    Order?: number;
}
export interface BridgePropertyRaw {
    ListingId?: string;
    ListPrice?: number;
    City?: string;
    StateOrProvince?: string;
    PostalCode?: string;
    BedroomsTotal?: number;
    BathroomsTotalInteger?: number;
    UnparsedAddress?: string;
    PublicRemarks?: string;
    Latitude?: number;
    Longitude?: number;
    Media?: BridgeMediaItem[];
    ListingKey?: string;
    PropertyType?: string;
    PropertySubType?: string;
    BuildingAreaTotal?: number;
    LotSizeSquareFeet?: number;
    DaysOnMarket?: number;
    MlsStatus?: string;
    MajorChangeType?: string;
    ListAgentFullName?: string;
    ListOfficeName?: string;
    ParkingFeatures?: string[];
    Cooling?: string[];
    Heating?: string[];
    YearBuiltDetails?: string;
}
export interface BridgeODataCollection<T> {
    value?: T[];
    '@odata.count'?: number;
    '@odata.nextLink'?: string;
}
export interface BridgeRESTCollection<T> {
    success?: boolean;
    status?: number;
    bundle?: T[];
    total?: number;
}
