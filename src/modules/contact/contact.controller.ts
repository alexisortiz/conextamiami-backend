import type { Request, Response } from 'express';

export async function postContact(req: Request, res: Response): Promise<void> {
  const body = req.body as Record<string, unknown>;
  const name = body.name;
  const email = body.email;
  const message = body.message;
  const listingId = body.listingId;

  if (
    typeof name !== 'string' ||
    typeof email !== 'string' ||
    typeof message !== 'string'
  ) {
    res.status(400).json({ error: 'Invalid payload' });
    return;
  }

  if (listingId !== undefined && typeof listingId !== 'string') {
    res.status(400).json({ error: 'Invalid payload' });
    return;
  }

  if (
    name.length < 1 ||
    name.length > 200 ||
    email.length < 3 ||
    email.length > 320 ||
    message.length < 1 ||
    message.length > 10000
  ) {
    res.status(400).json({ error: 'Invalid payload' });
    return;
  }

  // Do not log email or message content (PII). Integrate SES/SendGrid here later.
  console.info(
    `[contact] received nameLength=${name.length} messageLength=${message.length}` +
      (typeof listingId === 'string' ? ` listingIdPresent=true` : '')
  );

  res.status(202).json({ ok: true });
}
