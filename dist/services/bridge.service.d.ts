import type { BridgePropertyRaw } from './bridge.types.js';
export declare class BridgeRequestError extends Error {
    readonly statusCode: number;
    constructor(message: string, statusCode: number);
}
export declare function fetchPropertiesByCity(city: string, top: number): Promise<BridgePropertyRaw[]>;
export declare function fetchPropertyByListingId(listingId: string): Promise<BridgePropertyRaw | null>;
