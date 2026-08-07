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

Harmon/cPanel must run the compiled bundle from an application root of
`public_html/ginger/server` with startup file `dist/index.mjs`; uploading source
files alone does not change the hosted runtime.

**Why:** Hosted logs can contain entries from several failed restarts, including an
old PORT check and a missing compiled bundle, so a correct auth source change may
never be reached.

**How to apply:** Verify `/home/<account>/public_html/ginger/server/dist/index.mjs`
exists after extraction, then restart the Node application and inspect only the
fresh log from that restart.

The Harmon startup-file setting must reference the compiled file, not the `dist`
directory. A startup target ending in `/server//dist` makes LiteSpeed's launcher
call `require()` on the directory and fail with `MODULE_NOT_FOUND` before the
application starts.

**Why:** A later hosted log showed the launcher resolving
`/home/gvscomng/public_html/ginger/server//dist`, proving the configured startup
target was the directory rather than `dist/index.mjs`.

**How to apply:** Set Application root to `public_html/ginger/server` and Startup
file to `dist/index.mjs`, then restart. Verify that the extracted file exists at
that exact path.