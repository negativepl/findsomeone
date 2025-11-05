-- Add display_order column to categories table
-- This allows manual ordering of categories, with "Pozostałe" always at the end

ALTER TABLE categories ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Set display_order for all "Pozostałe" categories to 9999 (appears last)
UPDATE categories
SET display_order = 9999
WHERE name LIKE 'Pozostał%'
   OR name LIKE 'Inne %'
   OR slug LIKE 'pozostale-%'
   OR slug LIKE 'inne-%';

-- Set display_order for all other categories to their current position
-- This gives us flexibility to reorder later if needed
WITH numbered_categories AS (
  SELECT
    id,
    ROW_NUMBER() OVER (PARTITION BY parent_id ORDER BY created_at) as row_num
  FROM categories
  WHERE display_order != 9999
)
UPDATE categories
SET display_order = numbered_categories.row_num
FROM numbered_categories
WHERE categories.id = numbered_categories.id;

-- Create index for better performance when sorting
CREATE INDEX IF NOT EXISTS idx_categories_display_order ON categories(parent_id, display_order);

COMMENT ON COLUMN categories.display_order IS 'Order for displaying categories. 9999 = last (for Pozostałe/Inne categories)';
