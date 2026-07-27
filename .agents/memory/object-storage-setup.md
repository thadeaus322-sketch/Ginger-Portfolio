---
name: Object Storage Setup
description: How object storage was provisioned and why PRIVATE_OBJECT_DIR was initially empty
---

The Replit GCS sidecar (port 1106) requires `setupObjectStorage()` to be called from the CodeExecution sandbox before `PRIVATE_OBJECT_DIR` is populated. Listing the secret as "available" does NOT mean it has a value — the bucket must be explicitly provisioned first.

**Rule:** If `PRIVATE_OBJECT_DIR not set` error appears at runtime, call `setupObjectStorage()` in CodeExecution first. It is idempotent.

**How to apply:** Any time file upload fails with that error, or when setting up a new environment that should support uploads.

**Why:** The secret slots exist in the environment before the bucket is created, but their values are empty strings until provisioning completes. The API server sees an empty string and throws.
