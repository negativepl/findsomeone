-- Add PC components subcategories to Elektronika > Podzespoły komputerowe

DO $$
DECLARE
  podzespoly_id uuid;
BEGIN
  -- Get the "Podzespoły komputerowe" subcategory ID
  SELECT id INTO podzespoly_id
  FROM categories
  WHERE slug = 'podzespoly-pc'
  LIMIT 1;

  IF podzespoly_id IS NULL THEN
    RAISE EXCEPTION 'Podkategoria "Podzespoły komputerowe" nie została znaleziona.';
  END IF;

  -- Insert PC components subcategories
  INSERT INTO categories (name, slug, description, parent_id) VALUES
    ('Karty graficzne NVIDIA', 'karty-nvidia', 'Karty graficzne NVIDIA - GeForce RTX 4090 4080 4070 Ti Super 3060 Ti gaming ray tracing DLSS', podzespoly_id),
    ('Karty graficzne AMD', 'karty-amd', 'Karty graficzne AMD Radeon - RX 7900 XTX XT 7800 7700 7600 gaming FSR FidelityFX', podzespoly_id),
    ('Procesory Intel', 'procesory-intel', 'Procesory Intel Core - i9-14900K i7-14700K i5-14600K Raptor Lake socket LGA1700 unlocked', podzespoly_id),
    ('Procesory AMD', 'procesory-amd', 'Procesory AMD Ryzen - 9 7950X 7900X 7 7700X 5 7600X AM5 Zen 4 unlocked overclocking', podzespoly_id),
    ('Płyty główne', 'plyty-glowne', 'Płyty główne motherboard - Asus ROG MSI MAG Gigabyte Aorus Z790 X670E B650 socket AM5 LGA1700', podzespoly_id),
    ('Pamięć RAM', 'pamieci-ram', 'Pamięci RAM DDR5 DDR4 - Kingston Fury Corsair Vengeance G.Skill 16GB 32GB 64GB 6000MHz CL30', podzespoly_id),
    ('Dyski SSD', 'dyski-ssd', 'Dyski SSD M.2 NVMe - Samsung 990 Pro WD Black SN850X PCIe 4.0 Gen4 1TB 2TB 4TB szybkie', podzespoly_id),
    ('Dyski HDD', 'dyski-hdd', 'Dyski twarde HDD - Seagate Barracuda WD Blue 1TB 2TB 4TB 8TB 7200rpm SATA backup magazyn', podzespoly_id),
    ('Zasilacze', 'zasilacze-pc', 'Zasilacze PSU - Corsair Seasonic be quiet! 650W 750W 850W 1000W 80+ Gold Platinum modułowe', podzespoly_id),
    ('Obudowy PC', 'obudowy-pc', 'Obudowy komputerowe - NZXT H5 Lian Li O11 Fractal Torrent Mid Tower Full Tower airflow RGB', podzespoly_id),
    ('Chłodzenie PC', 'chlodzenie-pc', 'Chłodzenie procesora - AIO 240mm 360mm be quiet! Dark Rock Noctua NH-D15 Arctic Liquid Freezer', podzespoly_id),
    ('Wentylatory PC', 'wentylatory-pc', 'Wentylatory case - Arctic P12 P14 Noctua NF-A12 be quiet! Pure Wings 120mm 140mm RGB PWM', podzespoly_id),
    ('Pozostałe podzespoły', 'pozostale-podzespoly', 'Inne komponenty - karty sieciowe WiFi dźwiękowe napędy DVD kontrolery RGB pasta termiczna', podzespoly_id);

  RAISE NOTICE 'Pomyślnie dodano kategorie podzespołów komputerowych';
END $$;
