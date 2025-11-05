-- Add phone brands as third-level subcategories to Elektronika > Telefony
-- Each brand gets detailed description with popular models

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
    RAISE EXCEPTION 'Podkategoria "Telefony" nie została znaleziona. Upewnij się, że kategoria Elektronika istnieje.';
  END IF;

  -- Insert phone brand subcategories with detailed descriptions
  INSERT INTO categories (name, slug, description, parent_id) VALUES
    -- Najpopularniejsze marki telefonów
    ('Apple', 'apple-telefony', 'Telefony iPhone - smartfony Apple z systemem iOS: iPhone 15 Pro Max, iPhone 14, iPhone 13, iPhone SE', telefony_id),
    ('Samsung', 'samsung-telefony', 'Smartfony Samsung Galaxy - seria S flagship, seria A budżetowe, seria Z składane: Galaxy S24, A54, Z Fold', telefony_id),
    ('Xiaomi', 'xiaomi-telefony', 'Smartfony Xiaomi i Redmi - MIUI budżetowe i flagowe: Xiaomi 14, Redmi Note 13, Poco X6', telefony_id),
    ('Huawei', 'huawei-telefony', 'Smartfony Huawei i Honor - HarmonyOS: Huawei P60, Mate 50, Nova, Honor Magic', telefony_id),
    ('Oppo', 'oppo-telefony', 'Smartfony Oppo - ColorOS szybkie ładowanie: Oppo Find X6, Reno 11, A78', telefony_id),
    ('Realme', 'realme-telefony', 'Smartfony Realme - budżetowe telefony o dobrej specyfikacji: Realme 12 Pro, GT Neo, C55', telefony_id),
    ('OnePlus', 'oneplus-telefony', 'Smartfony OnePlus - OxygenOS flagowce w dobrej cenie: OnePlus 12, Nord 3, Open składany', telefony_id),
    ('Google', 'google-telefony', 'Telefony Google Pixel - czysty Android najszybsze aktualizacje: Pixel 8 Pro, Pixel 7a, Pixel Fold', telefony_id),
    ('Motorola', 'motorola-telefony', 'Smartfony Motorola Moto - czyste Android: Moto G84, Edge 40, Razr składany', telefony_id),
    ('Nokia', 'nokia-telefony', 'Smartfony Nokia - HMD Global Android One: Nokia G60, X30, klasyczne telefony retro', telefony_id),
    ('Sony', 'sony-telefony', 'Smartfony Sony Xperia - dla fotografów i kinomaniaków: Xperia 1 V, Xperia 5 V, Xperia 10', telefony_id),
    ('Vivo', 'vivo-telefony', 'Smartfony Vivo - świetne aparaty Zeiss: Vivo X100, V29, Y36', telefony_id),
    ('Asus', 'asus-telefony', 'Smartfony Asus - ROG Phone gamingowe, Zenfone kompaktowe: ROG Phone 8, Zenfone 10', telefony_id),
    ('Nothing', 'nothing-telefony', 'Smartfony Nothing Phone - unikalny design z podświetleniem Glyph: Nothing Phone 2, Phone 2a', telefony_id),
    ('Pozostałe marki', 'pozostale-telefony', 'Inne marki telefonów - LG, HTC, BlackBerry, ZTE, Lenovo i mniej popularne marki smartfonów', telefony_id);

  RAISE NOTICE 'Pomyślnie dodano % marek telefonów do podkategorii "Telefony"', 15;
END $$;
