-- Add tablet brands as third-level subcategories to Elektronika > Tablety

DO $$
DECLARE
  tablety_id uuid;
BEGIN
  -- Get the "Tablety" subcategory ID
  SELECT id INTO tablety_id
  FROM categories
  WHERE slug = 'tablety'
  LIMIT 1;

  IF tablety_id IS NULL THEN
    RAISE EXCEPTION 'Podkategoria "Tablety" nie została znaleziona.';
  END IF;

  -- Insert tablet brand subcategories
  INSERT INTO categories (name, slug, description, parent_id) VALUES
    ('Apple iPad', 'apple-ipad', 'Tablety Apple iPad - iPad Pro M4, iPad Air M2, iPad 10, iPad Mini 6 z iPadOS i Apple Pencil', tablety_id),
    ('Samsung Galaxy Tab', 'samsung-galaxy-tab', 'Tablety Samsung Galaxy Tab - Tab S9 Ultra, Tab A9, Tab Active wzmocnione z rysikiem S Pen Android', tablety_id),
    ('Lenovo', 'lenovo-tablety', 'Tablety Lenovo - Tab P12, Yoga Tab 13, Tab M10 Android do pracy i multimediów', tablety_id),
    ('Huawei', 'huawei-tablety', 'Tablety Huawei - MatePad Pro 13, MatePad 11, MediaPad z HarmonyOS i M-Pencil', tablety_id),
    ('Xiaomi', 'xiaomi-tablety', 'Tablety Xiaomi - Pad 6 Pro, Redmi Pad SE budżetowe z MIUI Android', tablety_id),
    ('Amazon Kindle', 'amazon-kindle', 'Czytniki e-booków Amazon - Kindle Paperwhite, Oasis, Scribe z podświetleniem i długą baterią', tablety_id),
    ('Microsoft Surface', 'microsoft-surface-tablety', 'Tablety Microsoft Surface - Surface Pro 9, Surface Go 3 z Windows 11 i klawiaturą Type Cover', tablety_id),
    ('Pozostałe tablety', 'pozostale-tablety', 'Inne marki tabletów - Onyx Boox e-ink, PocketBook czytniki, Alcatel, Kruger&Matz budżetowe', tablety_id);

  RAISE NOTICE 'Pomyślnie dodano marki tabletów';
END $$;
