import type { BridgePropertyRaw } from './bridge.types.js';
import type { PropertySearchFilters } from '@conextamiami/contracts';
export declare class BridgeRequestError extends Error {
    readonly statusCode: number;
    constructor(message: string, statusCode: number);
}
export interface PropertyFilters extends PropertySearchFilters {
    limit?: number;
    offset?: number;
}
export declare function searchProperties(filters: PropertyFilters): Promise<{
    items: BridgePropertyRaw[];
    total: number;
}>;
export declare function fetchPropertyByListingId(listingId: string): Promise<BridgePropertyRaw | null>;
