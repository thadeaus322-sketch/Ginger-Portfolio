# 🌿 Ginger Studios & Creatives — Self-Hosting Guide

## What's in This Package

```
ginger-studios-deploy/
├── server/
│   ├── dist/           ← Built Node.js server (API + serves frontend)
│   ├── public/         ← Frontend static files + your images
│   └── package.json    ← Server dependencies
├── database/
│   └── schema.mysql.sql  ← Import this into phpMyAdmin
├── uploads/            ← File uploads land here (keep writable)
├── .env.example        ← Copy to .env and fill in your values
└── start.sh            ← Start/restart the server
```

---

## Requirements on Your Host

| Requirement | Minimum Version | Notes |
|------------|----------------|-------|
| Node.js    | 20+            | LTS recommended |
| MySQL      | 5.7.8+ or 8+   | Needed for JSON column type |
| phpMyAdmin | Any recent     | For managing the database |
| Web Server | Apache or Nginx | Reverse proxy to Node.js |

> **Shared hosting note:** Most cheap shared hosts (e.g. Hostinger, Namecheap Starter) do **not** support running Node.js applications. You need either:
> - A **VPS** (Hostinger VPS, DigitalOcean, Vultr, Hetzner — from $4-6/month), or
> - A host with **Node.js App support** in cPanel (e.g. Hostinger Business plan, A2 Hosting)

---

## Step 1 — Set Up the MySQL Database

1. Log into **phpMyAdmin** on your host.
2. Click **"New"** on the left sidebar to create a database.
3. Name it `ginger_studios` (or whatever you prefer), select **utf8mb4_unicode_ci** collation, click **Create**.
4. Click your new database in the left sidebar.
5. Click the **Import** tab at the top.
6. Click **Choose File** and select `database/schema.mysql.sql` from this package.
7. Click **Go** / **Import**.

You should now see three tables: `admin_users`, `galleries`, `site_images`.

> **Note:** MySQL 5.7.8+ is required for the JSON column type used by the `galleries` table. If your host runs an older MySQL, contact their support to upgrade.

---

## Step 2 — Upload Files to Your Server

### Option A — VPS (SSH access)

```bash
# Upload the package to your server
scp -r ginger-studios-deploy/ user@your-server:/var/www/ginger-studios

# SSH into the server
ssh user@your-server

cd /var/www/ginger-studios/server
npm install --production    # Install server dependencies
```

### Option B — cPanel File Manager or FTP

1. Zip the `ginger-studios-deploy` folder.
2. Upload the zip via cPanel File Manager or FTP to a folder like `/home/youraccount/ginger-studios`.
3. Extract it on the server.
4. Open cPanel Terminal (or SSH) and run:
   ```bash
   cd /home/youraccount/ginger-studios/server
   npm install --production
   ```

---

## Step 3 — Configure Environment Variables

1. In your `server/` folder, copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your real values:
   ```
   # Database — your MySQL connection string
   DATABASE_URL=mysql://DB_USER:DB_PASSWORD@localhost:3306/ginger_studios

   # Security — generate a strong random string (32+ characters)
   # You can use: openssl rand -base64 32
   SESSION_SECRET=your-very-long-random-secret-here

   # Admin credentials (used if no admin in database)
   ADMIN_EMAIL=admin@yourdomain.com
   ADMIN_PASSWORD_HASH=   ← see note below

   # Storage: use "local" for your own server uploads
   STORAGE_MODE=local
   UPLOADS_DIR=/var/www/ginger-studios/uploads

   # Server
   PORT=3001
   NODE_ENV=production
   ```

3. **Generating ADMIN_PASSWORD_HASH:**
   Your password is stored as a SHA-256 hex hash. Generate it with:
   ```bash
   echo -n "YourNewPassword123!" | sha256sum
   # Copy the hash (first 64 characters)
   ```
   Or use an online SHA-256 tool (search "sha256 online").

   **Default credentials (change these!):**
   - Email: `admin@gingerstudios.com`
   - Password: `GingerStudios2026!`

---

## Step 4 — Start the Server

Make the start script executable and run it:

```bash
chmod +x /var/www/ginger-studios/start.sh
/var/www/ginger-studios/start.sh
```

This starts the server with PM2 (process manager) so it stays running after reboots.

**If PM2 is not installed:**
```bash
npm install -g pm2
pm2 startup   # Follow the instructions to auto-start on reboot
```

---

## Step 5 — Configure Your Web Server (Reverse Proxy)

The Node.js app runs on port 3001 internally. Your web server (Apache/Nginx) must proxy requests to it.

### Nginx (recommended for VPS)

Create `/etc/nginx/sites-available/ginger-studios`:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Increase upload size limit for image uploads
    client_max_body_size 100M;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
    }

    # Serve uploaded files directly (more efficient)
    location /uploads/ {
        alias /var/www/ginger-studios/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable it:
```bash
ln -s /etc/nginx/sites-available/ginger-studios /etc/nginx/sites-enabled/
nginx -t     # Test config
systemctl reload nginx
```

### Apache (cPanel hosts)

Create/edit `.htaccess` in your public web root:
```apache
RewriteEngine On
RewriteRule ^(.*)$ http://127.0.0.1:3001/$1 [P,L]
```
Or use the **cPanel → Node.js App** interface to point to the app directory.

---

## Step 6 — Set Up SSL (HTTPS)

**Free SSL with Let's Encrypt (VPS with Nginx):**
```bash
apt install certbot python3-certbot-nginx   # Ubuntu/Debian
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

**cPanel hosts:** Use the free Let's Encrypt option in cPanel → SSL/TLS.

---

## Step 7 — Point Your Domain

In your domain registrar (Namecheap, GoDaddy, etc.):
- Set the **A record** to point to your server's IP address.
- Wait 15–60 minutes for DNS to propagate.

---

## How Image Uploads Work

When you upload images through the admin panel, they are saved to the `uploads/` folder on your server. The URL stored in the database will look like:

```
/api/storage/objects/uploads/uuid-filename
```

This is served directly by the Node.js server. The `uploads/` folder must be **writable** by the Node.js process:
```bash
chmod 755 /var/www/ginger-studios/uploads
chown -R www-data:www-data /var/www/ginger-studios/uploads   # if using nginx
```

---

## Admin Panel

Once running, visit: `https://yourdomain.com/admin`

Default login:
- **Email:** `admin@gingerstudios.com`
- **Password:** `GingerStudios2026!`

**Change these immediately** after first login via Admin → Settings.

---

## Maintenance

### Restart the server
```bash
pm2 restart ginger-studios
```

### View logs
```bash
pm2 logs ginger-studios
```

### Stop the server
```bash
pm2 stop ginger-studios
```

### Backup the database
```bash
mysqldump -u DB_USER -p ginger_studios > backup-$(date +%Y%m%d).sql
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| "Cannot connect to database" | Check `DATABASE_URL` in `.env`. Verify MySQL is running: `systemctl status mysql` |
| Upload fails with 413 | Increase Nginx `client_max_body_size` to `100M` |
| White screen / 502 error | Check `pm2 logs ginger-studios` for errors |
| Images not loading | Check that `uploads/` folder exists and is writable |
| Admin login fails | Check `ADMIN_EMAIL` and `ADMIN_PASSWORD_HASH` in `.env` |
| Port already in use | Change `PORT` in `.env` to e.g. `3002` and update Nginx config |

---

## Recommended Hosts (tested with Node.js)

| Host | Type | Price | Notes |
|------|------|-------|-------|
| Hetzner CX21 | VPS | ~€4/mo | Best value, Germany |
| Hostinger KVM 1 | VPS | ~$5/mo | Easy cPanel panel |
| DigitalOcean Droplet | VPS | $6/mo | Great docs |
| A2 Hosting Startup | Shared | ~$10/mo | Has Node.js support in cPanel |

---

*Generated for Ginger Studios & Creatives — July 2026*
