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
  const keys = new Set();
  // Signed uploads can be replayed briefly after submission. Clean staging even
  // when the associated review has already been submitted or no longer exists.
  let stagingContinuation;
  const cutoff = Date.now() - 2 * 86400000;
  do {
    const result = await s3.send(new ListObjectsV2Command({ Bucket: env.REVIEWS_S3_BUCKET, Prefix: 'staging/', ContinuationToken: stagingContinuation }));
    for (const object of result.Contents || []) if (object.LastModified && new Date(object.LastModified).getTime() < cutoff) keys.add(object.Key);
    stagingContinuation = result.IsTruncated ? result.NextContinuationToken : undefined;
  } while (stagingContinuation);
  for (const row of rows) {
    for (const file of row.uploads) keys.add(file.key);
    let continuation;
    do {
      const result = await s3.send(new ListObjectsV2Command({ Bucket: env.REVIEWS_S3_BUCKET, Prefix: `reviews/${row.id}/`, ContinuationToken: continuation }));
      for (const object of result.Contents || []) keys.add(object.Key);
      continuation = result.IsTruncated ? result.NextContinuationToken : undefined;
    } while (continuation);
  }
  if (apply) {
    for (const key of keys) await s3.send(new DeleteObjectCommand({ Bucket: env.REVIEWS_S3_BUCKET, Key: key }));
    for (const row of rows) await db.query("DELETE FROM milo_reviews WHERE id=$1 AND status IN ('draft','processing')", [row.id]);
    await db.query('DELETE FROM milo_review_limits WHERE expires_at < now()');
  }
  console.log(`${apply ? 'Limpieza realizada' : 'Simulación, sin cambios'}: ${rows.length} envíos caducados, ${keys.size} archivos. Las opiniones enviadas no se eliminan.`);
} catch { console.error('No se pudo completar la limpieza. Revisa la conexión y los permisos; se puede volver a ejecutar.'); process.exitCode = 1; }
finally { await db.end(); }
