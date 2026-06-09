import { Migration } from '@mikro-orm/migrations';

export class Migration20260527030000_AddCpesDocumentTypes extends Migration {
  async up(): Promise<void> {
    // 1. Drop old check constraint (post-ZW form: GROUP_1..6 + ECO_FORMS + SD_*)
    await this.execute(`
      ALTER TABLE construction_document_types
        DROP CONSTRAINT IF EXISTS construction_document_types_group_code_check
    `);

    // 2. Re-add with CPES_DOCS added
    await this.execute(`
      ALTER TABLE construction_document_types
        ADD CONSTRAINT construction_document_types_group_code_check
        CHECK (group_code IN (
          'GROUP_1','GROUP_2','GROUP_3','GROUP_4','GROUP_5','GROUP_6',
          'ECO_FORMS','SD_ORDERS','SD_REPORTS','SD_CERTS',
          'CPES_DOCS'
        ))
    `);

    // 3. Seed 22 CPES documentary requirements (from Excel reference)
    await this.execute(`
      INSERT INTO construction_document_types
        (group_code, group_label, type_code, type_label, is_required, sort_order, is_active)
      VALUES
        ('CPES_DOCS','CPES Documentary Requirements','CPES_STE','Approved Statement of Time Elapsed (STE)',true,10,true),
        ('CPES_DOCS','CPES Documentary Requirements','CPES_SWA','Approved Statement of Work Accomplished (SWA)',true,20,true),
        ('CPES_DOCS','CPES Documentary Requirements','CPES_VAR_ORDERS','All Approved Variation Orders',false,30,true),
        ('CPES_DOCS','CPES Documentary Requirements','CPES_TIME_EXT','All Approved Time Extensions',false,40,true),
        ('CPES_DOCS','CPES Documentary Requirements','CPES_SUSPENSION','Time Suspension/Resume Orders and Monthly Suspension Reports',false,50,true),
        ('CPES_DOCS','CPES Documentary Requirements','CPES_CONTRACTOR_LIC','Contractor Valid License (or JV Special License and Agreement)',true,60,true),
        ('CPES_DOCS','CPES Documentary Requirements','CPES_BOQ','Contract of Agreement and Bill of Quantities (BOQ)',true,70,true),
        ('CPES_DOCS','CPES Documentary Requirements','CPES_NTP','Notice to Proceed (NTP)',true,80,true),
        ('CPES_DOCS','CPES Documentary Requirements','CPES_MATERIALS_ENG','Materials Engineers Accreditation (for projects above Php 150M)',false,90,true),
        ('CPES_DOCS','CPES Documentary Requirements','CPES_COMPLETION_INSP','Final Completion Inspection Report',true,100,true),
        ('CPES_DOCS','CPES Documentary Requirements','CPES_CERT_COMPLETION','Certificate of Completion',true,110,true),
        ('CPES_DOCS','CPES Documentary Requirements','CPES_STRAIGHT_LINE','Straight Line Diagram (Roads and Flood Control)',false,120,true),
        ('CPES_DOCS','CPES Documentary Requirements','CPES_AS_BUILT','As-Built Plan',true,130,true),
        ('CPES_DOCS','CPES Documentary Requirements','CPES_POW','Program of Works (POW)',true,140,true),
        ('CPES_DOCS','CPES Documentary Requirements','CPES_MATERIALS_TEST','Materials Test Reports and Results',true,150,true),
        ('CPES_DOCS','CPES Documentary Requirements','CPES_QCP','Original and Revised Quality Control Program (QCP)',true,160,true),
        ('CPES_DOCS','CPES Documentary Requirements','CPES_APPROVED_PLANS','Approved Plans',true,170,true),
        ('CPES_DOCS','CPES Documentary Requirements','CPES_CPM_SCHEDULE','CPM Work Schedule or Bar Chart and Manpower and Equipment Schedule',true,180,true),
        ('CPES_DOCS','CPES Documentary Requirements','CPES_ORG_CHART','Organizational Chart and Financial Chart (S-curve or cash flow)',true,190,true),
        ('CPES_DOCS','CPES Documentary Requirements','CPES_LAYOUT','General Layout of Project Facilities',false,200,true),
        ('CPES_DOCS','CPES Documentary Requirements','CPES_SUBCONTRACTORS','List of Subcontractors or Suppliers',false,210,true),
        ('CPES_DOCS','CPES Documentary Requirements','CPES_COVER_SHEET','Cover Sheet (Annex-8)',true,220,true)
      ON CONFLICT (type_code) DO NOTHING
    `);
  }

  async down(): Promise<void> {
    await this.execute(`
      DELETE FROM construction_document_types WHERE group_code = 'CPES_DOCS'
    `);
    await this.execute(`
      ALTER TABLE construction_document_types
        DROP CONSTRAINT IF EXISTS construction_document_types_group_code_check
    `);
    await this.execute(`
      ALTER TABLE construction_document_types
        ADD CONSTRAINT construction_document_types_group_code_check
        CHECK (group_code IN (
          'GROUP_1','GROUP_2','GROUP_3','GROUP_4','GROUP_5','GROUP_6',
          'ECO_FORMS','SD_ORDERS','SD_REPORTS','SD_CERTS'
        ))
    `);
  }
}
