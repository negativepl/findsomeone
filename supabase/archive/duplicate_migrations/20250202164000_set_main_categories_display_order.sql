-- Set display_order for all categories alphabetically
-- "Pozostałe" and "Inne" categories always appear last (display_order = 9999)

DO $$
BEGIN
  -- For all categories: set display_order alphabetically within their level
  -- "Pozostałe"/"Inne" get 9999 to appear last
  WITH ranked_cats AS (
    SELECT
      id,
      parent_id,
      CASE
        WHEN name LIKE 'Pozostał%' OR name LIKE 'Inne %' OR name = 'Inne' THEN 9999
        ELSE ROW_NUMBER() OVER (PARTITION BY parent_id ORDER BY name) * 10
      END as new_order
    FROM categories
  )
  UPDATE categories
  SET display_order = ranked_cats.new_order
  FROM ranked_cats
  WHERE categories.id = ranked_cats.id;

  RAISE NOTICE 'Pomyślnie ustawiono display_order alfabetycznie dla wszystkich kategorii';
END $$;
