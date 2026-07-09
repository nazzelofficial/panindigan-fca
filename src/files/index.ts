import type { HttpClient } from '../http/index.js';
import type { TypedEventEmitter } from '../events/index.js';
import type { Logger } from '../logger/index.js';
import type { SessionTokens } from '../auth/index.js';
import { buildFormRequest, parseJsonResponse } from '../graphql/index.js';
import { FB_UPLOAD_URL } from '../constants/index.js';
import { UploadError, DownloadError } from '../errors/index.js';
import { createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';
import { v4 as uuidv4 } from 'uuid';

export interface UploadOptions {
  name: string;
  type: string;
  stream: Readable;
  size?: number;
  signal?: AbortSignal;
}

export interface UploadResult {
  attachmentToken: string;
  uploadId: string;
  name: string;
  type: string;
  size: number;
}

export interface DownloadOptions {
  destination: string;
  signal?: AbortSignal;
  onProgress?: (bytesTransferred: number, totalBytes: number) => void;
}

/** Build a multipart/form-data body as a raw Buffer — no binary-string conversion. */
function buildMultipartBuffer(
  fields: Array<{ name: string; value: string }>,
  file: { fieldName: string; fileName: string; contentType: string; data: Buffer },
  boundary: string,
): Buffer {
  const CRLF = Buffer.from('\r\n');
  const parts: Buffer[] = [];

  for (const field of fields) {
    parts.push(
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${field.name}"\r\n\r\n${field.value}\r\n`),
    );
  }

  parts.push(
    Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="${file.fieldName}"; filename="${file.fileName}"\r\nContent-Type: ${file.contentType}\r\n\r\n`,
    ),
  );
  parts.push(file.data);
  parts.push(CRLF);
  parts.push(Buffer.from(`--${boundary}--\r\n`));

  return Buffer.concat(parts);
}

export class FilesModule {
  constructor(
    private readonly http: HttpClient,
    private readonly emitter: TypedEventEmitter,
    private readonly logger: Logger,
    private readonly getTokens: () => SessionTokens,
  ) {}

  async upload(options: UploadOptions): Promise<UploadResult> {
    const tokens = this.getTokens();
    const uploadId = uuidv4();

    this.logger.info('Starting file upload', { tag: 'FILES', name: options.name, type: options.type, uploadId });
    this.emitter.emit('upload:progress', { uploadId, bytesTransferred: 0, totalBytes: options.size ?? 0, percent: 0 });

    // Collect stream into a Buffer (Facebook's upload endpoint requires the full body)
    const chunks: Buffer[] = [];
    let bytesRead = 0;

    try {
      for await (const chunk of options.stream) {
        const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as Uint8Array);
        chunks.push(buf);
        bytesRead += buf.byteLength;

        if (options.size) {
          const percent = Math.min(Math.round((bytesRead / options.size) * 100), 99);
          this.emitter.emit('upload:progress', {
            uploadId,
            bytesTransferred: bytesRead,
            totalBytes: options.size,
            percent,
          });
        }
      }
    } catch (err) {
      this.emitter.emit('upload:failed', { uploadId, error: err instanceof Error ? err : new Error(String(err)) });
      throw new UploadError(`Failed to read upload stream for "${options.name}"`, bytesRead, { name: options.name }, err);
    }

    const fileBuffer = Buffer.concat(chunks);
    const totalBytes = fileBuffer.byteLength;
    const boundary = `----PFCABoundary${uploadId.replace(/-/g, '').slice(0, 16)}`;

    const body = buildMultipartBuffer(
      [
        { name: 'upload_id', value: uploadId },
        { name: 'fb_dtsg', value: tokens.dtsg },
        { name: 'lsd', value: tokens.lsd },
      ],
      { fieldName: 'file', fileName: options.name, contentType: options.type, data: fileBuffer },
      boundary,
    );

    let parsed: Record<string, unknown>;
    try {
      const resp = await this.http.postBuffer(FB_UPLOAD_URL, body, {
        headers: {
          'content-type': `multipart/form-data; boundary=${boundary}`,
          'content-length': String(body.byteLength),
        },
        signal: options.signal,
      });
      const text = await resp.text();
      parsed = parseJsonResponse(text) as Record<string, unknown>;
    } catch (err) {
      this.emitter.emit('upload:failed', { uploadId, error: err instanceof Error ? err : new Error(String(err)) });
      throw new UploadError(`Upload failed for "${options.name}"`, bytesRead, { name: options.name }, err);
    }

    // Facebook returns the real attachment/file ID under several possible keys.
    // We MUST obtain a server-assigned ID — never fall back to the client-generated
    // uploadId, as that would produce an invalid attachment_id in downstream send calls.
    const payload = (parsed['payload'] as Record<string, unknown>) ?? parsed;
    const metadataArr = (payload['metadata'] as Array<Record<string, unknown>> | undefined) ?? [];
    const firstMeta = metadataArr[0] as Record<string, unknown> | undefined;

    const rawId =
      firstMeta?.['fbid'] ??
      firstMeta?.['attachment_id'] ??
      payload['fbid'] ??
      payload['attachment_id'] ??
      payload['attachment_token'];

    if (!rawId) {
      const errMsg = `Upload succeeded but Facebook returned no attachment ID for "${options.name}". Response: ${JSON.stringify(parsed).slice(0, 400)}`;
      const uploadErr = new UploadError(errMsg, totalBytes, { name: options.name });
      this.emitter.emit('upload:failed', { uploadId, error: uploadErr });
      throw uploadErr;
    }

    const attachmentToken = String(rawId);
    const result: UploadResult = { attachmentToken, uploadId, name: options.name, type: options.type, size: totalBytes };

    this.emitter.emit('upload:progress', { uploadId, bytesTransferred: totalBytes, totalBytes, percent: 100 });
    this.emitter.emit('upload:complete', { uploadId, attachmentToken });
    this.logger.info('File upload complete', { tag: 'FILES', name: options.name, uploadId, totalBytes });

    return result;
  }

  async download(url: string, options: DownloadOptions): Promise<void> {
    this.logger.info('Starting file download', { tag: 'FILES', url, destination: options.destination });

    const resp = await this.http.request({ url, method: 'GET', signal: options.signal });
    const totalBytes = Number(resp.headers['content-length'] ?? 0);

    this.emitter.emit('download:progress', { url, bytesTransferred: 0, totalBytes, percent: 0 });

    // Obtain the response as a Buffer and pipe it to a write stream — avoids
    // loading the full file into the JS heap a second time as a string.
    const writeStream = createWriteStream(options.destination);
    let bytesWritten = 0;

    try {
      const buf = await resp.buffer();
      bytesWritten = buf.byteLength;

      await pipeline(Readable.from(buf), writeStream);

      if (options.onProgress) options.onProgress(bytesWritten, totalBytes || bytesWritten);
    } catch (err) {
      // Destroy the write stream on failure to release the file handle
      writeStream.destroy();
      this.emitter.emit('download:failed', { url, error: err instanceof Error ? err : new Error(String(err)) });
      throw new DownloadError(`Download failed for "${url}"`, { url, destination: options.destination }, err);
    }

    this.emitter.emit('download:progress', {
      url,
      bytesTransferred: bytesWritten,
      totalBytes: totalBytes || bytesWritten,
      percent: 100,
    });
    this.emitter.emit('download:complete', { url, bytesWritten });
    this.logger.info('File download complete', { tag: 'FILES', url, bytesWritten });
  }
}
