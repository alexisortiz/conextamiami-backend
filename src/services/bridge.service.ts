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

function odataStringLiteral(value: string): string {
  return value.replace(/'/g, "''");
}

function propertyUrl(query: Record<string, string>): string {
  const base = `${env.bridgeApiBase.replace(/\/$/, '')}/${env.bridgeDataset}/Property`;
  const params = new URLSearchParams(query);
  params.set('access_token', assertToken());
  return `${base}?${params.toString()}`;
}

/** 🔥 Endpoint directo por ListingKey (CRÍTICO) */
function propertyByKeyUrl(listingKey: string): string {
  const base = `${env.bridgeApiBase.replace(/\/$/, '')}/${env.bridgeDataset}/Property('${listingKey}')`;
  return `${base}?access_token=${assertToken()}`;
}

function mediaUrl(query: Record<string, string>): string {
  const base = `${env.bridgeApiBase.replace(/\/$/, '')}/${env.bridgeDataset}/Media`;
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
    throw new BridgeRequestError('Upstream data source error', res.status);
  }

  return (await res.json()) as T;
}

const LIST_SELECT =
  'ListingId,ListingKey,ListPrice,City,BedroomsTotal,BathroomsTotalInteger,UnparsedAddress';

const DETAIL_SELECT =
  'ListingId,ListingKey,ListPrice,City,StateOrProvince,PostalCode,BedroomsTotal,BathroomsTotalInteger,UnparsedAddress,PublicRemarks,Latitude,Longitude';

/* =========================================================
   LIST
========================================================= */
export async function fetchPropertiesByCity(
  city: string,
  top: number
): Promise<BridgePropertyRaw[]> {
  const trimmed = city.trim();
  if (!trimmed) return [];

  const filter = `City eq '${odataStringLiteral(trimmed)}'`;

  // 1. Obtener propiedades base con la colección Media incluida
  const data = await fetchJson<BridgeODataCollection<BridgePropertyRaw>>(
    propertyUrl({
      $filter: filter,
      $select: `${LIST_SELECT},Media`,
      $top: String(Math.max(top, 1)),
    })
  );

  return data.value ?? [];
}

/* =========================================================
   DETAIL
========================================================= */
export async function fetchPropertyByListingId(
  listingId: string
): Promise<BridgePropertyRaw | null> {
  const trimmed = listingId.trim();
  if (!trimmed) return null;

  // 1. Buscar ListingKey
  const search = await fetchJson<BridgeODataCollection<BridgePropertyRaw>>(
    propertyUrl({
      $filter: `ListingId eq '${odataStringLiteral(trimmed)}'`,
      $select: DETAIL_SELECT,
      $top: '1',
    })
  );

  const base = search.value?.[0];
  if (!base?.ListingKey) return null;

  // 2. 🔥 Traer entidad completa (incluye Media real)
  const full = await fetchJson<BridgePropertyRaw>(
    propertyByKeyUrl(base.ListingKey)
  );

  // 🔥 fallback defensivo si Media no viene
  if (!Array.isArray(full.Media) || full.Media.length === 0) {
    const mediaData = await fetchJson<BridgeODataCollection<any>>(
      mediaUrl({
        $filter: `ResourceRecordKey eq '${odataStringLiteral(base.ListingKey)}'`,
        $select: 'MediaURL,Order,ResourceRecordKey',
      })
    );

    full.Media = (mediaData.value ?? []).sort(
      (a, b) => (a.Order ?? 9999) - (b.Order ?? 9999)
    );
  }

  return full;
}