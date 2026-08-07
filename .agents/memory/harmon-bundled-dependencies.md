---
name: Harmon bundled dependencies
description: Runtime dependency strategy for self-hosted Harmon Node deployments.
---

For self-hosted Harmon deployments, package installation may be incomplete even when the
application can start far enough to expose an error page. A pure-JavaScript runtime driver
such as `mysql2` can be bundled into the compiled server artifact to avoid relying on
Harmon's `node_modules` resolution at startup.

**Why:** The hosted server repeatedly launched a bundle that externalized `mysql2`, while
the corresponding application directory did not contain the installed package.

**How to apply:** Keep the dependency declared in `package.json`, but do not externalize
it in the server bundler when the deployment environment cannot reliably run `npm install`.
Verify the generated bundle starts locally before uploading it.