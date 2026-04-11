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
export declare function mapListItem(raw: BridgePropertyRaw): PropertyListDto | null;
export declare function mapDetail(raw: BridgePropertyRaw): PropertyDetailDto | null;
