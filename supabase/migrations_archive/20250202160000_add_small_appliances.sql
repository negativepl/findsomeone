-- Add small appliances subcategories to Elektronika > AGD małe

DO $$
DECLARE
  agd_male_id uuid;
BEGIN
  -- Get the "AGD małe" subcategory ID
  SELECT id INTO agd_male_id
  FROM categories
  WHERE slug = 'agd-male'
  LIMIT 1;

  IF agd_male_id IS NULL THEN
    RAISE EXCEPTION 'Podkategoria "AGD małe" nie została znaleziona.';
  END IF;

  -- Insert small appliances subcategories
  INSERT INTO categories (name, slug, description, parent_id) VALUES
    ('Ekspresy do kawy', 'ekspresy-do-kawy', 'Ekspresy ciśnieniowe - DeLonghi Magnifica kapsułkowe Nespresso Dolce Gusto automatyczne do ziaren 15 bar', agd_male_id),
    ('Czajniki elektryczne', 'czajniki-elektryczne', 'Czajniki bezprzewodowe - 1.7L stalowe szklane Bosch TWK Philips HD Tefal KI regulacja temperatury', agd_male_id),
    ('Tostery', 'tostery', 'Tostery - na 2 4 kromki opiekacze do kanapek gofrownice kontaktowe Russell Hobbs Philips', agd_male_id),
    ('Roboty kuchenne', 'roboty-kuchenne', 'Roboty kuchenne planetarne - Bosch MUM KitchenAid Artisan Kenwood kMix miksery malaksery 1000W', agd_male_id),
    ('Blendery', 'blendery', 'Blendery - kielichowe Philips 1400W ręczne Braun Multiquick mixery do zup smoothie koktajli', agd_male_id),
    ('Sokowirówki', 'sokowirówki', 'Wyciskarki do soków - wolnoobrotowe slow juicer Hurom Kuvings odśrodkowe owoce warzywa 400W', agd_male_id),
    ('Mikrofale', 'mikrofale', 'Kuchenki mikrofalowe - Samsung LG Whirlpool 20-30L 800-1000W z grillem z termoobiegiem inverter', agd_male_id),
    ('Multicookery', 'multicookery', 'Multicookery - garnki elektryczne Instant Pot multicooker Tefal CookExpert ciśnieniowe slow cooker', agd_male_id),
    ('Frytkownice', 'frytkownice', 'Frytkownice beztłuszczowe - air fryer Philips Cosori Ninja 5L 7L hot air rapid crispy smażenie', agd_male_id),
    ('Odkurzacze', 'odkurzacze', 'Odkurzacze - workowe bezworkowe Samsung Philips robotyczne Roborock Xiaomi pionowe Dyson V15', agd_male_id),
    ('Żelazka i parownice', 'zelazka-parownice', 'Żelazka parowe - Philips Azur Tefal Ultraglide 3000W stacje parowe parownice ręczne do ubrań', agd_male_id),
    ('Pozostałe AGD małe', 'pozostale-agd-male', 'Inne AGD - maszyny do szycia lokówki suszarki maszynki do golenia depilatory wafelnice suszarki owoców', agd_male_id);

  RAISE NOTICE 'Pomyślnie dodano kategorie AGD małego';
END $$;
