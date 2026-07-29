# Ginger Studios & Creatives — Self-Hosting Guide

This guide covers deploying the app on any Linux VPS or shared-hosting account that supports Node.js 20+.

---

## What's in this package

```
ginger-studios-deploy/
├── dist/               ← compiled Node.js server (everything bundled)
├── public/             ← compiled React frontend (static files)
├── schema.sql          ← run this once on your database
├── .env.example        ← copy to .env and fill in your values
├── ecosystem.config.cjs← PM2 config (keeps the server running)
├── nginx.conf.example  ← Nginx reverse-proxy template
└── DEPLOYMENT_GUIDE.md ← this file
```

---

## Requirements

| Requirement | Version |
|---|---|
| Node.js | 20 or later |
| npm / pnpm | any recent |
| PostgreSQL | 14 or later |
| Nginx *(optional but recommended)* | any recent |
| PM2 *(optional but recommended)* | any recent |

> **Shared hosting note:** If your host only provides cPanel/FTP, it may not support running Node.js servers. You need a VPS (DigitalOcean, Hetzner, Linode, etc.) or a Node.js-compatible host (Railway, Render, Fly.io).

---

## Step 1 — Copy files to your server

Upload the contents of this zip to a folder on your server, e.g. `/var/www/ginger-studios`.

```bash
# Example using scp from your local machine
scp -r ginger-studios-deploy/ user@yourserver.com:/var/www/ginger-studios
```

Make sure the folder is owned by the user that will run Node.js:
```bash
sudo chown -R www-data:www-data /var/www/ginger-studios
# or replace www-data with your own unix user
```

---

## Step 2 — Create a PostgreSQL database

Log in to your server and create a database:

```bash
sudo -u postgres psql
```

```sql
CREATE USER ginger WITH PASSWORD 'choose-a-strong-password';
CREATE DATABASE ginger_studios OWNER ginger;
\q
```

---

## Step 3 — Run the schema (one time only)

```bash
psql -U ginger -d ginger_studios -h localhost -f /var/www/ginger-studios/schema.sql
```

You should see `CREATE TABLE`, `CREATE INDEX` output. This is safe to re-run.

---

## Step 4 — Configure environment variables

```bash
cd /var/www/ginger-studios
cp .env.example .env
nano .env   # or use your preferred editor
```

Fill in every value. Key ones:

### DATABASE_URL
```
DATABASE_URL=postgres://ginger:choose-a-strong-password@localhost:5432/ginger_studios
```

### SESSION_SECRET
Generate a strong random secret:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### ADMIN credentials (temporary — you'll change these after first login)
These are your **initial** login credentials. After you first log in, go to
**Admin → Settings** to change them to something private. Once changed, the
new credentials are stored in the database and the env vars are ignored.

Set the email you want to use for first login, then generate a temporary password hash:
```bash
node -e "
const { createHash } = require('crypto');
const hash = createHash('sha256').update('YourTempPassword').digest('hex');
console.log(hash);
"
```
Copy that hex string into `ADMIN_PASSWORD_HASH`.

### Storage
The default `STORAGE_MODE=local` stores uploaded photos in the `UPLOADS_DIR` folder on your server. Set it to an absolute path:
```
UPLOADS_DIR=/var/www/ginger-studios/uploads
```
Make sure the folder exists and is writable:
```bash
mkdir -p /var/www/ginger-studios/uploads
chmod 755 /var/www/ginger-studios/uploads
```

---

## Step 5 — Test the server manually

```bash
cd /var/www/ginger-studios
node ./dist/index.mjs
```

You should see:
```
{"level":"info","msg":"Server listening","port":8080}
```

Open `http://yourserver-ip:8080` in a browser — the site should load.  
Press **Ctrl+C** to stop it once confirmed.

---

## Step 6 — Keep it running with PM2

PM2 is a process manager that restarts the app if it crashes and starts it on reboot.

```bash
# Install PM2 globally
npm install -g pm2

# Start the app
cd /var/www/ginger-studios
pm2 start ecosystem.config.cjs

# Save the process list and auto-start on reboot
pm2 save
pm2 startup   # follow the printed command to enable auto-start
```

Useful PM2 commands:
```bash
pm2 status              # see all running apps
pm2 logs ginger-studios # view live logs
pm2 restart ginger-studios
pm2 stop ginger-studios
```

---

## Step 7 — Set up Nginx (recommended)

Nginx sits in front of Node.js and handles SSL, compression, and large file uploads cleanly.

```bash
sudo apt install nginx   # Ubuntu/Debian
```

Copy the example config:
```bash
sudo cp /var/www/ginger-studios/nginx.conf.example \
        /etc/nginx/sites-available/ginger-studios

sudo ln -s /etc/nginx/sites-available/ginger-studios \
           /etc/nginx/sites-enabled/

# Edit to replace yourdomain.com with your actual domain
sudo nano /etc/nginx/sites-available/ginger-studios

sudo nginx -t               # test config
sudo systemctl reload nginx
```

### Free SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Certbot automatically edits your Nginx config with the certificate paths and sets up auto-renewal.

---

## Step 8 — Point your domain

In your domain registrar (or Harmon's DNS panel), set an **A record**:

| Record | Name | Value |
|---|---|---|
| A | @ | your-server-ip |
| A | www | your-server-ip |

DNS changes take a few minutes to a few hours to propagate.

---

## Step 9 — First login: change your credentials immediately

1. Go to `https://yourdomain.com/admin` and log in with the temporary credentials from your `.env` file.
2. Click **Settings** in the left sidebar.
3. You'll see a yellow warning banner — change both your **email** and **password** right away.
4. Once saved, the new credentials are stored securely in the database. The env var values are no longer used.
5. Keep your new password safe — there is no recovery mechanism if you forget it.

---

## Logging in as admin

Go to `https://yourdomain.com/admin` and sign in with your credentials.

From the admin panel you can:
- **Dashboard** — view gallery stats and activity
- **Galleries** — create and share private client galleries
- **Site Images** — upload and manage homepage hero photos, card-stack images, and the photography portfolio
- **Settings** — change your admin email and password

---

## Updating the app

When a new version is available:
1. Download the new zip and extract it to a temp folder
2. Copy `dist/` and `public/` into `/var/www/ginger-studios/`, overwriting the old files
3. If the schema changed, re-run `schema.sql` (it uses `IF NOT EXISTS` so it's safe)
4. `pm2 restart ginger-studios`

> Your credentials stay in the database — they are not affected by updates.

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| White screen / 404 | Check that `public/index.html` exists in the deploy folder |
| `DATABASE_URL` error on start | Verify the connection string and that PostgreSQL is running |
| Image uploads fail | Check `UPLOADS_DIR` exists and is writable by the Node process |
| Admin login fails after credential change | Use the new email/password you set in Admin → Settings |
| Admin login fails (never changed credentials) | Use the email/password from your `.env` file |
| Port already in use | Change `PORT` in `.env` and update the `proxy_pass` port in nginx.conf |
| 413 Request Entity Too Large | Increase `client_max_body_size` in nginx.conf |
| Forgot password (credentials were changed) | Reset: connect to your DB and run `DELETE FROM admin_users;` — this restores the env var credentials |
