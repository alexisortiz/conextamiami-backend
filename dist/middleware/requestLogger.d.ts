import type { NextFunction, Request, Response } from 'express';
/**
 * Registra cada petición y el cuerpo enviado (truncado si es muy largo).
 * Intercepta `res.send` para cubrir `res.json` y respuestas como las del rate limiter.
 */
export declare function requestLogger(req: Request, res: Response, next: NextFunction): void;
