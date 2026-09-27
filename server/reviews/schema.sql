CREATE TABLE IF NOT EXISTS milo_reviews (
  id uuid PRIMARY KEY,
  product text NOT NULL,
  author text NOT NULL CHECK (char_length(author) BETWEEN 2 AND 40),
  rating smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title text NOT NULL CHECK (char_length(title) <= 100),
  body text NOT NULL CHECK (char_length(body) BETWEEN 10 AND 2000),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','processing','pending','approved','rejected')),
  token_hash text NOT NULL,
  consent_version text NOT NULL,
  uploads jsonb NOT NULL DEFAULT '[]',
  media jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  submitted_at timestamptz,
  processing_at timestamptz,
  moderated_at timestamptz,
  moderation_reason text
);
CREATE INDEX IF NOT EXISTS milo_reviews_public_idx ON milo_reviews(product, status, submitted_at DESC);
CREATE INDEX IF NOT EXISTS milo_reviews_queue_idx ON milo_reviews(status, created_at);
CREATE TABLE IF NOT EXISTS milo_review_limits (
  key text PRIMARY KEY,
  amount bigint NOT NULL,
  expires_at timestamptz NOT NULL
);
CREATE TABLE IF NOT EXISTS milo_review_audit (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  review_id uuid NOT NULL REFERENCES milo_reviews(id) ON DELETE CASCADE,
  decision text NOT NULL,
  reason text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE milo_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE milo_review_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE milo_review_audit ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON milo_reviews, milo_review_limits, milo_review_audit FROM PUBLIC;
