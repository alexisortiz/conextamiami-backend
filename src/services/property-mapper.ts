import type { BridgePropertyRaw } from './bridge.types.js';

export interface PropertyListDto {
  id: string;
  title: string;
  price: number | null;
  city: string;
  bedrooms: number | null;
  bathrooms: number | null;
  image: string | null;
}

export interface PropertyDetailDto extends PropertyListDto {
  stateOrProvince: string | null;
  postalCode: string | null;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
  images: string[];
}

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

export function mapListItem(raw: BridgePropertyRaw): PropertyListDto | null {
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
  };
}

export function mapDetail(raw: BridgePropertyRaw): PropertyDetailDto | null {
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
  };
}
