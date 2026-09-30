export function createStore(db) {
  const query = (sql, values = []) => db.query(sql, values);
  return {
    async consume(key, limit, amount, seconds) {
      if (amount > limit || amount < 1) return false;
      const { rows } = await query(`INSERT INTO milo_review_limits(key,amount,expires_at)
        VALUES($1,$2,now()+$3*interval '1 second')
        ON CONFLICT(key) DO UPDATE SET amount=milo_review_limits.amount+$2
        WHERE milo_review_limits.amount+$2 <= $4 RETURNING key`, [key, amount, seconds, limit]);
      return rows.length === 1;
    },
    async create(review) {
      await query(`INSERT INTO milo_reviews(id,product,author,rating,title,body,token_hash,consent_version,uploads)
        VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb)`,
      [review.id, review.product, review.author, review.rating, review.title, review.body, review.tokenHash, review.consentVersion, JSON.stringify(review.uploads)]);
    },
    async get(id) { return (await query('SELECT * FROM milo_reviews WHERE id=$1', [id])).rows[0]; },
    async claim(id, tokenHash) {
      return (await query(`UPDATE milo_reviews SET status='processing',processing_at=now()
        WHERE id=$1 AND token_hash=$2 AND created_at > now()-interval '1 hour'
        AND (status='draft' OR (status='processing' AND processing_at < now()-interval '2 minutes')) RETURNING *`, [id, tokenHash])).rows[0];
    },
    async finish(id, media) {
      await query(`UPDATE milo_reviews SET status='pending',media=$2::jsonb,submitted_at=now(),processing_at=NULL
        WHERE id=$1 AND status='processing'`, [id, JSON.stringify(media)]);
    },
    async release(id) { await query("UPDATE milo_reviews SET status='draft',processing_at=NULL WHERE id=$1 AND status='processing'", [id]); },
    async list({ product, rating = 0, media = false, sort = 'recent', page = 1, admin = false, status = 'pending' }) {
      const order = { recent: 'submitted_at DESC,id', highest: 'rating DESC,submitted_at DESC,id', lowest: 'rating ASC,submitted_at DESC,id' }[sort] || 'submitted_at DESC,id';
      const args = [product, admin ? status : 'approved', rating, media];
      const where = `($1::text IS NULL OR product=$1) AND status=$2 AND ($3::int=0 OR rating=$3) AND (NOT $4::boolean OR jsonb_array_length(media)>0)`;
      const { rows } = await query(`SELECT id,product,author,rating,title,body,status,media,submitted_at,moderation_reason
        FROM milo_reviews WHERE ${where} ORDER BY ${order} LIMIT 12 OFFSET $5`, [...args, (page - 1) * 12]);
      const count = await query(`SELECT count(*)::int AS total FROM milo_reviews WHERE ${where}`, args);
      const summary = await query(`SELECT rating,count(*)::int AS count FROM milo_reviews
        WHERE ($1::text IS NULL OR product=$1) AND status='approved' GROUP BY rating`, [product]);
      const distribution = Object.fromEntries([1, 2, 3, 4, 5].map(n => [n, 0]));
      for (const row of summary.rows) distribution[row.rating] = row.count;
      const total = Object.values(distribution).reduce((a, b) => a + b, 0);
      const sum = Object.entries(distribution).reduce((n, [rating, count]) => n + Number(rating) * count, 0);
      return { reviews: rows, total: count.rows[0].total, page, hasMore: page * 12 < count.rows[0].total,
        summary: { count: total, average: total ? Math.round(sum / total * 10) / 10 : null, distribution } };
    },
    async moderate(id, decision, reason) {
      const { rows } = await query(`WITH changed AS (
        UPDATE milo_reviews SET status=$2,moderated_at=now(),moderation_reason=$3
        WHERE id=$1 AND status IN ('pending','approved','rejected') AND status<>$2 RETURNING id
      ) INSERT INTO milo_review_audit(review_id,decision,reason) SELECT id,$2,$3 FROM changed RETURNING review_id`, [id, decision, reason]);
      return rows.length === 1;
    },
    query
  };
}
