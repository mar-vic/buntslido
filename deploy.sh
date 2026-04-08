#!/usr/bin/env bash
set -euo pipefail

# REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_DIR="~/buntslido"

echo "==> Pulling latest code..."
git -C "$REPO_DIR" pull

echo "==> Building frontend..."
cd "$REPO_DIR/frontend"
npm install
npm run build

echo "==> Restarting service..."
sudo systemctl restart buntslido

echo "==> Done. Status:"
sudo systemctl status buntslido --no-pager -l
