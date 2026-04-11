import { Router } from 'express';
import { getPropertyById, listProperties } from './properties.controller.js';
export const propertiesRouter = Router();
propertiesRouter.get('/', listProperties);
propertiesRouter.get('/:listingId', getPropertyById);
