import type { NextFunction, Request, Response } from 'express';
import type { PropertyListResponse } from '@conextamiami/contracts';
import {
  searchProperties,
  fetchPropertyByListingId,
} from '../../services/bridge.service.js';
import { mapDetail, mapListItem } from '../../services/property-mapper.js';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 50;

function readPositiveInt(value: unknown, fallback: number): number {
  const parsed = typeof value === 'string' ? Number(value) : NaN;
  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback;
  }
  return parsed;
}

export async function listProperties(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const minPrice = req.query.minPrice ? Number(req.query.minPrice) : undefined;
    const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : undefined;
    const minBeds = req.query.minBeds ? Number(req.query.minBeds) : undefined;
    const minBaths = req.query.minBaths ? Number(req.query.minBaths) : undefined;
    const propertyType = typeof req.query.propertyType === 'string' ? req.query.propertyType : undefined;
    const priceSort =
      req.query.priceSort === 'asc' || req.query.priceSort === 'desc'
        ? req.query.priceSort
        : undefined;
    const listingStatus =
      req.query.listingStatus === 'active' || req.query.listingStatus === 'inactive'
        ? req.query.listingStatus
        : 'active';
    const city = typeof req.query.city === 'string' ? req.query.city : undefined;
    const page = readPositiveInt(req.query.page, DEFAULT_PAGE);
    const limit = Math.min(readPositiveInt(req.query.limit, DEFAULT_LIMIT), MAX_LIMIT);

    const rawData = await searchProperties({
      city,
      minPrice: !isNaN(minPrice as number) ? minPrice : undefined,
      maxPrice: !isNaN(maxPrice as number) ? maxPrice : undefined,
      minBeds: !isNaN(minBeds as number) ? minBeds : undefined,
      minBaths: !isNaN(minBaths as number) ? minBaths : undefined,
      propertyType,
      priceSort,
      listingStatus,
      limit,
      offset: (page - 1) * limit,
    });

    const items = rawData.items
      .map(mapListItem)
      .filter((item): item is NonNullable<typeof item> => item != null);

    const payload: PropertyListResponse = {
      items,
      total: rawData.total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(rawData.total / limit)),
    };

    res.json(payload);
  } catch (e) {
    next(e);
  }
}

export async function getPropertyById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.listingId ?? '';
    const raw = await fetchPropertyByListingId(decodeURIComponent(id));
    if (!raw) {
      res.status(404).json({ error: 'Property not found' });
      return;
    }

    const detail = mapDetail(raw);
    if (!detail) {
      res.status(404).json({ error: 'Property not found' });
      return;
    }

    res.json(detail);
  } catch (e) {
    next(e);
  }
}
