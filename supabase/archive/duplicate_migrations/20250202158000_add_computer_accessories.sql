-- Add computer accessories subcategories to Elektronika > Akcesoria komputerowe

DO $$
DECLARE
  akcesoria_komp_id uuid;
BEGIN
  -- Get the "Akcesoria komputerowe" subcategory ID
  SELECT id INTO akcesoria_komp_id
  FROM categories
  WHERE slug = 'akcesoria-komputerowe'
  LIMIT 1;

  IF akcesoria_komp_id IS NULL THEN
    RAISE EXCEPTION 'Podkategoria "Akcesoria komputerowe" nie została znaleziona.';
  END IF;

  -- Insert computer accessories subcategories
  INSERT INTO categories (name, slug, description, parent_id) VALUES
    ('Monitory', 'monitory', 'Monitory LCD LED IPS VA OLED 24-49 cali Full HD 2K 4K 144Hz 240Hz 360Hz gamingowe biurowe curved', akcesoria_komp_id),
    ('Klawiatury mechaniczne', 'klawiatury-mechaniczne', 'Klawiatury mechaniczne - Cherry MX Red Blue Brown switches hot-swap RGB Keychron Ducky Logitech G', akcesoria_komp_id),
    ('Klawiatury membranowe', 'klawiatury-membranowe', 'Klawiatury membranowe - bezprzewodowe Bluetooth biurowe ciche do pracy Microsoft Logitech budżetowe', akcesoria_komp_id),
    ('Myszki gamingowe', 'myszki-gamingowe', 'Myszki do gier - Logitech G Pro Razer DeathAdder optyczne laserowe 25000 DPI RGB przewodowe wireless', akcesoria_komp_id),
    ('Myszki biurowe', 'myszki-biurowe', 'Myszki komputerowe - bezprzewodowe Bluetooth ciche ergonomiczne pionowe trackball do pracy', akcesoria_komp_id),
    ('Drukarki laserowe', 'drukarki-laserowe', 'Drukarki laserowe - monochromatyczne kolorowe Brother HP Canon wielofunkcyjne MFP skanery duplex', akcesoria_komp_id),
    ('Drukarki atramentowe', 'drukarki-atramentowe', 'Drukarki atramentowe - Epson EcoTank Canon PIXMA HP Smart Tank z systemem ciągłego zasilania tuszu', akcesoria_komp_id),
    ('Kamery internetowe', 'kamery-internetowe', 'Webcamy - Logitech C920 Brio 4K Full HD 1080p 60fps do Zoom Teams spotkań streaming z mikrofonem', akcesoria_komp_id),
    ('Podkładki pod mysz', 'podkladki-pod-mysz', 'Podkładki gamingowe - XXL extended RGB SteelSeries QcK Razer Goliathus Speed Control tkanina guma', akcesoria_komp_id),
    ('HUBy i stacje dokujące', 'huby-stacje-dokujace', 'HUBy USB-C Thunderbolt 4 - stacje dokujące replikatory portów USB 3.0 HDMI czytniki kart SD', akcesoria_komp_id),
    ('Pozostałe akcesoria PC', 'pozostale-akcesoria-pc', 'Inne akcesoria - skanery adaptery kable HDMI DisplayPort ładowarki powerbanki podstawki chłodzące', akcesoria_komp_id);

  RAISE NOTICE 'Pomyślnie dodano kategorie akcesoriów komputerowych';
END $$;
