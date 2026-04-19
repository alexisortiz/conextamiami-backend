import { timingSafeEqual } from 'crypto';
import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env.js';

function constantTimeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

function originAllowed(origin: string, referer: string): boolean {
  for (const allowed of env.allowedOrigins) {
    if (origin === allowed) return true;
    if (referer.startsWith(`${allowed}/`)) return true;
  }
  return false;
}

/**
 * En producción/Lambda, restringe `/api/*` a orígenes permitidos y (opcional) a una clave pública.
 * No sustituye WAF ni autenticación de usuarios: un cliente puede falsificar Origin/headers.
 */
export function publicAccessGuard(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (!env.accessControlEnabled) {
    next();
    return;
  }

  const origin = (req.get('origin') ?? '').replace(/\/$/, '');
  const referer = req.get('referer') ?? '';

  if (!originAllowed(origin, referer)) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  if (env.publicClientKey) {
    const sent = req.get('x-public-client-key') ?? '';
    if (!constantTimeEqual(sent, env.publicClientKey)) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
  }

  next();
}
