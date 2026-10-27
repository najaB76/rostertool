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

# 2. Install or Upgrade to Node.js 22 LTS (NodeSource)
NODE_MAJOR=0
if command -v node &> /dev/null; then
  NODE_MAJOR=$(node -v | cut -d'.' -f1 | tr -d 'v')
fi

if [ "$NODE_MAJOR" -lt 22 ]; then
  echo "[2/6] Installing/Upgrading to Node.js 22 LTS (current: $(node -v 2>/dev/null || echo 'none'))..."
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
  echo "Node.js successfully upgraded to $(node -v)"
else
  echo "[2/6] Node.js is already installed and supported: $(node -v)"
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
su - rostertool -c "cd ${INSTALL_DIR} && npm install"
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
