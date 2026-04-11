import { Router } from 'express';
import { postContact } from './contact.controller.js';

export const contactRouter = Router();

contactRouter.post('/', postContact);
