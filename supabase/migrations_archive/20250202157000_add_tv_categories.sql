-- Add TV subcategories to Elektronika > Telewizory i projektory

DO $$
DECLARE
  telewizory_id uuid;
BEGIN
  -- Get the "Telewizory i projektory" subcategory ID
  SELECT id INTO telewizory_id
  FROM categories
  WHERE slug = 'telewizory'
  LIMIT 1;

  IF telewizory_id IS NULL THEN
    RAISE EXCEPTION 'Podkategoria "Telewizory i projektory" nie została znaleziona.';
  END IF;

  -- Insert TV and projector subcategories
  INSERT INTO categories (name, slug, description, parent_id) VALUES
    ('Samsung TV', 'samsung-tv', 'Telewizory Samsung - QLED QN900D Neo QLED Crystal UHD The Frame Lifestyle 43-98 cali 4K 8K HDR', telewizory_id),
    ('LG TV', 'lg-tv', 'Telewizory LG - OLED evo C4 G4 B4 NanoCell QNED webOS Magic Remote ThinQ AI 48-97 cali', telewizory_id),
    ('Sony TV', 'sony-tv', 'Telewizory Sony Bravia - XR OLED A95L A80L LED X95L Google TV Android TV Acoustic Surface 4K 120Hz', telewizory_id),
    ('TCL TV', 'tcl-tv', 'Telewizory TCL - QLED QM8K Mini LED C74 Google TV Android TV budżetowe 4K Dolby Vision Atmos', telewizory_id),
    ('Philips TV', 'philips-tv', 'Telewizory Philips - Ambilight OLED+ 4K Android TV Google TV podświetlenie ambientowe Titan OS', telewizory_id),
    ('Xiaomi TV', 'xiaomi-tv', 'Telewizory Xiaomi Mi TV - Android TV Google TV 4K HDR10+ Dolby Vision tanio budżetowe smart TV', telewizory_id),
    ('Hisense TV', 'hisense-tv', 'Telewizory Hisense - ULED Mini LED A7 E7 VIDAA Smart TV budżetowe 4K HDR Dolby Vision', telewizory_id),
    ('Projektory', 'projektory', 'Projektory do kina domowego - Epson EH BenQ W Optoma UHD 4K Full HD DLP LCD krótkoogniskowe laserowe', telewizory_id),
    ('Ekrany projekcyjne', 'ekrany-projekcyjne', 'Ekrany do projektorów - naścienne elektryczne stacjonarne ramowe przenośne tripod kino domowe', telewizory_id),
    ('Uchwyty do TV', 'uchwyty-tv', 'Uchwyty ścienne - do telewizorów obrotowe uchylne VESA 200x200 400x400 600x400 regulowane', telewizory_id),
    ('Pozostałe TV', 'pozostale-tv', 'Inne sprzęty - piloty uniwersalne anteny DVB-T2 dekodery Chromecast Apple TV Android TV Box tunery', telewizory_id);

  RAISE NOTICE 'Pomyślnie dodano kategorie telewizorów i projektorów';
END $$;
