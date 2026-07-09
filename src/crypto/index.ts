import { createCipheriv, createDecipheriv, randomBytes, scryptSync, createHmac } from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LEN = 32;
const SALT_LEN = 32;
const IV_LEN = 16;
const TAG_LEN = 16;
const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;

export function deriveKey(passphrase: string, salt: Buffer): Buffer {
  return scryptSync(passphrase, salt, KEY_LEN, { N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P }) as Buffer;
}

export function encrypt(plaintext: string, passphrase: string): string {
  const salt = randomBytes(SALT_LEN);
  const iv = randomBytes(IV_LEN);
  const key = deriveKey(passphrase, salt);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  const result = Buffer.concat([salt, iv, tag, encrypted]);
  return result.toString('base64');
}

export function decrypt(ciphertext: string, passphrase: string): string {
  const data = Buffer.from(ciphertext, 'base64');
  const salt = data.subarray(0, SALT_LEN);
  const iv = data.subarray(SALT_LEN, SALT_LEN + IV_LEN);
  const tag = data.subarray(SALT_LEN + IV_LEN, SALT_LEN + IV_LEN + TAG_LEN);
  const encrypted = data.subarray(SALT_LEN + IV_LEN + TAG_LEN);
  const key = deriveKey(passphrase, salt);
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  return decipher.update(encrypted) + decipher.final('utf8');
}

export function hmac(data: string, secret: string): string {
  return createHmac('sha256', secret).update(data).digest('hex');
}

export function randomHex(bytes: number = 16): string {
  return randomBytes(bytes).toString('hex');
}

export function cryptoRandomInt(min: number, max: number): number {
  const range = max - min;
  const bytesNeeded = Math.ceil(Math.log2(range) / 8);
  const maxValid = Math.floor(256 ** bytesNeeded / range) * range;
  let value: number;
  do {
    const buf = randomBytes(bytesNeeded);
    value = [...buf].reduce((acc, byte, i) => acc + byte * 256 ** (bytesNeeded - 1 - i), 0);
  } while (value >= maxValid);
  return min + (value % range);
}

export function cryptoRandomFloat(): number {
  const buf = randomBytes(4);
  const int = buf.readUInt32BE(0);
  return int / 0xffffffff;
}
