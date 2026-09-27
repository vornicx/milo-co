import pg from 'pg';
import { createStore } from '../server/reviews/store.mjs';
import { createStorage } from '../server/reviews/storage.mjs';
import { createHandler, createReviewService } from '../server/reviews/service.mjs';

const env = process.env;
const required = ['REVIEWS_DATABASE_URL','REVIEWS_S3_BUCKET','REVIEWS_S3_ACCESS_KEY','REVIEWS_S3_SECRET_KEY','REVIEWS_ADMIN_SECRET','REVIEWS_HASH_SECRET','REVIEWS_ALLOWED_ORIGINS','REVIEWS_PRODUCTS'];
const ready = required.every(key => env[key]) && env.REVIEWS_ADMIN_SECRET.length >= 32 && env.REVIEWS_HASH_SECRET.length >= 32;
let service = null;
if (ready) {
  const pool = new pg.Pool({ connectionString: env.REVIEWS_DATABASE_URL, max: 3, connectionTimeoutMillis: 5000, idleTimeoutMillis: 10000 });
  pool.on('error', () => console.error('Reviews database connection interrupted'));
  service = createReviewService({ store: createStore(pool), storage: createStorage(env),
    config: { products: env.REVIEWS_PRODUCTS.split(',').map(x => x.trim()), secret: env.REVIEWS_HASH_SECRET, adminSecret: env.REVIEWS_ADMIN_SECRET } });
}
export default { fetch: createHandler({ service,
  origins: (env.REVIEWS_ALLOWED_ORIGINS || '').split(',').map(x => x.trim()).filter(Boolean),
  getIp: request => env.VERCEL === '1' ? (request.headers.get('x-vercel-forwarded-for') || 'unknown').split(',')[0].trim() : 'local'
}) };
