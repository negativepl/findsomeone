-- Add phone brands as subcategories to "Telefony" in "Elektronika"
-- This creates a third level: Elektronika > Telefony > [Brand]

-- First, get the ID of "Telefony" subcategory
DO $$
DECLARE
  telefony_id uuid;
BEGIN
  -- Get the "Telefony" subcategory ID
  SELECT id INTO telefony_id
  FROM categories
  WHERE slug = 'telefony'
  LIMIT 1;

  -- Check if we found the category
  IF telefony_id IS NULL THEN
    RAISE EXCEPTION 'Podkategoria "Telefony" nie została znaleziona. Upewnij się, że kategoria Elektronika i jej podkategorie istnieją.';
  END IF;

  -- Insert phone brand subcategories
  INSERT INTO categories (name, slug, description, parent_id) VALUES
    -- Najpopularniejsze marki telefonów
    ('Apple iPhone', 'apple-iphone', 'Smartfony Apple iPhone', telefony_id),
    ('Samsung', 'samsung', 'Smartfony Samsung', telefony_id),
    ('Xiaomi', 'xiaomi', 'Smartfony Xiaomi', telefony_id),
    ('Huawei', 'huawei', 'Smartfony Huawei', telefony_id),
    ('Oppo', 'oppo', 'Smartfony Oppo', telefony_id),
    ('Realme', 'realme', 'Smartfony Realme', telefony_id),
    ('OnePlus', 'oneplus', 'Smartfony OnePlus', telefony_id),
    ('Google Pixel', 'google-pixel', 'Smartfony Google Pixel', telefony_id),
    ('Motorola', 'motorola', 'Smartfony Motorola', telefony_id),
    ('Nokia', 'nokia', 'Smartfony Nokia', telefony_id),
    ('Sony', 'sony', 'Smartfony Sony', telefony_id),
    ('Vivo', 'vivo', 'Smartfony Vivo', telefony_id),
    ('Honor', 'honor', 'Smartfony Honor', telefony_id),
    ('Asus', 'asus', 'Smartfony Asus', telefony_id),
    ('LG', 'lg', 'Smartfony LG', telefony_id),
    ('Inne marki', 'inne-marki-telefonow', 'Pozostałe marki telefonów', telefony_id);

  RAISE NOTICE 'Pomyślnie dodano % marek telefonów do podkategorii "Telefony"', 16;
END $$;
