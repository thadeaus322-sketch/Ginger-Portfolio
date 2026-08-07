---
name: Harmon hosting auth recovery
description: MySQL self-hosted admin login recovery and credential-source behavior.
---

For Harmon/cPanel deployments, an `admin_users` query failure can be hidden by the
environment-credential fallback, while an existing stale database row can make
the fallback appear ineffective. The recovery switch is `AUTH_CREDENTIALS_SOURCE=env`;
after restoring access, save credentials through Admin Settings and remove the switch.

**Why:** The hosted error log showed repeated failures reading `admin_users`, and the
deployment guide contained a default SHA-256 value that did not match the server's
actual default password hash.

**How to apply:** Keep database credentials as the normal source. For recovery,
configure matching `ADMIN_EMAIL` and `ADMIN_PASSWORD_HASH`, temporarily set the
source to `env`, restart the host app, then switch back to database-backed login.