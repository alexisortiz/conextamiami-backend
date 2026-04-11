import { env } from '../config/env.js';
import type { BridgeODataCollection, BridgePropertyRaw } from './bridge.types.js';

export class BridgeRequestError extends Error {
  constructor(
    message: string,
    readonly statusCode: number
  ) {
    super(message);
    this.name = 'BridgeRequestError';
  }
}

function assertToken(): string {
  if (!env.bridgeServerToken) {
    throw new BridgeRequestError('Bridge is not configured', 503);
  }
  return env.bridgeServerToken;
}

/** OData: single quotes in strings are escaped by doubling. */
function odataStringLiteral(value: string): string {
  return value.replace(/'/g, "''");
}

function propertyUrl(query: Record<string, string>): string {
  const base = `${env.bridgeApiBase.replace(/\/$/, '')}/${env.bridgeDataset}/Property`;
  const params = new URLSearchParams(query);
  params.set('access_token', assertToken());
  return `${base}?${params.toString()}`;
}

async function fetchJson<T>(url: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
  } catch {
    throw new BridgeRequestError('Network error', 503);
  }

  if (!res.ok) {
    // Never log response body (may contain upstream hints); status is enough.
    throw new BridgeRequestError('Upstream data source error', res.status);
  }

  return (await res.json()) as T;
}

const LIST_SELECT =
  'ListingId,ListPrice,City,BedroomsTotal,BathroomsTotalInteger,UnparsedAddress,Media';
const DETAIL_SELECT =
  'ListingId,ListPrice,City,StateOrProvince,PostalCode,BedroomsTotal,BathroomsTotalInteger,UnparsedAddress,PublicRemarks,Latitude,Longitude,Media';

export async function fetchPropertiesByCity(
  city: string,
  top: number
): Promise<BridgePropertyRaw[]> {
  const trimmed = city.trim();
  if (!trimmed) {
    return [];
  }

  const filter = `City eq '${odataStringLiteral(trimmed)}'`;
  const url = propertyUrl({
    $filter: filter,
    $select: LIST_SELECT,
    $expand: 'Media',
    $top: String(Math.min(Math.max(top, 1), 50)),
  });

  const data = await fetchJson<BridgeODataCollection<BridgePropertyRaw>>(url);
  return data.value ?? [];
}

export async function fetchPropertyByListingId(
  listingId: string
): Promise<BridgePropertyRaw | null> {
  const trimmed = listingId.trim();
  if (!trimmed) {
    return null;
  }

  const filter = `ListingId eq '${odataStringLiteral(trimmed)}'`;
  const url = propertyUrl({
    $filter: filter,
    $select: DETAIL_SELECT,
    $expand: 'Media',
    $top: '1',
  });

  const data = await fetchJson<BridgeODataCollection<BridgePropertyRaw>>(url);
  const first = data.value?.[0];
  return first ?? null;
}
