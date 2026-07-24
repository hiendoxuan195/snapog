-- Records which paid tier a user clicked before registering, while checkout
-- is not yet live. Signal for pricing/monetization decisions.
CREATE TABLE IF NOT EXISTS tier_interest (
  id          TEXT PRIMARY KEY,
  email       TEXT NOT NULL,
  tier        TEXT NOT NULL,               -- pro | business
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_tier_interest_email ON tier_interest(email);
