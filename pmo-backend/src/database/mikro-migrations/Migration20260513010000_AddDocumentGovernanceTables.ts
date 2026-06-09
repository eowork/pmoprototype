import { Migration } from '@mikro-orm/migrations';

/**
 * Phase KB-E: Document Governance System (CPES Compliance).
 *
 * Two new tables enabling per-project document compliance tracking distinct
 * from raw file uploads:
 *   - construction_document_types: reference table seeded with 27 standard
 *     CPES/infrastructure document categories grouped 1–6.
 *   - construction_document_checklist: per-project checklist instances with
 *     submission/approval state, version, expiry, and link to the actual
 *     uploaded file in the existing `documents` table.
 *
 * The flat `documents` table is unmodified — checklist items reference uploads
 * via `linked_document_id` FK.
 */
export class Migration20260513010000_AddDocumentGovernanceTables extends Migration {
  override async up(): Promise<void> {
    // Reference table — seeded once, admin-extensible
    this.addSql(`
      CREATE TABLE IF NOT EXISTS construction_document_types (
        id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        group_code   VARCHAR(20)  NOT NULL,
        group_label  VARCHAR(100) NOT NULL,
        type_code    VARCHAR(50)  NOT NULL UNIQUE,
        type_label   VARCHAR(255) NOT NULL,
        is_required  BOOLEAN      NOT NULL DEFAULT TRUE,
        sort_order   INTEGER      NOT NULL DEFAULT 0,
        is_active    BOOLEAN      NOT NULL DEFAULT TRUE,
        created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        CONSTRAINT construction_document_types_group_code_check
          CHECK (group_code IN ('GROUP_1','GROUP_2','GROUP_3','GROUP_4','GROUP_5','GROUP_6'))
      );
    `);

    // Per-project checklist instances
    this.addSql(`
      CREATE TABLE IF NOT EXISTS construction_document_checklist (
        id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id         UUID NOT NULL REFERENCES construction_projects(id) ON DELETE CASCADE,
        document_type_id   UUID NOT NULL REFERENCES construction_document_types(id),
        submission_status  VARCHAR(30) NOT NULL DEFAULT 'NOT_SUBMITTED',
        submitted_by       UUID REFERENCES users(id),
        submitted_at       TIMESTAMPTZ,
        reviewed_by        UUID REFERENCES users(id),
        reviewed_at        TIMESTAMPTZ,
        review_notes       TEXT,
        current_version    INTEGER NOT NULL DEFAULT 0,
        expiry_date        DATE,
        linked_document_id UUID REFERENCES documents(id),
        created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (project_id, document_type_id),
        CONSTRAINT construction_document_checklist_status_check
          CHECK (submission_status IN ('NOT_SUBMITTED','SUBMITTED','UNDER_REVIEW','APPROVED','REJECTED'))
      );
    `);

    this.addSql(
      `CREATE INDEX IF NOT EXISTS idx_doc_checklist_project ON construction_document_checklist(project_id);`,
    );
    this.addSql(
      `CREATE INDEX IF NOT EXISTS idx_doc_checklist_status ON construction_document_checklist(project_id, submission_status);`,
    );

    // Seed the 27 CPES/infrastructure document types (Section 2.141-C.1)
    this.addSql(`
      INSERT INTO construction_document_types (group_code, group_label, type_code, type_label, is_required, sort_order)
      VALUES
        -- Group 1: Contract Foundation
        ('GROUP_1', 'Contract Foundation', 'CONTRACT_AGREEMENT_BOQ', 'Contract of Agreement and Bill of Quantities (BOQ)', TRUE, 1),
        ('GROUP_1', 'Contract Foundation', 'NTP', 'Notice to Proceed (NTP)', TRUE, 2),
        ('GROUP_1', 'Contract Foundation', 'BUILDING_PLANS', 'Approved Building Plans', TRUE, 3),
        ('GROUP_1', 'Contract Foundation', 'POW', 'Program of Works (POW)', TRUE, 4),
        ('GROUP_1', 'Contract Foundation', 'CPM_SCHEDULE', 'CPM Work Schedule / Bar Chart / Manpower and Equipment Schedule', TRUE, 5),
        ('GROUP_1', 'Contract Foundation', 'ORG_FINANCIAL_CHART', 'Organizational Chart and Financial Chart', TRUE, 6),
        ('GROUP_1', 'Contract Foundation', 'GENERAL_LAYOUT', 'General Layout of Project Facilities', TRUE, 7),

        -- Group 2: Contractor Qualifications
        ('GROUP_2', 'Contractor Qualifications', 'CONTRACTOR_LICENSE_JV', 'Contractor''s Valid License and JV Agreement', TRUE, 1),
        ('GROUP_2', 'Contractor Qualifications', 'MATERIALS_ENGINEER_ACCRED', 'Materials Engineers Accreditation', TRUE, 2),
        ('GROUP_2', 'Contractor Qualifications', 'SUBCONTRACTORS_SUPPLIERS', 'List of Subcontractors or Suppliers', FALSE, 3),
        ('GROUP_2', 'Contractor Qualifications', 'QCP', 'Original and Revised Quality Control Program (QCP)', TRUE, 4),

        -- Group 3: Accomplishment Reports
        ('GROUP_3', 'Accomplishment Reports', 'STE', 'Approved Statement of Time Elapsed (STE)', TRUE, 1),
        ('GROUP_3', 'Accomplishment Reports', 'SWA', 'Approved Statement of Work Accomplished (SWA)', TRUE, 2),
        ('GROUP_3', 'Accomplishment Reports', 'MATERIALS_TEST_REPORTS', 'Materials Test Reports/Results', TRUE, 3),

        -- Group 4: Change Orders and Time Management
        ('GROUP_4', 'Change Orders and Time Management', 'VARIATION_ORDERS', 'Approved Variation Orders', FALSE, 1),
        ('GROUP_4', 'Change Orders and Time Management', 'TIME_EXTENSIONS', 'Approved Time Extensions', FALSE, 2),
        ('GROUP_4', 'Change Orders and Time Management', 'SUSPENSION_RESUMPTION', 'Approved Time Suspension/Resumption Orders and Monthly Suspension Reports', FALSE, 3),

        -- Group 5: Completion
        ('GROUP_5', 'Completion', 'FINAL_COMPLETION_INSPECTION', 'Final Completion Inspection Report', TRUE, 1),
        ('GROUP_5', 'Completion', 'CERTIFICATE_OF_COMPLETION', 'Certificate of Completion', TRUE, 2),
        ('GROUP_5', 'Completion', 'STRAIGHT_LINE_DIAGRAM', 'Straight Line Diagram', FALSE, 3),
        ('GROUP_5', 'Completion', 'AS_BUILT_PLAN', 'As-Built Plan', TRUE, 4),

        -- Group 6: Extended/Custom
        ('GROUP_6', 'Extended/Custom', 'PROJECT_PROFILE', 'Project Profile / Feasibility Studies', FALSE, 1),
        ('GROUP_6', 'Extended/Custom', 'PROCUREMENT_DOCS', 'Procurement Documents', FALSE, 2),
        ('GROUP_6', 'Extended/Custom', 'SAFETY_COMPLIANCE', 'Safety Compliance Documents', FALSE, 3),
        ('GROUP_6', 'Extended/Custom', 'COA_REQUIREMENTS', 'COA/Government Agency Requirements', FALSE, 4),
        ('GROUP_6', 'Extended/Custom', 'PROGRESS_BILLING', 'Progress Reports / Billing Documents', FALSE, 5),
        ('GROUP_6', 'Extended/Custom', 'OTHER', 'Other (User-Defined)', FALSE, 99)
      ON CONFLICT (type_code) DO NOTHING;
    `);
  }

  override async down(): Promise<void> {
    this.addSql(`DROP INDEX IF EXISTS idx_doc_checklist_status;`);
    this.addSql(`DROP INDEX IF EXISTS idx_doc_checklist_project;`);
    this.addSql(`DROP TABLE IF EXISTS construction_document_checklist;`);
    this.addSql(`DROP TABLE IF EXISTS construction_document_types;`);
  }
}
