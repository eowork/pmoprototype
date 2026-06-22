'use strict';
// Docker deployment migration bootstrap.
// Fresh database: creates full schema from compiled entities, then fake-marks
// all existing migrations as applied (schema IS already at current entity state).
// Existing database: runs any pending migrations normally via migrator.up().

const { MikroORM } = require('@mikro-orm/core');
const config = require('./dist/database/mikro-orm.config');
const { seedFreshDatabase } = require('./seed');

async function main() {
  console.log('[migrate] Connecting to database...');
  const orm = await MikroORM.init(config.default || config);
  const conn = orm.em.getConnection();

  // Detect fresh database: projects table is the canonical indicator
  const rows = await conn.execute(
    "SELECT to_regclass('public.projects') AS tbl"
  );
  const isFresh = rows[0]?.tbl === null;

  if (isFresh) {
    console.log('[migrate] Fresh database — creating schema from entities');

    // Build all tables/indexes from current entity metadata
    const generator = orm.getSchemaGenerator();
    await generator.createSchema();
    console.log('[migrate] Schema created');

    // The mikro_orm_migrations table is not an entity; create it manually
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS mikro_orm_migrations (
        id serial PRIMARY KEY,
        name varchar(255) NULL,
        executed_at timestamptz DEFAULT NOW()
      )
    `);

    // Fake-mark every migration as applied — schema is already at current state,
    // so running any ALTER migrations on top would cause "already exists" errors
    const migrator = orm.getMigrator();
    const pending = await migrator.getPendingMigrations();
    for (const m of pending) {
      await conn.execute(
        'INSERT INTO mikro_orm_migrations (name, executed_at) VALUES (?, NOW())',
        [m.name]
      );
      console.log(`[migrate] Marked applied: ${m.name}`);
    }
    console.log(`[migrate] Done — ${pending.length} migrations marked applied`);

    // Fresh database has empty tables — seed roles, a SuperAdmin, and reference data
    await seedFreshDatabase(orm);

  } else {
    console.log('[migrate] Existing database — running pending migrations');
    const migrator = orm.getMigrator();
    await migrator.up();
    console.log('[migrate] Migrations complete');
  }

  await orm.close(true);
}

main().catch(err => {
  console.error('[migrate] Fatal:', err.message || err);
  process.exit(1);
});
