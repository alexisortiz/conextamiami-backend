import type { BridgePropertyRaw } from './bridge.types.js';
import type { PropertyDetail, PropertyListItem } from '@conextamiami/contracts';
export declare function mapListItem(raw: BridgePropertyRaw): PropertyListItem | null;
export declare function mapDetail(raw: BridgePropertyRaw): PropertyDetail | null;
