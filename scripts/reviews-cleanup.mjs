// Dry run by default. Run daily with --apply after reviewing the retention settings.
import pg from 'pg';
import { S3Client, ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3';
const env = process.env, apply = process.argv.includes('--apply');
for (const key of ['REVIEWS_DATABASE_URL','REVIEWS_S3_BUCKET','REVIEWS_S3_ACCESS_KEY','REVIEWS_S3_SECRET_KEY']) if (!env[key]) throw new Error(`Falta ${key}.`);
const db = new pg.Client({ connectionString: env.REVIEWS_DATABASE_URL, connectionTimeoutMillis: 5000 });
const s3 = new S3Client({ region: env.REVIEWS_S3_REGION || 'eu-west-1', endpoint: env.REVIEWS_S3_ENDPOINT || undefined, forcePathStyle: true,
  credentials: { accessKeyId: env.REVIEWS_S3_ACCESS_KEY, secretAccessKey: env.REVIEWS_S3_SECRET_KEY } });
try {
  await db.connect();
  const { rows } = await db.query("SELECT id,uploads FROM milo_reviews WHERE status IN ('draft','processing') AND created_at < now()-interval '2 days' LIMIT 1000");
  let files = 0;
  for (const row of rows) {
    const keys = new Set(row.uploads.map(file => file.key));
    let continuation;
    do {
      const result = await s3.send(new ListObjectsV2Command({ Bucket: env.REVIEWS_S3_BUCKET, Prefix: `reviews/${row.id}/`, ContinuationToken: continuation }));
      for (const object of result.Contents || []) keys.add(object.Key);
      continuation = result.IsTruncated ? result.NextContinuationToken : undefined;
    } while (continuation);
    files += keys.size;
    if (apply) {
      for (const key of keys) await s3.send(new DeleteObjectCommand({ Bucket: env.REVIEWS_S3_BUCKET, Key: key }));
      await db.query("DELETE FROM milo_reviews WHERE id=$1 AND status IN ('draft','processing')", [row.id]);
    }
  }
  if (apply) await db.query('DELETE FROM milo_review_limits WHERE expires_at < now()');
  console.log(`${apply ? 'Limpieza realizada' : 'Simulación, sin cambios'}: ${rows.length} envíos caducados, ${files} archivos. Las opiniones enviadas no se eliminan.`);
} catch { console.error('No se pudo completar la limpieza. Revisa la conexión y los permisos; se puede volver a ejecutar.'); process.exitCode = 1; }
finally { await db.end(); }
