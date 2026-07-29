#!/bin/bash
# ============================================================
# Ginger Studios & Creatives — Start Script
# Run this from the root of the deployed package:
#   chmod +x start.sh
#   ./start.sh
# ============================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_DIR="$SCRIPT_DIR/server"
ENV_FILE="$SCRIPT_DIR/.env"

# ── Check for .env ────────────────────────────────────────
if [ ! -f "$ENV_FILE" ]; then
  echo "ERROR: .env file not found at $ENV_FILE"
  echo "Copy .env.example to .env and fill in your values first."
  exit 1
fi

# ── Check Node.js ─────────────────────────────────────────
if ! command -v node &> /dev/null; then
  echo "ERROR: Node.js is not installed."
  echo "Install Node.js 20+ from https://nodejs.org"
  exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "ERROR: Node.js version 18+ is required. Current: $(node -v)"
  exit 1
fi

# ── Install/update dependencies ───────────────────────────
echo "Installing server dependencies..."
cd "$SERVER_DIR"
npm install --production --silent

# ── Create uploads directory ──────────────────────────────
source "$ENV_FILE"
if [ -n "$UPLOADS_DIR" ]; then
  mkdir -p "$UPLOADS_DIR"
  echo "Uploads directory: $UPLOADS_DIR"
fi

# ── Start with PM2 ────────────────────────────────────────
if command -v pm2 &> /dev/null; then
  echo "Starting with PM2..."
  pm2 start "$SERVER_DIR/dist/index.mjs" \
    --name "ginger-studios" \
    --env-file "$ENV_FILE" \
    --interpreter node \
    -- --enable-source-maps \
    || pm2 restart ginger-studios
  pm2 save
  echo ""
  echo "✅ Ginger Studios is running!"
  echo "   pm2 logs ginger-studios   — view logs"
  echo "   pm2 restart ginger-studios — restart"
  echo "   pm2 stop ginger-studios   — stop"
else
  # Fallback: run directly
  echo "PM2 not found. Running directly (install PM2 for production: npm install -g pm2)"
  echo ""
  export $(grep -v '^#' "$ENV_FILE" | xargs)
  node --enable-source-maps "$SERVER_DIR/dist/index.mjs"
fi
