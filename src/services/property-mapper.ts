import type { BridgePropertyRaw } from './bridge.types.js';
import type {
  PropertyDetail,
  PropertyListItem,
} from '@conextamiami/contracts';

function firstImageUrl(raw: BridgePropertyRaw): string | null {
  const media = raw.Media;
  if (!Array.isArray(media) || media.length === 0) return null;
  const url = media[0]?.MediaURL;
  return typeof url === 'string' && url.length > 0 ? url : null;
}

function allImageUrls(raw: BridgePropertyRaw): string[] {
  const media = raw.Media;
  if (!Array.isArray(media)) return [];
  return media
    .map((m) => m.MediaURL)
    .filter((u): u is string => typeof u === 'string' && u.length > 0);
}

export function mapListItem(raw: BridgePropertyRaw): PropertyListItem | null {
  const id = raw.ListingId != null ? String(raw.ListingId) : '';
  if (!id) return null;

  const title =
    (typeof raw.UnparsedAddress === 'string' && raw.UnparsedAddress.trim()) ||
    (typeof raw.City === 'string' && raw.City.trim()) ||
    'Listing';

  return {
    id,
    title,
    price: typeof raw.ListPrice === 'number' ? raw.ListPrice : null,
    city: typeof raw.City === 'string' ? raw.City : '',
    bedrooms: typeof raw.BedroomsTotal === 'number' ? raw.BedroomsTotal : null,
    bathrooms:
      typeof raw.BathroomsTotalInteger === 'number' ? raw.BathroomsTotalInteger : null,
    image: firstImageUrl(raw),
    propertyType: typeof raw.PropertyType === 'string' ? raw.PropertyType : null,
    propertySubType: typeof raw.PropertySubType === 'string' ? raw.PropertySubType : null,
    buildingAreaTotal: typeof raw.BuildingAreaTotal === 'number' ? raw.BuildingAreaTotal : null,
    daysOnMarket: typeof raw.DaysOnMarket === 'number' ? raw.DaysOnMarket : null,
    mlsStatus: typeof raw.MlsStatus === 'string' ? raw.MlsStatus : null,
  };
}

export function mapDetail(raw: BridgePropertyRaw): PropertyDetail | null {
  const base = mapListItem(raw);
  if (!base) return null;

  return {
    ...base,
    stateOrProvince:
      typeof raw.StateOrProvince === 'string' ? raw.StateOrProvince : null,
    postalCode: typeof raw.PostalCode === 'string' ? raw.PostalCode : null,
    description: typeof raw.PublicRemarks === 'string' ? raw.PublicRemarks : null,
    latitude: typeof raw.Latitude === 'number' ? raw.Latitude : null,
    longitude: typeof raw.Longitude === 'number' ? raw.Longitude : null,
    images: allImageUrls(raw),
    lotSizeSquareFeet: typeof raw.LotSizeSquareFeet === 'number' ? raw.LotSizeSquareFeet : null,
    listAgentFullName: typeof raw.ListAgentFullName === 'string' ? raw.ListAgentFullName : null,

    listOfficeName: typeof raw.ListOfficeName === 'string' ? raw.ListOfficeName : null,
    parkingFeatures: Array.isArray(raw.ParkingFeatures) ? raw.ParkingFeatures : [],
    cooling: Array.isArray(raw.Cooling) ? raw.Cooling : [],
    heating: Array.isArray(raw.Heating) ? raw.Heating : [],
    yearBuiltDetails: typeof raw.YearBuiltDetails === 'string' ? raw.YearBuiltDetails : null,
  };
}
