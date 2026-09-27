import { createHash, createHmac, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';

export const LIMITS = { files: 4, videos: 1, image: 5 * 1024 * 1024, video: 25 * 1024 * 1024, total: 30 * 1024 * 1024 };
const TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime']);
export const CONSENT_VERSION = '2026-09-27';
const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const hash = value => createHash('sha256').update(value).digest('hex');
const fail = (status, message) => { throw Object.assign(new Error(message), { status }); };
const equal = (a, b) => { const x = Buffer.from(a); const y = Buffer.from(b); return x.length === y.length && timingSafeEqual(x, y); };

export function validateReview(input, products) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) fail(400, 'Revisa los datos de tu opinión.');
  if (!products.includes(input.product)) fail(400, 'El producto no admite opiniones.');
  if (input.website) fail(400, 'No hemos podido enviar la opinión.');
  const text = (name, min, max) => {
    if (typeof input[name] !== 'string') fail(400, 'Completa los campos de la opinión.');
    const value = input[name].trim();
    if (value.length < min || value.length > max || /[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(value)) fail(400, 'Revisa la longitud de los campos.');
    return value;
  };
  const author = text('author', 2, 40), title = text('title', 0, 100), body = text('body', 10, 2000);
  if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) fail(400, 'Elige entre 1 y 5 estrellas.');
  if (input.consent !== true || input.consentVersion !== CONSENT_VERSION) fail(400, 'Confirma el permiso para publicar tu opinión y sus archivos.');
  if (!Array.isArray(input.files) || input.files.length > LIMITS.files) fail(400, 'Puedes adjuntar hasta 4 archivos.');
  let total = 0, videos = 0;
  const files = input.files.map(file => {
    if (!file || !TYPES.has(file.type)) fail(400, 'Usa JPG, PNG, WebP, MP4, WebM o MOV.');
    const video = file.type.startsWith('video/');
    if (video) videos++;
    if (!Number.isInteger(file.size) || file.size < 1 || file.size > (video ? LIMITS.video : LIMITS.image)) fail(400, 'Una foto supera 5 MB o un vídeo supera 25 MB.');
    total += file.size;
    return { type: file.type, size: file.size };
  });
  if (videos > LIMITS.videos || total > LIMITS.total) fail(400, 'Adjunta como máximo un vídeo y 30 MB en total.');
  return { product: input.product, author, title, body, rating: input.rating, files, total };
}

export function createReviewService({ store, storage, config, now = () => Date.now() }) {
  const products = config.products;
  const ipHash = ip => createHmac('sha256', config.secret).update(ip).digest('hex');
  async function rate(ip, scope, max, seconds = 3600, amount = 1) {
    const window = Math.floor(now() / (seconds * 1000));
    if (!await store.consume(`${scope}:${ipHash(ip)}:${window}`, max, amount, seconds * 2)) fail(429, 'Has alcanzado el límite de intentos. Vuelve a probar más tarde.');
  }
  const validateId = id => { if (typeof id !== 'string' || !uuid.test(id)) fail(400, 'Referencia de opinión no válida.'); };
  const authorizeDraft = (row, token) => { if (!row || typeof token !== 'string' || token.length > 200 || !equal(row.token_hash, hash(token))) fail(403, 'Esta sesión de envío no es válida.'); };
  const publicMedia = async row => ({ id: row.id, product: row.product, author: row.author, rating: row.rating,
    title: row.title, body: row.body, date: row.submitted_at,
    media: await Promise.all(row.media.map(async item => ({ type: item.type, url: await storage.url(item) }))) });
  return {
    async list(params, admin = false) {
      if (!admin && !products.includes(params.product)) fail(400, 'Producto no válido.');
      if (admin && !['pending','approved','rejected'].includes(params.status)) fail(400, 'Estado no válido.');
      const result = await store.list({ ...params, admin });
      result.reviews = await Promise.all(result.reviews.map(async row => ({ ...await publicMedia(row), ...(admin ? { status: row.status, reason: row.moderation_reason } : {}) })));
      return result;
    },
    async start(input, ip) {
      const data = validateReview(input, products);
      await rate(ip, 'start', 3, 86400);
      await rate('store', 'daily-reviews', 50, 86400);
      if (data.total) await rate('store', 'daily-upload-bytes', 200 * 1024 * 1024, 86400, data.total);
      const id = randomUUID(), token = randomBytes(32).toString('hex');
      const uploads = data.files.map(file => ({ ...file, key: `staging/${id}/${randomUUID()}` }));
      await store.create({ ...data, id, tokenHash: hash(token), consentVersion: CONSENT_VERSION, uploads });
      return { id, token, uploads: await Promise.all(uploads.map(upload => storage.ticket(upload))) };
    },
    async tickets(input, ip) {
      validateId(input.id);
      await rate(ip, 'tickets', 30);
      const row = await store.get(input.id); authorizeDraft(row, input.token);
      if (row.status !== 'draft' || now() - new Date(row.created_at).getTime() > 3600000) fail(409, 'La sesión de subida ha caducado. Recarga la página para empezar de nuevo.');
      return { uploads: await Promise.all(row.uploads.map(upload => storage.ticket(upload))) };
    },
    async finish(input, ip) {
      validateId(input.id);
      await rate(ip, 'finish', 20);
      const previous = await store.get(input.id); authorizeDraft(previous, input.token);
      if (['pending','approved'].includes(previous.status)) return { received: true, id: input.id };
      const row = await store.claim(input.id, hash(input.token));
      if (!row) fail(409, 'El envío está en curso o ha caducado. Espera un momento y vuelve a intentarlo.');
      const media = [];
      try {
        for (const upload of row.uploads) media.push(await storage.seal(upload, row.id));
        await store.finish(row.id, media);
      } catch {
        await Promise.allSettled(media.map(item => storage.remove(item.key)));
        await store.release(row.id);
        fail(422, 'No hemos podido comprobar los archivos. Comprueba su formato y vuelve a enviarlos.');
      }
      await Promise.allSettled(row.uploads.map(upload => storage.remove(upload.key)));
      return { received: true, id: row.id };
    },
    async adminAuth(token, ip) {
      if (!equal(hash(token || ''), hash(config.adminSecret))) {
        await rate(ip, 'admin-failed', 10, 600);
        fail(401, 'Acceso no autorizado.');
      }
    },
    async moderate(input) {
      validateId(input.id);
      if (!['approved','rejected'].includes(input.decision)) fail(400, 'Decisión no válida.');
      const reason = typeof input.reason === 'string' ? input.reason.trim() : '';
      if (reason.length > 300 || (input.decision === 'rejected' && reason.length < 5)) fail(400, 'Indica el motivo de la retirada o rechazo.');
      if (!await store.moderate(input.id, input.decision, reason)) fail(409, 'La opinión ya cambió de estado. Actualiza la lista.');
      return { updated: true };
    },
    config: { limits: LIMITS, consentVersion: CONSENT_VERSION }
  };
}

async function readJson(request) {
  if (!request.headers.get('content-type')?.startsWith('application/json')) fail(415, 'Formato de solicitud no válido.');
  const reader = request.body?.getReader();
  if (!reader) fail(400, 'Faltan los datos de la opinión.');
  let size = 0; const chunks = [];
  while (true) { const { value, done } = await reader.read(); if (done) break; size += value.byteLength;
    if (size > 16000) { await reader.cancel(); fail(413, 'La solicitud es demasiado grande.'); } chunks.push(value); }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { fail(400, 'Datos no válidos.'); }
}

export function createHandler({ service, origins, getIp = () => 'unknown' }) {
  return async request => {
    const origin = request.headers.get('origin');
    const headers = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', Vary: 'Origin' };
    const respond = (data, status = 200) => new Response(JSON.stringify(data), { status, headers });
    if (origin && !origins.includes(origin)) return respond({ error: 'Origen no permitido.' }, 403);
    if (origin) headers['Access-Control-Allow-Origin'] = origin;
    if (request.method === 'OPTIONS') {
      if (!origin) return respond({ error: 'Origen no permitido.' }, 403);
      headers['Access-Control-Allow-Methods'] = 'GET,POST,OPTIONS';
      headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization';
      headers['Access-Control-Max-Age'] = '600';
      return new Response(null, { status: 204, headers });
    }
    try {
      if (!service) fail(503, 'Las opiniones todavía no están disponibles. Vuelve a intentarlo más adelante.');
      const url = new URL(request.url), action = url.searchParams.get('action') || 'list', ip = getIp(request);
      const isAdmin = action.startsWith('admin-');
      if (isAdmin) await service.adminAuth(request.headers.get('authorization')?.replace(/^Bearer /, ''), ip);
      if (request.method === 'GET' && action === 'config') return respond(service.config);
      if (request.method === 'GET' && ['list','admin-list'].includes(action)) {
        const page = Number(url.searchParams.get('page') || 1), rating = Number(url.searchParams.get('rating') || 0);
        if (!Number.isInteger(page) || page < 1 || page > 1000 || !Number.isInteger(rating) || rating < 0 || rating > 5) fail(400, 'Filtros no válidos.');
        return respond(await service.list({ product: isAdmin ? null : url.searchParams.get('product'), page, rating,
          media: url.searchParams.get('media') === 'true', sort: url.searchParams.get('sort') || 'recent', status: url.searchParams.get('status') || 'pending' }, isAdmin));
      }
      if (request.method !== 'POST') fail(405, 'Método no permitido.');
      if (!origin) fail(403, 'Origen no permitido.');
      const input = await readJson(request);
      if (!input || typeof input !== 'object' || Array.isArray(input)) fail(400, 'Datos no válidos.');
      if (action === 'start') return respond(await service.start(input, ip), 201);
      if (action === 'tickets') return respond(await service.tickets(input, ip));
      if (action === 'finish') return respond(await service.finish(input, ip), 202);
      if (action === 'admin-moderate') return respond(await service.moderate(input));
      fail(404, 'Operación no disponible.');
    } catch (error) {
      return respond({ error: error.status ? error.message : 'No hemos podido completar la operación. Vuelve a intentarlo.' }, error.status || 503);
    }
  };
}
