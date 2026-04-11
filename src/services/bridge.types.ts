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
}

export interface BridgeODataCollection<T> {
  value?: T[];
  '@odata.nextLink'?: string;
}
