import { Migration } from '@mikro-orm/migrations';

/**
 * Phase LLL-E: Seed template_url for the 15 SHAREABLE ECO document templates.
 *
 * Files are served statically at /templates/{type_code}.docx (see main.ts
 * useStaticAssets for the `public/templates` directory). Operator must copy the
 * SHAREABLE .docx files from the reference folder under docs/references into
 * pmo-backend/public/templates/ using the type_code as filename — see
 * public/templates/README.md for the mapping.
 *
 * DRAFT-only types (SD_ECO_005, SD_ECO_006, SD_ECO_007), LUDIP (SD_ECO_019),
 * ECO forms (F_ECO_xxx) and CPES types have no shareable template and are left NULL.
 *
 * This migration only UPDATEs template_url on existing rows — it never inserts or
 * deletes taxonomy rows (type_code is a foreign-key target; LLL-D3 / LLL-C5).
 */
export class Migration20260601010000_SeedDocumentTypeTemplateUrls extends Migration {
  private readonly shareable = [
    'SD_ECO_001',
    'SD_ECO_002',
    'SD_ECO_003',
    'SD_ECO_004',
    'SD_ECO_008',
    'SD_ECO_009',
    'SD_ECO_010',
    'SD_ECO_011',
    'SD_ECO_012',
    'SD_ECO_013',
    'SD_ECO_014',
    'SD_ECO_015',
    'SD_ECO_016',
    'SD_ECO_017',
    'SD_ECO_018',
  ];

  async up(): Promise<void> {
    for (const code of this.shareable) {
      await this.execute(
        `UPDATE construction_document_types SET template_url = ? WHERE type_code = ?`,
        [`/templates/${code}.docx`, code],
      );
    }
  }

  async down(): Promise<void> {
    const list = this.shareable.map((c) => `'${c}'`).join(', ');
    await this.execute(
      `UPDATE construction_document_types SET template_url = NULL WHERE type_code IN (${list})`,
    );
  }
}
