-- Add price_negotiable column to posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS price_negotiable BOOLEAN DEFAULT FALSE;

-- Update existing posts where price_type = 'negotiable'
UPDATE posts
SET price_negotiable = TRUE,
    price_type = 'fixed'
WHERE price_type = 'negotiable';

-- Add comment
COMMENT ON COLUMN posts.price_negotiable IS 'Indicates whether the price is negotiable';
