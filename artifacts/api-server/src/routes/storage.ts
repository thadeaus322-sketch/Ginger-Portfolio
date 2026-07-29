import { Readable } from 'stream';
import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import {
  RequestUploadUrlBody,
  RequestUploadUrlResponse,
} from '@workspace/api-zod';
import express, { Router, type IRouter, type Request, type Response } from 'express';
import { requireAdmin } from '../middlewares/auth.js';
import {
  ObjectNotFoundError,
  ObjectStorageService,
  STORAGE_MODE,
  getLocalUploadsDir,
} from '../lib/objectStorage.js';

const router: IRouter = Router();
const objectStorageService = new ObjectStorageService();

/**
 * POST /storage/uploads/request-url
 *
 * Request a presigned URL for file upload (admin only).
 * Client sends JSON metadata (name, size, contentType) — NOT the file.
 * Then uploads the file directly to the returned presigned URL.
 */
router.post(
  '/storage/uploads/request-url',
  requireAdmin,
  async (req: Request, res: Response) => {
    const parsed = RequestUploadUrlBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Missing or invalid required fields' });
      return;
    }

    try {
      const { name, size, contentType } = parsed.data;

      // Build base URL for local mode so the browser can PUT back to us
      const baseUrl =
        STORAGE_MODE === 'local'
          ? `${req.protocol}://${req.get('host')}`
          : undefined;

      const { uploadURL, objectPath } =
        await objectStorageService.getObjectEntityUploadURLAndPath(baseUrl);

      res.json(
        RequestUploadUrlResponse.parse({
          uploadURL,
          objectPath,
          metadata: { name, size, contentType },
        }),
      );
    } catch (error) {
      req.log.error({ err: error }, 'Error generating upload URL');
      res.status(500).json({ error: 'Failed to generate upload URL' });
    }
  },
);

/**
 * PUT /storage/uploads/local/:uuid  (local storage mode only)
 *
 * Receives a raw file body and saves it to disk.
 * This endpoint replaces the GCS presigned PUT in local mode.
 */
router.put(
  '/storage/uploads/local/:uuid',
  requireAdmin,
  express.raw({ type: '*/*', limit: '100mb' }),
  async (req: Request, res: Response) => {
    if (STORAGE_MODE !== 'local') {
      res.status(404).json({ error: 'Not available in this storage mode' });
      return;
    }
    const uuid = String(req.params.uuid ?? "");
    // Reject path traversal
    if (!/^[0-9a-f-]+$/i.test(uuid)) {
      res.status(400).json({ error: 'Invalid upload id' });
      return;
    }
    try {
      const uploadsDir = path.join(getLocalUploadsDir(), 'uploads');
      await fsp.mkdir(uploadsDir, { recursive: true });
      const filePath = path.join(uploadsDir, uuid);
      await fsp.writeFile(filePath, req.body as Buffer);
      res.status(200).end();
    } catch (error) {
      req.log.error({ err: error }, 'Error saving local upload');
      res.status(500).json({ error: 'Failed to save file' });
    }
  },
);

/**
 * GET /storage/public-objects/*
 *
 * Serve public assets from PUBLIC_OBJECT_SEARCH_PATHS.
 * Unconditionally public — no authentication or ACL checks.
 */
router.get(
  '/storage/public-objects/*filePath',
  async (req: Request, res: Response) => {
    if (STORAGE_MODE === 'local') {
      res.status(404).json({ error: 'Public object search not available in local mode' });
      return;
    }
    try {
      const raw = req.params.filePath;
      const filePath = Array.isArray(raw) ? raw.join('/') : raw;
      const file = await objectStorageService.searchPublicObject(filePath);
      if (!file) {
        res.status(404).json({ error: 'File not found' });
        return;
      }

      const response = await objectStorageService.downloadObject(file);

      res.status(response.status);
      response.headers.forEach((value, key) => res.setHeader(key, value));

      if (response.body) {
        const nodeStream = Readable.fromWeb(
          response.body as ReadableStream<Uint8Array>,
        );
        nodeStream.pipe(res);
      } else {
        res.end();
      }
    } catch (error) {
      req.log.error({ err: error }, 'Error serving public object');
      res.status(500).json({ error: 'Failed to serve public object' });
    }
  },
);

/**
 * GET /storage/objects/*
 *
 * Serve uploaded object entities (images uploaded by admin).
 * Public access — clients can view their gallery photos.
 */
router.get('/storage/objects/*path', async (req: Request, res: Response) => {
  const raw = req.params.path;
  const wildcardPath = Array.isArray(raw) ? raw.join('/') : raw;

  // ── Local disk mode ────────────────────────────────────────────────────────
  if (STORAGE_MODE === 'local') {
    try {
      const filePath = path.join(getLocalUploadsDir(), wildcardPath);
      // Prevent path traversal
      const uploadsDir = getLocalUploadsDir();
      if (!filePath.startsWith(uploadsDir)) {
        res.status(400).json({ error: 'Invalid path' });
        return;
      }
      if (!fs.existsSync(filePath)) {
        res.status(404).json({ error: 'Object not found' });
        return;
      }
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      res.sendFile(filePath);
    } catch (error) {
      req.log.error({ err: error }, 'Error serving local object');
      res.status(500).json({ error: 'Failed to serve object' });
    }
    return;
  }

  // ── GCS / Replit mode ──────────────────────────────────────────────────────
  try {
    const objectPath = `/objects/${wildcardPath}`;
    const objectFile =
      await objectStorageService.getObjectEntityFile(objectPath);

    const response = await objectStorageService.downloadObject(objectFile);

    res.status(response.status);
    response.headers.forEach((value, key) => res.setHeader(key, value));

    if (response.body) {
      const nodeStream = Readable.fromWeb(
        response.body as ReadableStream<Uint8Array>,
      );
      nodeStream.pipe(res);
    } else {
      res.end();
    }
  } catch (error) {
    if (error instanceof ObjectNotFoundError) {
      req.log.warn({ err: error }, 'Object not found');
      res.status(404).json({ error: 'Object not found' });
      return;
    }
    req.log.error({ err: error }, 'Error serving object');
    res.status(500).json({ error: 'Failed to serve object' });
  }
});

export default router;
