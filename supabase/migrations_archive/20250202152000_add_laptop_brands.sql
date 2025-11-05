-- Add laptop brands as third-level subcategories to Elektronika > Laptopy

DO $$
DECLARE
  laptopy_id uuid;
BEGIN
  -- Get the "Laptopy" subcategory ID
  SELECT id INTO laptopy_id
  FROM categories
  WHERE slug = 'laptopy'
  LIMIT 1;

  IF laptopy_id IS NULL THEN
    RAISE EXCEPTION 'Podkategoria "Laptopy" nie została znaleziona.';
  END IF;

  -- Insert laptop brand subcategories
  INSERT INTO categories (name, slug, description, parent_id) VALUES
    ('Apple MacBook', 'apple-macbook', 'Laptopy Apple MacBook - MacBook Air M3 M2, MacBook Pro 14 16 cali z chipami Apple Silicon macOS', laptopy_id),
    ('Dell', 'dell-laptopy', 'Laptopy Dell - XPS ultrabooki premium, Inspiron uniwersalne, Latitude biznesowe, Alienware gamingowe', laptopy_id),
    ('HP', 'hp-laptopy', 'Laptopy HP - Pavilion domowe, EliteBook ProBook biznesowe, Omen Victus gamingowe, Envy premium', laptopy_id),
    ('Lenovo', 'lenovo-laptopy', 'Laptopy Lenovo - ThinkPad biznesowe, IdeaPad uniwersalne, Legion LOQ gamingowe, Yoga 2w1', laptopy_id),
    ('Asus', 'asus-laptopy', 'Laptopy Asus - VivoBook uniwersalne, ZenBook ultrabooki, ROG Strix TUF gamingowe, ProArt dla twórców', laptopy_id),
    ('Acer', 'acer-laptopy', 'Laptopy Acer - Aspire domowe budżetowe, Swift ultrabooki, Predator Nitro gamingowe', laptopy_id),
    ('MSI', 'msi-laptopy', 'Laptopy MSI - gamingowe z mocnymi kartami graficznymi RTX: MSI Titan Raider Stealth Katana Cyborg', laptopy_id),
    ('Microsoft Surface', 'microsoft-surface-laptopy', 'Laptopy Microsoft Surface - Surface Laptop 5 Studio 2 Go 3 z Windows 11 ekrany dotykowe', laptopy_id),
    ('Huawei', 'huawei-laptopy', 'Laptopy Huawei MateBook - MateBook X Pro D 14 lekkie ultrabooki przenośne mobilne', laptopy_id),
    ('Samsung', 'samsung-laptopy', 'Laptopy Samsung - Galaxy Book3 Pro 360 Ultra z ekosystemem Galaxy Windows 11', laptopy_id),
    ('Pozostałe laptopy', 'pozostale-laptopy', 'Inne marki laptopów - Toshiba, Fujitsu, Gigabyte, Razer Blade, LG Gram i mniej popularne notebooki', laptopy_id);

  RAISE NOTICE 'Pomyślnie dodano marki laptopów';
END $$;
