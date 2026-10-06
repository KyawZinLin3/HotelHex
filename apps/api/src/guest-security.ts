import { BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { createCipheriv, createDecipheriv, createHmac, randomBytes } from 'crypto';

function key() {
  const value = process.env.GUEST_ENCRYPTION_KEY;
  if (!value || !/^[a-f\d]{64}$/i.test(value)) throw new ServiceUnavailableException('Guest identity encryption key is not configured');
  return Buffer.from(value, 'hex');
}
export function normalizeName(value: string) { return value.normalize('NFKC').trim().replace(/\s+/g, ' ').toLocaleLowerCase(); }
export function normalizeIdentity(value: string) { return value.normalize('NFKC').replace(/\s+/g, '').toUpperCase(); }
export function identityHash(tenantId: string, value: string) {
  return createHmac('sha256', key()).update(tenantId + ':' + normalizeIdentity(value)).digest('hex');
}
export function encryptIdentity(value: string) {
  const iv = randomBytes(12), cipher = createCipheriv('aes-256-gcm', key(), iv);
  const body = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  return [iv, cipher.getAuthTag(), body].map(x => x.toString('base64')).join('.');
}
export function decryptIdentity(value: string) {
  const [iv, tag, body] = value.split('.').map(x => Buffer.from(x, 'base64'));
  const decipher = createDecipheriv('aes-256-gcm', key(), iv); decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(body), decipher.final()]).toString('utf8');
}
export function mask(value: string) { return value.length <= 4 ? '****' : value.slice(0, 2) + '******' + value.slice(-2); }
export function contactValue(type: string, value: string) {
  if (type === 'Email') {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) throw new BadRequestException('Invalid email address');
    return value.toLowerCase();
  }
  const phone = value.replace(/[\s().-]/g, '').replace(/^00/, '+');
  if (!/^\+?[0-9]{6,15}$/.test(phone)) throw new BadRequestException('Phone must contain 6 to 15 digits, with an optional country code');
  return phone;
}
export function textValue(value: unknown, label: string, required = false, max = 200): string | null {
  if (value == null || value === '') { if (required) throw new BadRequestException(label + ' is required'); return null; }
  if (typeof value !== 'string' || value.trim().length > max || (required && !value.trim())) throw new BadRequestException('Invalid ' + label);
  return value.trim() || null;
}
export function dateValue(value: unknown, label: string): Date | null {
  if (value == null || value === '') return null;
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new BadRequestException('Invalid ' + label);
  const date = new Date(value);
  if (isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) throw new BadRequestException('Invalid ' + label);
  return date;
}
