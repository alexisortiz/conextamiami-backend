import type { NextFunction, Request, Response } from 'express';
/**
 * En producción/Lambda, restringe `/api/*` a orígenes permitidos y (opcional) a una clave pública.
 * No sustituye WAF ni autenticación de usuarios: un cliente puede falsificar Origin/headers.
 */
export declare function publicAccessGuard(req: Request, res: Response, next: NextFunction): void;
