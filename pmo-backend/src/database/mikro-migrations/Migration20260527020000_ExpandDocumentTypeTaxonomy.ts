import { Migration } from '@mikro-orm/migrations';

export class Migration20260527020000_ExpandDocumentTypeTaxonomy extends Migration {
  async up(): Promise<void> {
    await this.execute(`
      ALTER TABLE construction_document_types
        DROP CONSTRAINT IF EXISTS construction_document_types_group_code_check;
    `);

    await this.execute(`
      ALTER TABLE construction_document_types
        ADD CONSTRAINT construction_document_types_group_code_check
        CHECK (group_code IN (
          'GROUP_1','GROUP_2','GROUP_3','GROUP_4','GROUP_5','GROUP_6',
          'ECO_FORMS','SD_ORDERS','SD_REPORTS','SD_CERTS'
        ));
    `);

    await this.execute(`
      INSERT INTO construction_document_types
        (group_code, group_label, type_code, type_label, is_required, sort_order)
      VALUES
        ('ECO_FORMS','ECO Forms','F_ECO_001','Data Request Form',FALSE,1),
        ('ECO_FORMS','ECO Forms','F_ECO_002','Service Request Form',FALSE,2),
        ('ECO_FORMS','ECO Forms','F_ECO_003','Initial Project Proposal Form',FALSE,3),
        ('ECO_FORMS','ECO Forms','F_ECO_004','Concrete Pouring Record (CPR)',FALSE,4),
        ('ECO_FORMS','ECO Forms','F_ECO_005','Pre-Inspection Form',FALSE,5),
        ('ECO_FORMS','ECO Forms','F_ECO_006','Contract Time Extension Request',FALSE,6)
      ON CONFLICT (type_code) DO NOTHING;
    `);

    await this.execute(`
      INSERT INTO construction_document_types
        (group_code, group_label, type_code, type_label, is_required, sort_order)
      VALUES
        ('SD_ORDERS','Supporting Docs — Orders','SD_ECO_001','Variation Order',FALSE,1),
        ('SD_ORDERS','Supporting Docs — Orders','SD_ECO_002','Work Suspension Order',FALSE,2),
        ('SD_ORDERS','Supporting Docs — Orders','SD_ECO_003','Work Resumption Order',FALSE,3),
        ('SD_ORDERS','Supporting Docs — Orders','SD_ECO_004','Contract Time Extension Order',FALSE,4),
        ('SD_ORDERS','Supporting Docs — Orders','SD_ECO_005','Notice of Non-Compliance',FALSE,5),
        ('SD_ORDERS','Supporting Docs — Orders','SD_ECO_006','Show Cause Order',FALSE,6),
        ('SD_ORDERS','Supporting Docs — Orders','SD_ECO_007','Notice of Termination',FALSE,7)
      ON CONFLICT (type_code) DO NOTHING;
    `);

    await this.execute(`
      INSERT INTO construction_document_types
        (group_code, group_label, type_code, type_label, is_required, sort_order)
      VALUES
        ('SD_REPORTS','Supporting Docs — Reports & Monitoring','SD_ECO_008','Construction Logbook',FALSE,1),
        ('SD_REPORTS','Supporting Docs — Reports & Monitoring','SD_ECO_009','Weekly Accomplishment Report',FALSE,2),
        ('SD_REPORTS','Supporting Docs — Reports & Monitoring','SD_ECO_010','Monthly Progress Report',FALSE,3),
        ('SD_REPORTS','Supporting Docs — Reports & Monitoring','SD_ECO_011','Site Instruction',FALSE,4),
        ('SD_REPORTS','Supporting Docs — Reports & Monitoring','SD_ECO_012','Site Inspection Report',FALSE,5),
        ('SD_REPORTS','Supporting Docs — Reports & Monitoring','SD_ECO_013','Project Inspection Report',FALSE,6),
        ('SD_REPORTS','Supporting Docs — Reports & Monitoring','SD_ECO_014','Quality Assessment Report',FALSE,7),
        ('SD_REPORTS','Supporting Docs — Reports & Monitoring','SD_ECO_015','Safety Compliance Report',FALSE,8)
      ON CONFLICT (type_code) DO NOTHING;
    `);

    await this.execute(`
      INSERT INTO construction_document_types
        (group_code, group_label, type_code, type_label, is_required, sort_order)
      VALUES
        ('SD_CERTS','Supporting Docs — Certifications','SD_ECO_016','Certificate of Site Inspection',FALSE,1),
        ('SD_CERTS','Supporting Docs — Certifications','SD_ECO_017','Certificate of Completion',FALSE,2),
        ('SD_CERTS','Supporting Docs — Certifications','SD_ECO_018','Certificate of Final Acceptance',FALSE,3),
        ('SD_CERTS','Supporting Docs — Certifications','SD_ECO_019','Mandatory Certification (LUDIP)',FALSE,4)
      ON CONFLICT (type_code) DO NOTHING;
    `);
  }

  async down(): Promise<void> {
    await this.execute(`
      DELETE FROM construction_document_types
        WHERE group_code IN ('ECO_FORMS','SD_ORDERS','SD_REPORTS','SD_CERTS');
    `);

    await this.execute(`
      ALTER TABLE construction_document_types
        DROP CONSTRAINT IF EXISTS construction_document_types_group_code_check;
    `);

    await this.execute(`
      ALTER TABLE construction_document_types
        ADD CONSTRAINT construction_document_types_group_code_check
        CHECK (group_code IN ('GROUP_1','GROUP_2','GROUP_3','GROUP_4','GROUP_5','GROUP_6'));
    `);
  }
}
