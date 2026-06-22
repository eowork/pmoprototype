import 'dotenv/config';
import { existsSync, readFileSync } from 'node:fs';
import { GeneratedCacheAdapter, Options } from '@mikro-orm/core';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';

const config: Options<PostgreSqlDriver> = {
  driver: PostgreSqlDriver,
  host: process.env.DATABASE_HOST || 'localhost',
  port: Number(process.env.DATABASE_PORT) || 5432,
  dbName: process.env.DATABASE_NAME || 'pmo_dashboard',
  user: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  entities: ['./dist/database/entities/**/*.entity.js'],
  entitiesTs: ['./src/database/entities/**/*.entity.ts'],
  metadataProvider: TsMorphMetadataProvider,
  // Production (Docker/Linux) loads a build-time combined metadata cache so the JS-only
  // runtime image never parses TS sources or runs ts-morph at boot. The cache is emitted by
  // `mikro-orm cache:generate --combined` in the Dockerfile build stage (writes ./metadata.json).
  // Dev (no metadata.json present) transparently falls back to TsMorphMetadataProvider.
  metadataCache: {
    enabled: true,
    ...(existsSync('./metadata.json')
      ? {
          adapter: GeneratedCacheAdapter,
          options: {
            data: JSON.parse(readFileSync('./metadata.json', { encoding: 'utf8' })),
          },
        }
      : {}),
  },
  migrations: {
    tableName: 'mikro_orm_migrations',
    // Runtime image ships only ./dist; migrations are compiled to dist/database/mikro-migrations.
    // pathTs keeps dev (ts-node) reading the source .ts migrations.
    path: './dist/database/mikro-migrations',
    pathTs: './src/database/mikro-migrations',
    glob: '!(*.d).{js,ts}',
  },
  filters: {
    notDeleted: { cond: { deletedAt: null }, default: false },
  },
  pool: { min: 2, max: 10 },
  debug: process.env.NODE_ENV === 'development',
};

export default config;
