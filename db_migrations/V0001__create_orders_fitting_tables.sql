CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  style TEXT NOT NULL,
  custom_style TEXT,
  background TEXT,
  mood TEXT,
  photo_count INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending',
  result_urls JSONB DEFAULT '[]',
  credits_spent INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fitting_clothes (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  product_url TEXT,
  category TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fitting_orders (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_photo_url TEXT NOT NULL,
  clothes_id INTEGER REFERENCES fitting_clothes(id),
  custom_clothes_url TEXT,
  result_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  credits_spent INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
