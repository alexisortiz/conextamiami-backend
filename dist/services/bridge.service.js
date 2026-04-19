import { env } from '../config/env.js';
export class BridgeRequestError extends Error {
    statusCode;
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'BridgeRequestError';
    }
}
function assertToken() {
    if (!env.bridgeServerToken) {
        throw new BridgeRequestError('Bridge is not configured', 503);
    }
    return env.bridgeServerToken;
}
function odataStringLiteral(value) {
    return value.replace(/'/g, "''");
}
function normalizeCity(value) {
    return value
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(' ');
}
function propertyUrl(query) {
    const base = `${env.bridgeApiBase.replace(/\/$/, '')}/${env.bridgeDataset}/Property`;
    const params = new URLSearchParams(query);
    params.set('access_token', assertToken());
    return `${base}?${params.toString()}`;
}
async function fetchJson(url) {
    let res;
    try {
        res = await fetch(url, {
            method: 'GET',
            headers: { Accept: 'application/json' },
        });
    }
    catch {
        throw new BridgeRequestError('Network error', 503);
    }
    if (!res.ok) {
        throw new BridgeRequestError('Upstream data source error', res.status);
    }
    return (await res.json());
}
const LIST_SELECT = 'ListingId,ListingKey,ListPrice,City,BedroomsTotal,BathroomsTotalInteger,UnparsedAddress,PropertyType,PropertySubType,BuildingAreaTotal,DaysOnMarket,MlsStatus,MajorChangeType';
const DETAIL_SELECT = 'ListingId,ListingKey,ListPrice,City,StateOrProvince,PostalCode,BedroomsTotal,BathroomsTotalInteger,UnparsedAddress,PublicRemarks,Latitude,Longitude,PropertyType,PropertySubType,BuildingAreaTotal,LotSizeSquareFeet,DaysOnMarket,MlsStatus,MajorChangeType,ListAgentFullName,ListOfficeName,ParkingFeatures,Cooling,Heating,YearBuiltDetails';
export async function searchProperties(filters) {
    const orderBy = filters.priceSort === 'asc' || filters.priceSort === 'desc'
        ? `DaysOnMarket asc,ListPrice ${filters.priceSort}`
        : 'DaysOnMarket asc';
    const conditions = [];
    if (filters.city?.trim()) {
        conditions.push(`City eq '${odataStringLiteral(normalizeCity(filters.city))}'`);
    }
    if (filters.minPrice != null) {
        conditions.push(`ListPrice ge ${filters.minPrice}`);
    }
    if (filters.maxPrice != null) {
        conditions.push(`ListPrice le ${filters.maxPrice}`);
    }
    if (filters.minBeds != null) {
        conditions.push(`BedroomsTotal ge ${filters.minBeds}`);
    }
    if (filters.minBaths != null) {
        conditions.push(`BathroomsTotalInteger ge ${filters.minBaths}`);
    }
    if (filters.propertyType?.trim()) {
        conditions.push(`PropertyType eq '${odataStringLiteral(filters.propertyType.trim())}'`);
    }
    if (filters.listingStatus === 'active') {
        conditions.push(`((MlsStatus eq 'Active' or MlsStatus eq 'A' or MajorChangeType ne 'Closed') and MlsStatus ne 'Rented')`);
    }
    if (filters.listingStatus === 'inactive') {
        conditions.push(`(MajorChangeType eq 'Closed' or MlsStatus eq 'Rented' or (MlsStatus ne 'Active' and MlsStatus ne 'A'))`);
    }
    const data = await fetchJson(propertyUrl({
        $select: `${LIST_SELECT},Media`,
        $orderby: orderBy,
        $top: String(filters.limit ?? 50),
        $skip: String(filters.offset ?? 0),
        $count: 'true',
        ...(conditions.length > 0 ? { $filter: conditions.join(' and ') } : {}),
    }));
    return {
        items: data.value ?? [],
        total: typeof data['@odata.count'] === 'number' ? data['@odata.count'] : data.value?.length ?? 0,
    };
}
/* =========================================================
   DETAIL
========================================================= */
export async function fetchPropertyByListingId(listingId) {
    const trimmed = listingId.trim();
    if (!trimmed)
        return null;
    // 1. Obtener la propiedad y su lista de imágenes en una sola petición
    const search = await fetchJson(propertyUrl({
        $filter: `ListingId eq '${odataStringLiteral(trimmed)}'`,
        $select: `${DETAIL_SELECT},Media`,
        $top: '1',
    }));
    return search.value?.[0] ?? null;
}
