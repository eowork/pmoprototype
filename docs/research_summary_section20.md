## 20. ACE Framework: Auth Scope Expansion (2026-01-21)

**Status:** Phase 1 RESEARCH ✅ COMPLETE  
**Detailed Research:** See `docs/research_auth_expansion.md`

**Executive Summary:**
- Current authentication: Email + password only
- Schema analysis: NO `username` column exists in users table
- 6 BLOCKING gaps identified for username support
- Canonical schema v2 + incremental migration SQL designed
- Backend alignment requirements documented (NO implementation yet)

**Key Deliverables:**
1. `pmo_schema_pg_v2.sql` - Canonical reference (includes username + google_id)
2. `pmo_schema_pg_insert_v2.sql` - Incremental migration for username
3. Backend DTO + service change specifications
4. MIS compliance analysis (SOLID, DRY, YAGNI, KISS, TDA, MIS)

**Next:** Phase 3.2 implementation (Username + Password Support)

---

*For complete analysis, see: `docs/research_auth_expansion.md`*
