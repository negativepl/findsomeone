-- Add large appliances subcategories to Elektronika > AGD duże

DO $$
DECLARE
  agd_duze_id uuid;
BEGIN
  -- Get the "AGD duże" subcategory ID
  SELECT id INTO agd_duze_id
  FROM categories
  WHERE slug = 'agd-duze'
  LIMIT 1;

  IF agd_duze_id IS NULL THEN
    RAISE EXCEPTION 'Podkategoria "AGD duże" nie została znaleziona.';
  END IF;

  -- Insert large appliances subcategories
  INSERT INTO categories (name, slug, description, parent_id) VALUES
    ('Lodówki', 'lodowki', 'Lodówki wolnostojące - Samsung LG Bosch dwudrzwiowe side-by-side French Door No Frost 350-600L A+++', agd_duze_id),
    ('Lodówki do zabudowy', 'lodowki-zabudowy', 'Lodówki zabudowywane - Bosch Electrolux Amica wbudowane single door combinowane pod blat 180cm', agd_duze_id),
    ('Zamrażarki', 'zamrazarki', 'Zamrażarki szufladowe - pionowe No Frost i zamrażarki skrzyniowe poziome 150-300L klasa A++', agd_duze_id),
    ('Pralki', 'pralki', 'Pralki automatyczne - Samsung AddWash LG AI DD Bosch 7-10kg ładowane od przodu 1400 obr/min A+++', agd_duze_id),
    ('Pralko-suszarki', 'pralko-suszarki', 'Pralko-suszarki - LG Samsung Bosch combo 2w1 pranie 8kg suszenie 5kg kondensacyjne pompa ciepła', agd_duze_id),
    ('Suszarki do ubrań', 'suszarki-do-ubran', 'Suszarki bębnowe - Bosch Electrolux kondensacyjne z pompą ciepła 8-9kg energooszczędne A+++', agd_duze_id),
    ('Zmywarki wolnostojące', 'zmywarki-wolnostojace', 'Zmywarki 60cm - Bosch Electrolux wolnostojące 13-14 kompletów A++ AquaStop TimeLight', agd_duze_id),
    ('Zmywarki do zabudowy', 'zmywarki-zabudowy', 'Zmywarki zabudowywane - 60cm pełnowymiarowe i 45cm wąskie całkowicie zabudowane panel otwarty', agd_duze_id),
    ('Kuchenki gazowe', 'kuchenki-gazowe', 'Kuchenki gazowe - 50-60cm 4 palniki wok gazowo-elektryczne z piekarnikiem elektrycznym termoobieg', agd_duze_id),
    ('Kuchenki elektryczne', 'kuchenki-elektryczne', 'Kuchenki elektryczne - ceramiczne indukcyjne z piekarnikiem termoobieg grill opiekanie A++', agd_duze_id),
    ('Piekarniki zabudowy', 'piekarniki-zabudowy', 'Piekarniki elektryczne - Bosch Electrolux do zabudowy termoobieg piroliza telepanel dotykowy A++', agd_duze_id),
    ('Płyty grzewcze', 'plyty-grzewcze', 'Płyty do zabudowy - indukcyjne 4 pola booster ceramiczne gazowe 60cm slider touch control', agd_duze_id),
    ('Okapy kuchenne', 'okapy-kuchenne', 'Okapy - naścienne 60-90cm pochylone teleskopowe podszafkowe do zabudowy 600-800 m3/h inox czarne', agd_duze_id),
    ('Pozostałe AGD duże', 'pozostale-agd-duze', 'Inne AGD duże - klimatyzatory osuszacze powietrza podgrzewacze wody bojlery piece konwekcyjne', agd_duze_id);

  RAISE NOTICE 'Pomyślnie dodano kategorie AGD dużego';
END $$;
