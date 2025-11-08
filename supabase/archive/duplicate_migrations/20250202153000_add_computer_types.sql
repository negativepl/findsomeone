-- Add computer types as third-level subcategories to Elektronika > Komputery

DO $$
DECLARE
  komputery_id uuid;
BEGIN
  -- Get the "Komputery" subcategory ID
  SELECT id INTO komputery_id
  FROM categories
  WHERE slug = 'komputery'
  LIMIT 1;

  IF komputery_id IS NULL THEN
    RAISE EXCEPTION 'Podkategoria "Komputery" nie została znaleziona.';
  END IF;

  -- Insert computer type subcategories
  INSERT INTO categories (name, slug, description, parent_id) VALUES
    ('Komputery do gier', 'komputery-gamingowe', 'PC gamingowe z mocnymi kartami graficznymi RTX 4090 4080 RX 7900 do gier AAA 4K wysokie FPS', komputery_id),
    ('Komputery do pracy', 'komputery-biurowe', 'PC biurowe do pracy office Excel Word internet poczta multimedia dokumenty budżetowe', komputery_id),
    ('Stacje robocze', 'stacje-robocze', 'Workstation do grafiki 3D renderingu edycji wideo 4K 8K CAD Blender Adobe Premiere', komputery_id),
    ('Mini PC', 'mini-pc', 'Kompaktowe komputery małych rozmiarów - Intel NUC, Mac Mini, miniPC do biura kina domowego', komputery_id),
    ('All-in-One', 'komputery-all-in-one', 'Komputery AIO zintegrowane z monitorem - iMac, HP Pavilion Dell Inspiron oszczędność miejsca', komputery_id),
    ('Zestawy komputerowe', 'zestawy-komputerowe', 'Gotowe zestawy PC z monitorem klawiaturą myszką głośnikami komplety komputerowe', komputery_id),
    ('Pozostałe komputery', 'pozostale-komputery', 'Inne typy komputerów - serwery domowe NAS media center HTPC nietypowe konfiguracje', komputery_id);

  RAISE NOTICE 'Pomyślnie dodano typy komputerów';
END $$;
