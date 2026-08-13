---
name: Gallery sharing and host updates
description: Self-hosted gallery links need server-rendered social metadata and compiled frontend/server replacement files.
---

For self-hosted Ginger gallery delivery, social crawlers need the Node server to inject gallery metadata into the SPA shell before serving it. The preview image should be an optimized thumbnail generated from the gallery's selected cover photo, not a site-wide asset.

**Why:** Social crawlers commonly do not execute the gallery's React data request, and mobile browsers block batches of separate downloads.

**How to apply:** Keep gallery downloads behind same-origin server endpoints with forced filenames, use one ZIP for batch downloads, and update both the compiled server bundle and frontend public assets on the host.