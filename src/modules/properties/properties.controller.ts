import type { NextFunction, Request, Response } from 'express';
import {
  fetchPropertiesByCity,
  fetchPropertyByListingId,
} from '../../services/bridge.service.js';
import { mapDetail, mapListItem } from '../../services/property-mapper.js';

export async function listProperties(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const city = typeof req.query.city === 'string' ? req.query.city : '';
    if (!city.trim()) {
      res.status(400).json({ error: 'Missing or empty city parameter' });
      return;
    }

    const raw = await fetchPropertiesByCity(city, 50);
    const items = raw
      .map(mapListItem)
      .filter((item): item is NonNullable<typeof item> => item != null);

    res.json({ items });
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
