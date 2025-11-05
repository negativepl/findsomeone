-- Remove all third-level categories (categories that have a parent which also has a parent)
-- This cleans up the structure to: Main Category -> Subcategory (no deeper levels)

DO $$
BEGIN
  -- Delete all categories where the parent has a parent (third level)
  DELETE FROM categories
  WHERE parent_id IN (
    SELECT id FROM categories WHERE parent_id IS NOT NULL
  )
  AND parent_id IS NOT NULL;

  RAISE NOTICE 'Pomyślnie usunięto wszystkie kategorie trzeciego poziomu';
END $$;
