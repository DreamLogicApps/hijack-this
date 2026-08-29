import crypto from 'crypto';

export function verifyLemonSqueezySignature(rawBody: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = Buffer.from(hmac.update(rawBody).digest('hex'), 'utf8');
  const signatureBuffer = Buffer.from(signature, 'utf8');
  
  if (digest.length !== signatureBuffer.length) {
    return false;
  }
  
  return crypto.timingSafeEqual(digest, signatureBuffer);
}
