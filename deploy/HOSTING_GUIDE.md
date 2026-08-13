# 🌿 Ginger Studios & Creatives — Hosting Guide (cPanel Node.js App)

This guide is written specifically for hosts with **cPanel + Node.js App** (like Harmon Web Host).

---

## What's in This Package

```
ginger-studios-deploy/
├── server/
│   ├── dist/           ← Built Node.js server (your "Application file")
│   ├── public/         ← Frontend + your images
│   └── package.json    ← Server dependencies (mysql2, sharp)
├── database/
│   └── schema.mysql.sql  ← Import this into phpMyAdmin
├── uploads/            ← Uploaded images are saved here
├── .env.example        ← Reference — you'll enter these in cPanel
└── HOSTING_GUIDE.md    ← This file
```

---

## Step 1 — Create the MySQL Database in cPanel

1. Log into **cPanel**.
2. Find **MySQL Databases** (under Databases section).
3. Under **Create New Database**, type a name e.g. `gingerstudios` → Click **Create Database**.
4. Under **Create New User**, type a username + strong password → Click **Create User**.
5. Under **Add User to Database**, select your new user and database → Click **Add** → tick **All Privileges** → **Make Changes**.
6. Write down your credentials:
   - Database name: `youraccount_gingerstudios`
   - Username: `youraccount_dbuser`
   - Password: `your-db-password`
   - Host: `localhost`

> **Note:** cPanel prefixes your database and username with your cPanel account name (e.g. `johndo_gingerstudios`). The full name is shown on the MySQL Databases page.

---

## Step 2 — Import the Database Schema in phpMyAdmin

1. In cPanel, open **phpMyAdmin**.
2. Click your new database in the left panel.
3. Click the **Import** tab at the top.
4. Click **Choose File** → select `database/schema.mysql.sql` from this package.
5. Scroll down → click **Go**.

You should now see three tables listed: `admin_users`, `galleries`, `site_images`.

---

## Step 3 — Upload Files via File Manager

1. In cPanel, open **File Manager**.
2. Navigate to your web root (usually `public_html/`) or create a subfolder, e.g. `public_html/ginger/`.
3. Click **Upload** and upload the entire `ginger-studios-deploy` folder contents (or zip and extract).

   **After uploading, your structure should look like:**
   ```
   public_html/
   └── ginger/                   ← or wherever you chose
       ├── server/
       │   ├── dist/
       │   ├── public/
       │   └── package.json
       ├── uploads/
       └── database/
   ```

---

## Step 4 — Set Up the Node.js App in cPanel

1. In cPanel, find **Setup Node.js App** (under Software section).
2. Click **Create Application**.
3. Fill in:

   | Field | Value |
   |-------|-------|
   | **Node.js version** | 20 (or highest available) |
   | **Application mode** | Production |
   | **Application root** | `public_html/ginger/server` |
   | **Application URL** | Your domain or subdomain (e.g. `yourdomain.com` or `ginger.yourdomain.com`) |
   | **Application startup file** | `dist/index.mjs` |

4. Click **Create** (or **Save**).

---

## Step 5 — Set Environment Variables

Still inside **Setup Node.js App**, find the **Environment Variables** section and add each of these:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | `mysql://youraccount_dbuser:your-db-password@localhost:3306/youraccount_gingerstudios` |
| `SESSION_SECRET` | A long random string — see below to generate one |
| `ADMIN_EMAIL` | `admin@yourdomain.com` |
| `ADMIN_PASSWORD_HASH` | SHA-256 hash of your admin password — see below |
| `AUTH_CREDENTIALS_SOURCE` | Leave unset for normal database-backed login; set to `env` only for recovery |
| `STORAGE_MODE` | `local` |
| `UPLOADS_DIR` | `/home/youraccount/public_html/ginger/uploads` (absolute path) |
| `NODE_ENV` | `production` |
| `PORT` | `3000` (cPanel usually assigns this automatically — if it does, skip this) |

**Click Save / Run NPM Install** after adding all variables.

### Generating SESSION_SECRET

Go to any online random string generator and generate a 32+ character string, e.g.:
`xK9mP2qL8nR5sT1vW4yZ7aB0cE3fH6j`

### Generating ADMIN_PASSWORD_HASH

Your admin password is stored as a SHA-256 hash. To generate it:

1. Go to **[emn178.github.io/online-tools/sha256.html](https://emn178.github.io/online-tools/sha256.html)**
2. Type your desired password (e.g. `MyNewPassword2026!`) in the Input field
3. Copy the Output — that's your `ADMIN_PASSWORD_HASH`

**Default password** (change this!): `GingerStudios2026!`
**Its hash** (copy if keeping the default): `f332fe25fa2eecfc3e58d7fa337f918b5d3fabe9ec9379a5149f17d9e74c3174`

---

## Step 6 — Install Dependencies

In the **Setup Node.js App** interface, look for a button that says **Run NPM Install** or **Install Dependencies**. Click it.

This installs `mysql2` and `sharp` from the `server/package.json` file.

If there's no button, use the **cPanel Terminal** (under Advanced):
```bash
cd ~/public_html/ginger/server
npm install --production
```

---

## Step 7 — Start the App

In **Setup Node.js App**, click the **Start** button (or **Restart** if it was already running).

The status should change to **Running** (green dot).

---

## Step 8 — Test

Visit your domain in a browser. You should see the Ginger Studios website.

**Admin panel:** `https://yourdomain.com/admin`
- Email: `admin@yourdomain.com` (or whatever you set)
- Password: `GingerStudios2026!` (or whatever you chose)

**Change your password immediately** via Admin → Settings.

---

## How Uploads Work

When you upload images through the admin panel:
- Files are saved to the `uploads/` folder on your server
- The image URL stored in the database looks like: `/api/storage/objects/uploads/[filename]`
- The server serves these files directly

**Make sure the uploads folder is writable:**

In cPanel Terminal:
```bash
chmod 755 ~/public_html/ginger/uploads
```

---

## Updating the Site

If you need to deploy an updated version:
1. Replace files in `server/dist/` and `server/public/` via File Manager
2. Click **Restart** in Setup Node.js App
3. If the database schema changed, import the matching non-destructive
   migration from the `database/` folder. Do not import the full
   `schema.mysql.sql` into a live database unless you intend to recreate all
   application tables.

### Important: deploy the server bundle after a code fix

Harmon runs the compiled files in `server/dist/`, not the TypeScript source
files. If you only change or upload source files, the hosted app continues to
run the old code. For the public site-images/auth middleware fix, replace the
contents of `server/dist/` with the rebuilt `dist/` files, then restart the
Node application. Do not replace the database or the existing `server/public/`
files unless the frontend itself is being updated.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| "Application failed to start" | Check **Error Logs** in cPanel → double-check `DATABASE_URL` format |
| White screen / nothing loads | Make sure Application startup file is `dist/index.mjs` |
| Database connection error | Verify MySQL username/password/database name in `DATABASE_URL` |
| Upload fails | Check `UPLOADS_DIR` is set to the correct absolute path and folder is writable |
| `site_images` query fails | In phpMyAdmin, select the database named in `DATABASE_URL`, import `site-images-only.mysql.sql`, then restart the Node app |
| Admin login fails | Verify `ADMIN_EMAIL` and `ADMIN_PASSWORD_HASH` match your chosen credentials; the hash must be SHA-256 of the exact password |
| "Cannot find module mysql2" | Run NPM Install again in Setup Node.js App |

### Finding the Absolute Path for UPLOADS_DIR

In cPanel Terminal, run:
```bash
echo ~/public_html/ginger/uploads
```
Copy the output — that's your `UPLOADS_DIR`.

---

## Recovering access when the database admin row is wrong

If the server log contains `select ... from admin_users` and login still returns
`Invalid credentials`, the database may contain an old admin email/password.
Temporarily add `AUTH_CREDENTIALS_SOURCE=env` in Setup Node.js App, make sure
`ADMIN_EMAIL` and `ADMIN_PASSWORD_HASH` match the credentials you want, and
restart the application. This bypasses the admin row for login only.

After logging in, go to **Admin → Settings** and save the credentials. Then
remove `AUTH_CREDENTIALS_SOURCE` (or set it back to `database`) and restart.
The normal database-backed login will then be used.

If the old `.env` email still works after changing the email in Admin →
Settings, `AUTH_CREDENTIALS_SOURCE=env` is still active or the server is
running an older `dist/` bundle. Remove that variable, deploy the rebuilt
server bundle, restart the app, log out, and then log in with the new
database-backed email.

The homepage and photography page use `GET /api/site-images` publicly. A
`401 Not authenticated` response for that request indicates an old server
bundle whose router-wide admin middleware is blocking public routes; it is not
a reason to recreate or migrate the database.

If the `admin_users` table does not exist, import
`deploy/admin-recovery.mysql.sql` in phpMyAdmin. It creates only the
`admin_users` table, resets only admin accounts, and seeds the default account.
It does not touch galleries, site images, or uploads. Do not import the full
`schema.mysql.sql` into a live database unless you intend to recreate all
application tables.

### Fixing the `site_images` query error

If the admin dashboard shows an error like:

```text
Failed query: select ... from `site_images` ...
```

the running app is connected to a MySQL database that does not contain the
current application tables. This is a database initialization issue, not an
image-file issue.

1. Open the `.env` used by the Harmon Node application and note the database
   name at the end of `DATABASE_URL`.
2. In phpMyAdmin, select that exact database.
3. Import `site-images-only.mysql.sql` from this package. It uses
   `CREATE TABLE IF NOT EXISTS` and touches only `site_images`; it does not
   touch admin accounts, galleries, or uploaded-file records.
4. Restart the Node application in Harmon.
5. Reload `/admin/site-images` and upload a small image.

The SQL uses `VARCHAR` for image metadata instead of `TEXT DEFAULT`, which
avoids a common incompatibility on older MySQL/MariaDB versions.

## Your DATABASE_URL Format

```
mysql://USERNAME:PASSWORD@localhost:3306/DATABASENAME
```

Example with cPanel-prefixed names:
```
mysql://johndo_dbuser:MySecretPass123@localhost:3306/johndo_gingerstudios
```

## Google Drive setup (Harmon / self-hosted)

The **Save to Google Drive** button uses Google Identity Services in the browser.
It does not use Replit's Google connection, so the hosted site needs its own Google
OAuth web client ID.

### 1. Create the Google OAuth client

1. Open [Google Cloud Console](https://console.cloud.google.com/).
2. Create or select a project.
3. Open **APIs & Services → Library**, search for **Google Drive API**, and enable it.
4. Open **APIs & Services → OAuth consent screen** and complete the app details.
   For a private studio site, **External** is normally the right choice. Add the
   Google accounts that will test the app under **Test users** while the app is
   still in testing.
5. Open **APIs & Services → Credentials → Create credentials → OAuth client ID**.
6. Choose **Web application**.
7. Under **Authorized JavaScript origins**, add the exact origins clients will use,
   for example:

   ```
   https://yourdomain.com
   https://www.yourdomain.com
   ```

   Do not add a path such as `/gallery`, and do not add a trailing slash. Add
   `http://localhost:5173` only if you will test locally.
8. Copy the generated **Client ID**. Never put a client secret in the browser or
   in the website files; this flow only needs the public client ID.

### 2. Configure the hosted site

After uploading the updated files, open:

```
server/public/google-config.js
```

Replace the empty value:

```js
window.GINGER_CONFIG = {
  googleClientId: "your-client-id.apps.googleusercontent.com",
};
```

The Client ID is public and belongs in this browser file. Do not add a Google
client secret. Restart the Node.js application in cPanel after saving.

If you prefer to build from source instead, you can set
`VITE_GOOGLE_CLIENT_ID` before running the frontend build. The `google-config.js`
method is recommended for Harmon because it lets you change the ID without
rebuilding the React bundle.

### 3. Test the Drive flow

1. Open a valid client gallery on the exact HTTPS domain registered above.
2. Click **Save to Google Drive**.
3. Sign in with a Google account listed as a test user if the OAuth app is still
   in testing.
4. Approve the `drive.file` permission.
5. Confirm that a folder named `<shoot title> — Ginger Studios` appears in Drive.

The permission is limited to files and folders created by this app. Existing
Drive files are not exposed to the site.

### Google Drive troubleshooting

| Message | Fix |
|---|---|
| `Google Drive is not configured yet` | Check `server/public/google-config.js`, then restart the Node app. |
| `origin_mismatch` | Add the exact `https://yourdomain.com` origin in Google Cloud; do not include a path. |
| App not verified / test-user warning | Add the signing-in Google account under OAuth consent screen → Test users, or complete Google's verification process before production use. |
| Popup blocked | Allow popups for the gallery domain and click the button again. |
| Images fail to upload | Ensure the hosted image URLs are publicly reachable over HTTPS and the gallery page is allowed to fetch them. |

## Share preview logo

The site's Open Graph and X/Twitter metadata now points to:

```
/images/ginger-studios-share.png
```

Replace the contents of the hosted `server/public/` folder with the contents of
the updated frontend build. This is important because `index.html` points to a
new hashed JavaScript file as well as the new image. The folder must include:

```
server/public/index.html
server/public/google-config.js
server/public/images/ginger-studios-share.png
server/public/assets/...
```

Social platforms cache previews, so after deploying, test the full URL again
using the platform's link debugger or share inspector. WhatsApp and Facebook may
keep the old image cached for a while; a different query string on the shared
URL can force a fresh crawl.

---

*Generated for Harmon Web Host — Ginger Studios & Creatives — July 2026*
