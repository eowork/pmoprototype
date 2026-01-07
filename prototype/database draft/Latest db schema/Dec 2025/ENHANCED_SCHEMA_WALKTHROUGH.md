# Enhanced Schema (PostgreSQL, Dec 2025) – Quick Walkthrough

Location: `PMODataFirebird_Enhanced_postgres.sql` (this directory).

What changed
- All timestamps use `timestamptz`; added soft-delete fields (`deleted_at`, `deleted_by`) and `metadata JSONB` for extensibility.
- RBAC tables expanded: `permissions`, `role_permissions`, `user_roles`, `user_departments`; audit-ready `audit_trail`.
- Domain coverage: construction, repairs, university operations, documents/media, notifications, system settings.
- Consistent `created_by/updated_by` on authorable entities; indexes for status/type/campus and high-churn tables.
- Construction projects now also have `infra_project_uid BIGSERIAL` (unique) for document/linking friendliness across all projects (small or large).

Apply order (already creation-safe)
1) Enums
2) Roles, users, permissions, role_permissions, user_roles
3) Departments, user_departments
4) Funding, categories (`funding_sources`, `construction_subcategories`, `repair_types`)
5) Contractors, buildings, rooms
6) Projects → construction/repairs + POW/progress/financials
7) University operations → indicators/financials
8) Documents, media
9) Notifications, system_settings, audit_trail

Migration tips (zero/minimal downtime)
- Add nullable `metadata JSONB`, `deleted_at`, `deleted_by`, then backfill and keep nullable.
- Convert `TIMESTAMP` → `TIMESTAMPTZ` with `ALTER TABLE ... ALTER COLUMN ... TYPE timestamptz USING ...`.
- Add new FKs and indexes CONCURRENTLY; toggle NOT NULL only after data backfill.
- Partition `audit_trail` by time if volume is high; create GIN on `delta` if needed for diffs.

Audit/logging pointers
- `audit_trail` keeps actor, department, position, resource, action, delta JSONB, IP/user-agent, correlation_id.
- Use lightweight AFTER triggers on high-value tables to insert audit rows; app-layer inserts for business events.

RBAC hooks (design-level)
- Enforce per-request department/office/position context in the app layer; database enforces FK integrity.

Next steps to run locally
- `psql -f PMODataFirebird_Enhanced_postgres.sql` (wrap in a transaction for fresh envs).
- For existing DBs, convert to migration steps per “Migration tips”.

