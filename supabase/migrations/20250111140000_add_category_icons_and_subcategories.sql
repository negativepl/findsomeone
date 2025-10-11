-- Add icon and parent_id columns to categories table
ALTER TABLE categories
ADD COLUMN IF NOT EXISTS icon VARCHAR(50),
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES categories(id) ON DELETE CASCADE;

-- Add index for faster parent lookups
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);

-- Add comment
COMMENT ON COLUMN categories.icon IS 'Lucide icon name for the category (e.g., wrench, hammer, zap)';
COMMENT ON COLUMN categories.parent_id IS 'Parent category ID for subcategories';
