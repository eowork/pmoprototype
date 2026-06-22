'use strict';
// Docker fresh-database seed.
// Invoked by migrate.js ONLY on a fresh database (empty schema), so it can never
// alter an existing deployment's auth or data. All inserts are ON CONFLICT DO
// NOTHING / idempotent. Seeds: base roles, a first SuperAdmin, and reference data.
//
// SuperAdmin credentials are taken from env (with safe defaults) so each
// deployment can set its own. Change SEED_SUPERADMIN_PASSWORD before go-live.

const bcrypt = require('bcrypt');

async function seedFreshDatabase(orm) {
  const conn = orm.em.getConnection();

  const suUsername = process.env.SEED_SUPERADMIN_USERNAME || 'superadmin';
  const suEmail = process.env.SEED_SUPERADMIN_EMAIL || 'admin@carsu.edu.ph';
  const suPassword = process.env.SEED_SUPERADMIN_PASSWORD || 'ChangeMe!2026';

  console.log('[seed] Seeding base roles...');
  await conn.execute(`
    INSERT INTO roles (name, description) VALUES
      ('Admin', 'Full system access with permission management'),
      ('Staff', 'Department-level access for data entry and reporting'),
      ('Client', 'Read-only access to public dashboards'),
      ('Auditor', 'Read-only access across all modules plus access to activity logs.')
    ON CONFLICT (name) DO NOTHING;
  `);

  console.log(`[seed] Seeding SuperAdmin user (${suUsername} / ${suEmail})...`);
  const hash = await bcrypt.hash(suPassword, 10);
  await conn.execute(
    `INSERT INTO users (username, email, password_hash, first_name, last_name, status, is_active, must_change_password)
     VALUES (?, ?, ?, 'Super', 'Admin', 'ACTIVE', true, false)
     ON CONFLICT (username) DO NOTHING;`,
    [suUsername, suEmail, hash],
  );

  // Promote to SuperAdmin via the Admin role (is_superadmin flag is authoritative)
  await conn.execute(
    `INSERT INTO user_roles (user_id, role_id, is_superadmin, assigned_by, created_by)
     SELECT u.id, r.id, true, u.id, u.id
     FROM users u, roles r
     WHERE u.username = ? AND r.name = 'Admin'
     ON CONFLICT (user_id, role_id) DO UPDATE SET is_superadmin = true;`,
    [suUsername],
  );

  console.log('[seed] Seeding reference data...');
  await conn.execute(`
    INSERT INTO funding_sources (name, description) VALUES
      ('GAA', 'General Appropriations Act - National government funding'),
      ('Local', 'Locally funded projects from university budget'),
      ('Special Grants', 'External grants and special funding sources'),
      ('CHED', 'Commission on Higher Education funded projects'),
      ('DBM', 'Department of Budget and Management allocations')
    ON CONFLICT (name) DO NOTHING;
  `);

  await conn.execute(`
    INSERT INTO repair_types (name, description) VALUES
      ('Electrical', 'Electrical system repairs and maintenance'),
      ('Plumbing', 'Water and drainage system repairs'),
      ('Structural', 'Building structure repairs (walls, floors, ceilings)'),
      ('HVAC', 'Heating, ventilation, and air conditioning repairs'),
      ('Roofing', 'Roof repairs and waterproofing'),
      ('Painting', 'Interior and exterior painting works'),
      ('Carpentry', 'Wood and furniture repairs'),
      ('IT Infrastructure', 'Network and IT equipment repairs'),
      ('General Maintenance', 'General facility maintenance tasks')
    ON CONFLICT (name) DO NOTHING;
  `);

  await conn.execute(`
    INSERT INTO construction_subcategories (name, description) VALUES
      ('Academic Buildings', 'Classrooms, laboratories, lecture halls'),
      ('Administrative Buildings', 'Offices and administrative facilities'),
      ('Student Facilities', 'Dormitories, canteens, student centers'),
      ('Sports Facilities', 'Gymnasiums, courts, athletic facilities'),
      ('Research Facilities', 'Research centers and innovation hubs'),
      ('Infrastructure', 'Roads, utilities, landscaping'),
      ('Library', 'Library buildings and archives')
    ON CONFLICT (name) DO NOTHING;
  `);

  await conn.execute(`
    INSERT INTO departments (name, code, status) VALUES
      ('Project Management Office', 'PMO', 'ACTIVE'),
      ('Physical Facilities', 'PF', 'ACTIVE'),
      ('Finance Office', 'FO', 'ACTIVE'),
      ('Academic Affairs', 'AA', 'ACTIVE'),
      ('Research and Extension', 'RES', 'ACTIVE'),
      ('Gender and Development', 'GAD', 'ACTIVE'),
      ('Information Technology', 'IT', 'ACTIVE')
    ON CONFLICT (code) DO NOTHING;
  `);

  await conn.execute(`
    INSERT INTO system_settings (setting_key, setting_value, setting_group, data_type, is_public, description) VALUES
      ('app.name', 'PMO Dashboard', 'application', 'STRING', true, 'Application display name'),
      ('app.version', '2.3.0', 'application', 'STRING', true, 'Current application version'),
      ('app.academic_year', '2025-2026', 'application', 'STRING', true, 'Current academic year'),
      ('app.campus_default', 'MAIN', 'application', 'STRING', false, 'Default campus for new records'),
      ('session.timeout_minutes', '30', 'security', 'NUMBER', false, 'Session timeout in minutes'),
      ('upload.max_file_size_mb', '10', 'uploads', 'NUMBER', false, 'Maximum upload file size in MB')
    ON CONFLICT (setting_key) DO NOTHING;
  `);

  console.log('[seed] Reference data seeded.');
  console.log(`[seed] Done. Log in with username "${suUsername}" / the SEED_SUPERADMIN_PASSWORD value.`);
  console.log('[seed] NOTE: BAR1 pillar-indicator taxonomy is NOT seeded here — source it from the live dataset (see docs).');
}

module.exports = { seedFreshDatabase };
