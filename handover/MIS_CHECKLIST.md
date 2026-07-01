# CSU CORE Dashboard — MIS Handover Checklist

> **Audience:** MIS Director and outgoing PMO operator
> **Purpose:** Ensure all institutional information is collected, all secrets transferred, and all MIS-side configuration is documented before turnover
> **Deadline:** Before July 15, 2026

---

## Section 1 — Information Needed FROM MIS

These items require MIS to provide values. Collect before the handover date.

### Server

| Item | Value (MIS to fill) |
|---|---|
| Server hostname / IP address | |
| Operating system | |
| RAM | |
| CPU cores | |
| Disk space available | |
| Network location (on-campus LAN, DMZ, cloud) | |
| SSH access method (key or password) | |
| Who manages the server going forward | |

### Network / Firewall

| Item | Value (MIS to fill) |
|---|---|
| Inbound ports MIS will open (3001 for frontend, 3000 for API) | |
| Is port 5432 (PostgreSQL) blocked from external access? | Must be: YES |
| Reverse proxy available? (nginx, Apache) | |
| TLS certificate provider (Let's Encrypt, carsu.edu.ph wildcard, self-signed) | |
| Intended public URL (e.g., `https://core.carsu.edu.ph`) | |

### LDAP / Active Directory (for institutional login)

| Item | Value (MIS to fill) |
|---|---|
| LDAP server URL (e.g., `ldaps://ldap.carsu.edu.ph:636`) | |
| Bind DN (service account DN) | |
| Bind password (service account password) | |
| Search base (e.g., `ou=Users,dc=carsu,dc=edu,dc=ph`) | |
| Search filter (e.g., `(mail={{username}})` or `(sAMAccountName={{username}})`) | |
| Attribute used as login identifier (mail or sAMAccountName) | |
| Is LDAPS (TLS) required? (recommended: yes) | |
| LDAP server certificate — self-signed or CA-signed? | |

### Backup / Storage

| Item | Value (MIS to fill) |
|---|---|
| Backup storage location (NAS path, network share, external drive) | |
| Backup retention policy (how many days/weeks to keep) | |
| Who is responsible for backup monitoring | |
| Recovery Point Objective (RPO) — acceptable data loss window | |
| Recovery Time Objective (RTO) — acceptable downtime for restore | |

---

## Section 2 — Secrets to Transfer at Handover

These values must be transferred directly to the MIS successor. Do NOT put these in email. Transfer in person or via an encrypted password manager.

| Secret | Where it is used | How to find it |
|---|---|---|
| `POSTGRES_PASSWORD` | PostgreSQL database password | In `pmo-backend/.env` as `DATABASE_PASSWORD` |
| `AUTH_JWT_SECRET` | Signs all login tokens — changing invalidates all active sessions | In `pmo-backend/.env` |
| `SEED_PMOADMIN_PASSWORD` | `pmoadmin` SuperAdmin account password | Known to outgoing operator |
| `GOOGLE_CLIENT_SECRET` | Google OAuth login | In `pmo-backend/.env` (if configured) |
| LDAP `BIND_PASSWORD` | LDAP service account | From MIS AD administrator |

---

## Section 3 — LDAP Swap Procedure

When MIS provides their Active Directory details, follow these steps to activate institutional login.

Full procedure is in `ldap-test/MIS_SWAP.md`. Summary:

### Step 1 — Open `pmo-backend/.env` and update LDAP block

```env
# Remove the # from these lines and fill in MIS values:
LDAP_URL=ldaps://ldap.carsu.edu.ph:636
LDAP_BIND_DN=cn=svc-pmo,ou=ServiceAccounts,dc=carsu,dc=edu,dc=ph
LDAP_BIND_PASSWORD=<MIS service account password>
LDAP_SEARCH_BASE=ou=Users,dc=carsu,dc=edu,dc=ph
LDAP_SEARCH_FILTER=(mail={{username}})
LDAP_TLS_REJECT_UNAUTHORIZED=true
```

### Step 2 — Restart backend to activate LDAP strategy

```bash
docker compose up -d backend
```

### Step 3 — Test with a real carsu.edu.ph account

```bash
curl -s -X POST http://localhost:3000/api/auth/ldap \
  -H "Content-Type: application/json" \
  -d '{"username":"user@carsu.edu.ph","password":"their-password"}'
# Expected: {"access_token":"eyJ..."}
```

### Step 4 — Verify the user was created in the system

Log in to the dashboard as pmoadmin → Users module → confirm the LDAP user appears with role "Staff" (default for new LDAP users).

---

## Section 4 — TLS / HTTPS Setup

The system currently runs on HTTP (`localhost`). To serve it at `https://core.carsu.edu.ph`, MIS must set up a reverse proxy.

### nginx configuration template

Create `/etc/nginx/sites-available/pmo-core`:

```nginx
server {
    listen 80;
    server_name core.carsu.edu.ph;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name core.carsu.edu.ph;

    ssl_certificate     /etc/ssl/certs/core.carsu.edu.ph.crt;
    ssl_certificate_key /etc/ssl/private/core.carsu.edu.ph.key;
    ssl_protocols       TLSv1.2 TLSv1.3;

    # Frontend (SPA)
    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Enable and reload:

```bash
ln -s /etc/nginx/sites-available/pmo-core /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

### After TLS is active — update `.env` files

```env
# pmo-backend/.env
FRONTEND_URL=https://core.carsu.edu.ph

# pmo-frontend/.env
NUXT_PUBLIC_API_BASE=https://core.carsu.edu.ph
```

Rebuild frontend so the new API base is baked in:

```bash
docker compose up -d --build frontend
```

---

## Section 5 — Post-Handover Open Items

| # | Item | Owner | Priority |
|---|---|---|---|
| 1 | LDAP swap to MIS Active Directory | MIS + Successor | P1 — before official launch |
| 2 | TLS certificate + nginx setup | MIS | P1 — before official launch |
| 3 | Firewall: block TCP 5432 from non-loopback | MIS | P1 — security |
| 4 | Backup storage moved to MIS NAS/share | MIS + Successor | P1 |
| 5 | Schedule backup cron on production server | Successor | P1 |
| 6 | Promote institutional account to SuperAdmin | Successor | P1 |
| 7 | Upload size limits unified (10 MB vs 25 MB inconsistency) | Successor | P2 |
| 8 | AV scanning on file uploads | MIS | P2 |
| 9 | NAS/external storage for uploads volume | MIS | P3 — post-launch |

---

## Section 6 — Handover Sign-Off

| Item | Outgoing Operator | MIS Successor | Date |
|---|---|---|---|
| Repository access granted (GitHub) | | | |
| `.env` files transferred securely | | | |
| pmoadmin password transferred | | | |
| Backup set transferred (USB/NAS) | | | |
| Deployment Guide walkthrough complete | | | |
| RUNBOOK.md reviewed together | | | |
| First login confirmed on target server | | | |
| Backup/restore tested on target server | | | |
| MIS questions answered (Section 1) | | | |
| Open items list accepted (Section 5) | | | |
