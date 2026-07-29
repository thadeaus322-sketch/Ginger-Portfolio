import { randomUUID } from 'crypto';
import { Readable } from 'stream';
import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import { File, Storage } from '@google-cloud/storage';

import {
  canAccessObject,
  getObjectAclPolicy,
  ObjectAclPolicy,
  ObjectPermission,
  setObjectAclPolicy,
} from './objectAcl';

const REPLIT_SIDECAR_ENDPOINT = 'http://127.0.0.1:1106';

// ─── Storage mode ────────────────────────────────────────────────────────────
// 'replit' — uses Replit's managed GCS sidecar (default on Replit)
// 'local'  — stores files on disk (default when self-hosting)
//
// Override with STORAGE_MODE=local|replit env var.
// Auto-detected from REPL_ID when not set.
export type StorageMode = 'replit' | 'local';

function detectStorageMode(): StorageMode {
  if (process.env.STORAGE_MODE === 'local') return 'local';
  if (process.env.STORAGE_MODE === 'replit') return 'replit';
  return process.env.REPL_ID ? 'replit' : 'local';
}

export const STORAGE_MODE: StorageMode = detectStorageMode();

// ─── Local storage helpers ────────────────────────────────────────────────────
export function getLocalUploadsDir(): string {
  return process.env.UPLOADS_DIR
    ? path.resolve(process.env.UPLOADS_DIR)
    : path.join(process.cwd(), 'uploads');
}

export function getLocalObjectPath(entityId: string): string {
  return path.join(getLocalUploadsDir(), entityId);
}

// ─── GCS client (replit mode only) ───────────────────────────────────────────
export const objectStorageClient: Storage | null =
  STORAGE_MODE === 'replit'
    ? new Storage({
        credentials: {
          audience: 'replit',
          subject_token_type: 'access_token',
          token_url: `${REPLIT_SIDECAR_ENDPOINT}/token`,
          type: 'external_account',
          credential_source: {
            url: `${REPLIT_SIDECAR_ENDPOINT}/credential`,
            format: {
              type: 'json',
              subject_token_field_name: 'access_token',
            },
          },
          universe_domain: 'googleapis.com',
        },
        projectId: '',
      })
    : null;

export class ObjectNotFoundError extends Error {
  constructor() {
    super('Object not found');
    this.name = 'ObjectNotFoundError';
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

export class ObjectStorageService {
  constructor() {}

  getMode(): StorageMode {
    return STORAGE_MODE;
  }

  // ── Replit-mode helpers ─────────────────────────────────────────────────────

  getPublicObjectSearchPaths(): Array<string> {
    const pathsStr = process.env.PUBLIC_OBJECT_SEARCH_PATHS || '';
    const paths = Array.from(
      new Set(
        pathsStr
          .split(',')
          .map((p) => p.trim())
          .filter((p) => p.length > 0),
      ),
    );
    if (paths.length === 0) {
      throw new Error(
        "PUBLIC_OBJECT_SEARCH_PATHS not set. Create a bucket in 'Object Storage' " +
          'tool and set PUBLIC_OBJECT_SEARCH_PATHS env var (comma-separated paths).',
      );
    }
    return paths;
  }

  getPrivateObjectDir(): string {
    const dir = process.env.PRIVATE_OBJECT_DIR || '';
    if (!dir) {
      throw new Error(
        "PRIVATE_OBJECT_DIR not set. Create a bucket in 'Object Storage' " +
          'tool and set PRIVATE_OBJECT_DIR env var.',
      );
    }
    return dir;
  }

  async searchPublicObject(filePath: string): Promise<File | null> {
    if (!objectStorageClient) throw new Error('GCS not available in local mode');
    for (const searchPath of this.getPublicObjectSearchPaths()) {
      const fullPath = `${searchPath}/${filePath}`;
      const { bucketName, objectName } = parseObjectPath(fullPath);
      const bucket = objectStorageClient.bucket(bucketName);
      const file = bucket.file(objectName);
      const [exists] = await file.exists();
      if (exists) return file;
    }
    return null;
  }

  async downloadObject(file: File, cacheTtlSec: number = 3600): Promise<Response> {
    const [metadata] = await file.getMetadata();
    const aclPolicy = await getObjectAclPolicy(file);
    const isPublic = aclPolicy?.visibility === 'public';
    const nodeStream = file.createReadStream();
    const webStream = Readable.toWeb(nodeStream) as ReadableStream;
    const headers: Record<string, string> = {
      'Content-Type':
        (metadata.contentType as string) || 'application/octet-stream',
      'Cache-Control': `${isPublic ? 'public' : 'private'}, max-age=${cacheTtlSec}`,
    };
    if (metadata.size) headers['Content-Length'] = String(metadata.size);
    return new Response(webStream, { headers });
  }

  // ── Upload URL (works for both modes) ──────────────────────────────────────

  /**
   * Returns { uploadURL, objectPath }.
   * In replit mode: uploadURL is a GCS presigned PUT URL.
   * In local mode:  uploadURL is a local API endpoint; caller must supply baseUrl.
   */
  async getObjectEntityUploadURLAndPath(
    baseUrl?: string,
  ): Promise<{ uploadURL: string; objectPath: string }> {
    const objectId = randomUUID();

    if (STORAGE_MODE === 'local') {
      // Browser will PUT directly to our own API
      const host = baseUrl ?? '';
      const uploadURL = `${host}/api/storage/uploads/local/${objectId}`;
      const objectPath = `/objects/uploads/${objectId}`;
      return { uploadURL, objectPath };
    }

    // Replit / GCS mode
    const privateObjectDir = this.getPrivateObjectDir();
    const fullPath = `${privateObjectDir}/uploads/${objectId}`;
    const { bucketName, objectName } = parseObjectPath(fullPath);
    const uploadURL = await signObjectURL({
      bucketName,
      objectName,
      method: 'PUT',
      ttlSec: 900,
    });
    const objectPath = this.normalizeObjectEntityPath(uploadURL);
    return { uploadURL, objectPath };
  }

  // Keep for backwards compat
  async getObjectEntityUploadURL(): Promise<string> {
    const { uploadURL } = await this.getObjectEntityUploadURLAndPath();
    return uploadURL;
  }

  async getObjectEntityFile(objectPath: string): Promise<File> {
    if (!objectStorageClient) throw new Error('GCS not available in local mode');
    if (!objectPath.startsWith('/objects/')) throw new ObjectNotFoundError();
    const parts = objectPath.slice(1).split('/');
    if (parts.length < 2) throw new ObjectNotFoundError();
    const entityId = parts.slice(1).join('/');
    let entityDir = this.getPrivateObjectDir();
    if (!entityDir.endsWith('/')) entityDir = `${entityDir}/`;
    const objectEntityPath = `${entityDir}${entityId}`;
    const { bucketName, objectName } = parseObjectPath(objectEntityPath);
    const bucket = objectStorageClient.bucket(bucketName);
    const objectFile = bucket.file(objectName);
    const [exists] = await objectFile.exists();
    if (!exists) throw new ObjectNotFoundError();
    return objectFile;
  }

  normalizeObjectEntityPath(rawPath: string): string {
    if (!rawPath.startsWith('https://storage.googleapis.com/')) {
      return rawPath;
    }
    const url = new URL(rawPath);
    const rawObjectPath = url.pathname;
    let objectEntityDir = this.getPrivateObjectDir();
    if (!objectEntityDir.endsWith('/')) objectEntityDir = `${objectEntityDir}/`;
    if (!rawObjectPath.startsWith(objectEntityDir)) return rawObjectPath;
    const entityId = rawObjectPath.slice(objectEntityDir.length);
    return `/objects/${entityId}`;
  }

  async trySetObjectEntityAclPolicy(
    rawPath: string,
    aclPolicy: ObjectAclPolicy,
  ): Promise<string> {
    const normalizedPath = this.normalizeObjectEntityPath(rawPath);
    if (!normalizedPath.startsWith('/')) return normalizedPath;
    const objectFile = await this.getObjectEntityFile(normalizedPath);
    await setObjectAclPolicy(objectFile, aclPolicy);
    return normalizedPath;
  }

  async canAccessObjectEntity({
    userId,
    objectFile,
    requestedPermission,
  }: {
    userId?: string;
    objectFile: File;
    requestedPermission?: ObjectPermission;
  }): Promise<boolean> {
    return canAccessObject({
      userId,
      objectFile,
      requestedPermission: requestedPermission ?? ObjectPermission.READ,
    });
  }
}

// ─── GCS helpers (replit mode only) ──────────────────────────────────────────

function parseObjectPath(p: string): { bucketName: string; objectName: string } {
  if (!p.startsWith('/')) p = `/${p}`;
  const parts = p.split('/');
  if (parts.length < 3) throw new Error('Invalid path: must contain at least a bucket name');
  return { bucketName: parts[1], objectName: parts.slice(2).join('/') };
}

async function signObjectURL({
  bucketName,
  objectName,
  method,
  ttlSec,
}: {
  bucketName: string;
  objectName: string;
  method: 'GET' | 'PUT' | 'DELETE' | 'HEAD';
  ttlSec: number;
}): Promise<string> {
  const request = {
    bucket_name: bucketName,
    object_name: objectName,
    method,
    expires_at: new Date(Date.now() + ttlSec * 1000).toISOString(),
  };
  const response = await fetch(
    `${REPLIT_SIDECAR_ENDPOINT}/object-storage/signed-object-url`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(30_000),
    },
  );
  if (!response.ok) {
    throw new Error(
      `Failed to sign object URL, errorcode: ${response.status}, ` +
        `make sure you're running on Replit`,
    );
  }
  const { signed_url: signedURL } = await response.json();
  return signedURL;
}
