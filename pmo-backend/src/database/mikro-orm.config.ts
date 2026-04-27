import { Options } from '@mikro-orm/core';
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
  migrations: {
    tableName: 'mikro_orm_migrations',
    path: './src/database/mikro-migrations',
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
