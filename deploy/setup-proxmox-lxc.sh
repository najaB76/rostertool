#!/usr/bin/env bash
# ==============================================================================
# RosterTool - Proxmox LXC Native Container Setup Script
# Tested on Debian 12 (Bookworm) and Ubuntu 22.04 / 24.04 LTS LXC containers
# ==============================================================================

set -euo pipefail

echo "=========================================================="
echo " Starting RosterTool Setup for Proxmox LXC Container"
echo "=========================================================="

# 1. Update OS and install prerequisites
echo "[1/6] Updating package manager and installing build tools..."
apt-get update -y
apt-get install -y curl git build-essential python3 sqlite3

# 2. Install Node.js 20 LTS (NodeSource)
if ! command -v node &> /dev/null; then
  echo "[2/6] Installing Node.js 20 LTS..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
else
  echo "[2/6] Node.js is already installed: $(node -v)"
fi

# 3. Create service user if not exists
echo "[3/6] Setting up system service user 'rostertool'..."
if ! id "rostertool" &>/dev/null; then
  useradd -r -m -d /opt/rostertool -s /bin/bash rostertool
fi

# 4. Prepare application directory
INSTALL_DIR="/opt/rostertool"
echo "[4/6] Setting up application files in ${INSTALL_DIR}..."

# If running script from cloned repo directory, sync files to /opt/rostertool
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
if [ "$SCRIPT_DIR" != "$INSTALL_DIR" ]; then
  mkdir -p "${INSTALL_DIR}"
  cp -r "${SCRIPT_DIR}/." "${INSTALL_DIR}/"
fi

cd "${INSTALL_DIR}"
mkdir -p data
chown -R rostertool:rostertool "${INSTALL_DIR}"

# 5. Install dependencies, build frontend, and run migrations as service user
echo "[5/6] Installing dependencies and building production assets..."
su - rostertool -c "cd ${INSTALL_DIR} && npm ci --omit=dev || npm install"
su - rostertool -c "cd ${INSTALL_DIR} && npm run build"
su - rostertool -c "cd ${INSTALL_DIR} && npm run db:migrate"
su - rostertool -c "cd ${INSTALL_DIR} && npm run db:seed"

# 6. Install and enable systemd service
echo "[6/6] Installing systemd service..."
cp deploy/rostertool.service /etc/systemd/system/rostertool.service
systemctl daemon-reload
systemctl enable --now rostertool.service

echo "=========================================================="
echo " RosterTool is successfully installed and running!"
echo " Service Status: $(systemctl is-active rostertool.service)"
echo " Local URL:      http://$(hostname -I | awk '{print $1}'):3000"
echo " View logs:      journalctl -u rostertool.service -f"
echo "=========================================================="
