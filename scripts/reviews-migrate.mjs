import pg from 'pg';
import { readFile } from 'node:fs/promises';
if (!process.env.REVIEWS_DATABASE_URL) throw new Error('Falta REVIEWS_DATABASE_URL.');
const client = new pg.Client({ connectionString: process.env.REVIEWS_DATABASE_URL, connectionTimeoutMillis: 5000 });
try {
  await client.connect(); await client.query('BEGIN');
  await client.query(await readFile(new URL('../server/reviews/schema.sql', import.meta.url), 'utf8'));
  await client.query('COMMIT'); console.log('Tablas de opiniones preparadas.');
} catch { await client.query('ROLLBACK').catch(() => {}); console.error('No se pudo preparar la base de datos. Revisa la conexión y los permisos.'); process.exitCode = 1; }
finally { await client.end(); }
