import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'gestion_juridique',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

const seedsDir = path.join(__dirname, '../src/database/seeds');

async function runSeeds() {
  try {
    console.log('Testing database connection...');
    await pool.query('SELECT NOW()');
    console.log('Database connected!\n');

    const files = fs.readdirSync(seedsDir).sort();

    console.log('Starting seeds...\n');

    for (const file of files) {
      if (file.endsWith('.sql')) {
        console.log(`Running seed: ${file}`);
        const sql = fs.readFileSync(path.join(seedsDir, file), 'utf8');
        await pool.query(sql);
        console.log(`Completed: ${file}\n`);
      }
    }

    console.log('All seeds completed successfully!');
  } catch (error: any) {
    if (error.code === '23505') {
      console.log('Seeds already exist (duplicate key)');
    } else {
      console.error('Seed failed:', error);
      process.exit(1);
    }
  } finally {
    await pool.end();
  }
}

runSeeds();