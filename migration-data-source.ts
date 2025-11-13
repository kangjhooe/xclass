import { config } from 'dotenv';
import { DataSource } from 'typeorm';

config();

const host = process.env.DB_HOST?.trim() || '127.0.0.1';
const port = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306;
const username = process.env.DB_USERNAME?.trim() || 'root';
const password = process.env.DB_PASSWORD ?? '';
const database = process.env.DB_DATABASE?.trim() || 'xclass';

const MigrationDataSource = new DataSource({
  type: 'mysql',
  host,
  port,
  username,
  password,
  database,
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
  logging: false,
});

export default MigrationDataSource;
