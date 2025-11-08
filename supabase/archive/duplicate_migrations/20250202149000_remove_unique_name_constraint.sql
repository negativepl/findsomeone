-- Remove unique constraint on category name
-- This allows same brand names in different subcategories
-- For example: "Huawei" can exist in both Telefony and Tablety

ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_name_key;

-- Keep slug unique as it's used in URLs
-- Name can be duplicate but slug must be unique for routing
