-- Add GSM accessories subcategories to Elektronika > Akcesoria GSM

DO $$
DECLARE
  akcesoria_gsm_id uuid;
BEGIN
  -- Get the "Akcesoria GSM" subcategory ID
  SELECT id INTO akcesoria_gsm_id
  FROM categories
  WHERE slug = 'akcesoria-gsm'
  LIMIT 1;

  IF akcesoria_gsm_id IS NULL THEN
    RAISE EXCEPTION 'Podkategoria "Akcesoria GSM" nie została znaleziona.';
  END IF;

  -- Insert GSM accessories subcategories
  INSERT INTO categories (name, slug, description, parent_id) VALUES
    ('Etui i pokrowce', 'etui-pokrowce', 'Etui ochronne - case silikonowe skórzane book wallet Clear View z klapką na telefon magnetyczne', akcesoria_gsm_id),
    ('Szkła ochronne', 'szkla-ochronne', 'Szkła hartowane - 9H full glue 3D curved edge protection na ekran kamery prywatność privacy', akcesoria_gsm_id),
    ('Ładowarki sieciowe', 'ladowarki-sieciowe', 'Ładowarki USB-C - Power Delivery 20W 30W 65W Quick Charge GaN Anker Baseus szybkie ładowanie', akcesoria_gsm_id),
    ('Ładowarki samochodowe', 'ladowarki-samochodowe', 'Ładowarki do auta - USB-C USB-A 12V 24V dual port Quick Charge Power Delivery 30W cig lighter', akcesoria_gsm_id),
    ('Powerbanki', 'powerbanki', 'Powerbanki - 10000mAh 20000mAh Power Delivery USB-C Quick Charge MagSafe Anker przenośne baterie', akcesoria_gsm_id),
    ('Kable USB', 'kable-usb', 'Kable do ładowania - USB-C Lightning micro USB 1m 2m 3m nylon szybkie ładowanie data sync', akcesoria_gsm_id),
    ('Ładowarki bezprzewodowe', 'ladowarki-bezprzewodowe', 'Ładowarki indukcyjne - Qi wireless 15W MagSafe 3w1 stojak pad dla iPhone Samsung AirPods Watch', akcesoria_gsm_id),
    ('Uchwyty samochodowe', 'uchwyty-samochodowe', 'Uchwyty do auta - na kratkę wentylacji szybę kokpit magnetyczne MagSafe wireless charging grawitacyjne', akcesoria_gsm_id),
    ('Karty pamięci', 'karty-pamieci', 'Karty microSD - 64GB 128GB 256GB 512GB 1TB UHS-I U3 V30 A2 SanDisk Samsung Evo Plus', akcesoria_gsm_id),
    ('Smartwatche', 'smartwatche', 'Smartwatche - Apple Watch Ultra Samsung Galaxy Watch Huawei Watch Garmin pulsometry GPS fitness', akcesoria_gsm_id),
    ('Opaski sportowe', 'opaski-sportowe', 'Opaski fitness - Xiaomi Mi Band Fitbit pulsometr krokomierz monitoring snu powiadomienia wodoodporne', akcesoria_gsm_id),
    ('Pozostałe akcesoria GSM', 'pozostale-akcesoria-gsm', 'Inne akcesoria - selfie stick statyw gimbal pierścień LED ringi PopSocket finger grip cleaning kit', akcesoria_gsm_id);

  RAISE NOTICE 'Pomyślnie dodano kategorie akcesoriów GSM';
END $$;
