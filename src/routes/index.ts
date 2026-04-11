import { Router } from 'express';
import { API_SERVICES } from '../config/api-catalog.js';
import { contactRouter } from '../modules/contact/contact.routes.js';
import { propertiesRouter } from '../modules/properties/properties.routes.js';

export const apiRouter = Router();

apiRouter.get('/', (_req, res) => {
  res.json({ services: API_SERVICES });
});

apiRouter.use('/properties', propertiesRouter);
apiRouter.use('/contact', contactRouter);
