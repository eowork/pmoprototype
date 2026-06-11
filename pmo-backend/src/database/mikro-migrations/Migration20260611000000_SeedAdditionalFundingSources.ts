import { Migration } from '@mikro-orm/migrations';

export class Migration20260611000000_SeedAdditionalFundingSources extends Migration {
  async up(): Promise<void> {
    this.addSql(`
      INSERT INTO funding_sources (id, name, type, created_at, updated_at)
      VALUES
        (gen_random_uuid(), 'GAA Savings', 'EXTERNAL', NOW(), NOW()),
        (gen_random_uuid(), 'CHED (Commission on Higher Education)', 'EXTERNAL', NOW(), NOW()),
        (gen_random_uuid(), 'DBM (Department of Budget and Management)', 'EXTERNAL', NOW(), NOW()),
        (gen_random_uuid(), 'LGU (Local Government Unit)', 'EXTERNAL', NOW(), NOW()),
        (gen_random_uuid(), 'Institutional Funds', 'INTERNAL', NOW(), NOW()),
        (gen_random_uuid(), 'Trust Fund', 'EXTERNAL', NOW(), NOW()),
        (gen_random_uuid(), 'Private Donations', 'EXTERNAL', NOW(), NOW())
      ON CONFLICT DO NOTHING
    `);
  }

  async down(): Promise<void> {
    this.addSql(`
      DELETE FROM funding_sources
      WHERE name IN (
        'GAA Savings',
        'CHED (Commission on Higher Education)',
        'DBM (Department of Budget and Management)',
        'LGU (Local Government Unit)',
        'Institutional Funds',
        'Trust Fund',
        'Private Donations'
      )
    `);
  }
}
