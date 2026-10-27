# Hostel Volunteer RosterTool

A self-hosted management and rostering tool designed specifically for hostels. Built with **Node.js, TypeScript, Fastify, SQLite (WAL mode)**, and **React + Vite**.

Designed for native deployment directly inside a **Proxmox VE Linux Container (LXC)** without Docker overhead.

---

## Key Features

- **Weekly Roster Grid (Mon–Sun)**: Clean overview of Housekeeping (10:00–14:00) and Reception (AM, PM, Graveyard) shifts with visual understaffed highlighting.
- **National Flags Visibility**: High-visibility ISO 3166-1 alpha-2 country flags displayed immediately beside volunteer names across all roster cells, cards, and dropdowns (matching hostel visual conventions).
- **Volunteer Lifecycle & Application Sources**: Track candidates from `Applied` $\to$ `Accepted` (stay dates & pro-rated hours) $\to$ `Active` $\to$ `Departed` (stay review & re-hire recommendation) / `Cancelled`. Supports extensible sources (`HelpEx`, `WorkAway`, `Worldpackers`, `Guest`, + custom).
- **Headcount Capacity Management**: 
  - Target baseline: **12 volunteers** on site.
  - Automatic visual warnings for low capacity (**10–11**) and mid-week handover turnover overlap (**13–15**).
  - Real-time stay date capacity impact preview during application reviews.
- **Auto-Populate Scheduling Engine**:
  - Deterministic constraint-satisfaction solver.
  - **Hard constraints**: stay date windows, approved time-off, 16h weekly caps, mid-week pro-rating, role eligibility, 9h turnaround rest, and trainee-trainer concurrent pairing.
  - **Soft constraints**: 3 consecutive days off in 14-day rolling window, weekend duty fairness.
  - Instant manual overrides by management at any time.
- **Passwordless Volunteer Portal**:
  - Mobile-optimized view accessible via unique cryptographic magic links.
  - Volunteers view upcoming shifts and the hostel weekly schedule.
  - Self-service submission of day-off requests with manager approval flow.
- **Paid Staff & PTO Handling**: Assign regular paid staff to reception day shifts and backfill volunteer coverage during staff PTO.

---

## Proxmox LXC Container Deployment Guide (Native / No Docker)

### 1. Recommended Proxmox LXC Sizing
- **OS Template**: Debian 12 (Bookworm) or Ubuntu 24.04 LTS
- **Cores**: 1 or 2 vCPUs
- **Memory**: 1 GB RAM (512 MB minimum, 2 GB recommended for high concurrent build headroom)
- **Disk**: 8 GB to 16 GB rootfs
- **Network**: Static or DHCP IP on your hostel's LAN (e.g. `192.168.1.50`)

### 2. Automated One-Command Installation
Inside your newly created LXC container (via Proxmox Web Console or SSH):

```bash
# Clone the repository
git clone https://github.com/najaB76/rostertool.git /opt/rostertool

# Run the automated Proxmox LXC setup script
cd /opt/rostertool
bash deploy/setup-proxmox-lxc.sh
```

The script will automatically:
1. Install system prerequisites (`curl`, `git`, `build-essential`, `python3`, `sqlite3`).
2. Install Node.js 22 LTS.
3. Create a dedicated unprivileged `rostertool` system user.
4. Install npm dependencies and build production assets (`npm run build`).
5. Initialize the SQLite database and seed defaults (`npm run db:migrate && npm run db:seed`).
6. Install and enable the `rostertool.service` systemd daemon.

### 3. Service Management in LXC

```bash
# Check service status
systemctl status rostertool.service

# View live application logs
journalctl -u rostertool.service -f

# Restart or stop the service
systemctl restart rostertool.service
systemctl stop rostertool.service
```

### 4. Accessing the Application
Open any browser on the hostel network:
- **Management Roster**: `http://<LXC_IP>:3000/admin/roster`
- **Volunteer Management**: `http://<LXC_IP>:3000/admin/volunteers`
- **Headcount Calendar**: `http://<LXC_IP>:3000/admin/headcount`
- **Volunteer Portal**: `http://<LXC_IP>:3000/portal?token=<volunteer_token>`

### 5. Zero-Fuss Backups on Proxmox
Because RosterTool uses an embedded file-based SQLite database with WAL mode:
- **Option A (Proxmox Native)**: Standard Proxmox Backup Server (PBS) or scheduled vzdump backup snapshots backup the entire container and data with zero downtime.
- **Option B (File Backup)**: Copy `/opt/rostertool/data/rostertool.sqlite` to an external backup destination:
  ```bash
  sqlite3 /opt/rostertool/data/rostertool.sqlite ".backup '/backup/rostertool-$(date +%F).sqlite'"
  ```

---

## Local Development & Testing

```bash
# Install dependencies
npm install

# Run database migrations and seed initial shifts/sources
npm run db:migrate
npm run db:seed

# Run dev servers (Vite frontend on :3000 proxying to Fastify backend on :3001)
npm run dev

# Run automated tests
npm test

# Run constraint engine unit tests
npm run test:engine

# Production build
npm run build

# Start production server
npm start
```
