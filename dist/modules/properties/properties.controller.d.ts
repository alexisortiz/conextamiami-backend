import type { NextFunction, Request, Response } from 'express';
export declare function listProperties(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getPropertyById(req: Request, res: Response, next: NextFunction): Promise<void>;
