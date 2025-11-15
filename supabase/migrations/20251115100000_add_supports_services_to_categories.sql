-- =====================================================
-- ADD supports_services TO categories
-- =====================================================
-- Adds flag to indicate which categories support service bookings

-- Add column
ALTER TABLE categories
ADD COLUMN IF NOT EXISTS supports_services BOOLEAN DEFAULT false;

-- Update main categories that support services
UPDATE categories
SET supports_services = true
WHERE slug IN ('uslugi', 'noclegi');

-- Update all subcategories under 'uslugi' (wszystkie)
UPDATE categories
SET supports_services = true
WHERE parent_id IN (SELECT id FROM categories WHERE slug = 'uslugi');

-- Update all subcategories under 'noclegi' (wszystkie)
UPDATE categories
SET supports_services = true
WHERE parent_id IN (SELECT id FROM categories WHERE slug = 'noclegi');

-- Add index for efficient filtering
CREATE INDEX IF NOT EXISTS categories_supports_services_idx
ON categories(supports_services)
WHERE supports_services = true;

COMMENT ON COLUMN categories.supports_services IS 'True if this category supports service/booking functionality';
