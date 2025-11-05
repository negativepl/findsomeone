-- Add subcategories for Electronics category (excluding Phones which already have brands)
-- This creates third level for: Tablety, Laptopy, Komputery, Audio, Foto, Konsole i gry, AGD

DO $$
DECLARE
  tablety_id uuid;
  laptopy_id uuid;
  komputery_id uuid;
  audio_id uuid;
  foto_id uuid;
  konsole_id uuid;
  agd_male_id uuid;
  agd_duze_id uuid;
  telewizory_id uuid;
  akcesoria_komp_id uuid;
BEGIN
  -- Get subcategory IDs
  SELECT id INTO tablety_id FROM categories WHERE slug = 'tablety' LIMIT 1;
  SELECT id INTO laptopy_id FROM categories WHERE slug = 'laptopy' LIMIT 1;
  SELECT id INTO komputery_id FROM categories WHERE slug = 'komputery' LIMIT 1;
  SELECT id INTO audio_id FROM categories WHERE slug = 'audio' LIMIT 1;
  SELECT id INTO foto_id FROM categories WHERE slug = 'foto' LIMIT 1;
  SELECT id INTO konsole_id FROM categories WHERE slug = 'konsole-i-gry' LIMIT 1;
  SELECT id INTO agd_male_id FROM categories WHERE slug = 'agd-male' LIMIT 1;
  SELECT id INTO agd_duze_id FROM categories WHERE slug = 'agd-duze' LIMIT 1;
  SELECT id INTO telewizory_id FROM categories WHERE slug = 'telewizory' LIMIT 1;
  SELECT id INTO akcesoria_komp_id FROM categories WHERE slug = 'akcesoria-komputerowe' LIMIT 1;

  -- Tablety - brands
  IF tablety_id IS NOT NULL THEN
    INSERT INTO categories (name, slug, description, parent_id) VALUES
      ('Apple iPad', 'apple-ipad', 'Tablety iPad Pro, iPad Air, iPad Mini - iPady wszystkich generacji', tablety_id),
      ('Samsung Galaxy Tab', 'samsung-galaxy-tab', 'Tablety Samsung Galaxy Tab A, S, Active z Androidem', tablety_id),
      ('Tablety Lenovo', 'lenovo-tablety', 'Tablety Lenovo Tab, Yoga Tab - tablety z systemem Android', tablety_id),
      ('Tablety Huawei', 'huawei-tablety', 'Tablety Huawei MatePad, MediaPad - urządzenia mobilne', tablety_id),
      ('Tablety Xiaomi', 'xiaomi-tablety', 'Tablety Xiaomi Pad, Redmi Pad - tablety MIUI', tablety_id),
      ('Amazon Kindle', 'amazon-kindle', 'Czytniki e-booków Kindle Paperwhite, Oasis - czytniki książek', tablety_id),
      ('Inne tablety', 'inne-tablety', 'Pozostałe marki tabletów - Microsoft Surface Go, Onyx i inne', tablety_id);
  END IF;

  -- Laptopy - brands
  IF laptopy_id IS NOT NULL THEN
    INSERT INTO categories (name, slug, description, parent_id) VALUES
      ('Apple MacBook', 'apple-macbook', 'Laptopy MacBook Air i MacBook Pro z procesorami M1, M2, M3', laptopy_id),
      ('Laptopy Dell', 'dell-laptopy', 'Laptopy Dell XPS ultrabooki, Inspiron do domu, Latitude biznesowe', laptopy_id),
      ('Laptopy HP', 'hp-laptopy', 'Laptopy HP Pavilion, EliteBook biznesowe, Omen gamingowe', laptopy_id),
      ('Laptopy Lenovo', 'lenovo-laptopy', 'Laptopy Lenovo ThinkPad biznesowe, IdeaPad, Legion gamingowe', laptopy_id),
      ('Laptopy Asus', 'asus-laptopy', 'Laptopy Asus VivoBook, ZenBook ultraboki, ROG gamingowe', laptopy_id),
      ('Laptopy Acer', 'acer-laptopy', 'Laptopy Acer Aspire uniwersalne, Swift ultrabooki, Predator do gier', laptopy_id),
      ('Laptopy MSI', 'msi-laptopy', 'Laptopy gamingowe MSI z mocnymi kartami graficznymi NVIDIA', laptopy_id),
      ('Microsoft Surface', 'microsoft-surface', 'Laptopy Microsoft Surface Laptop, Surface Book z Windows', laptopy_id),
      ('Laptopy Huawei', 'huawei-laptopy', 'Laptopy Huawei MateBook lekkie i przenośne ultrabooki', laptopy_id),
      ('Inne laptopy', 'inne-laptopy', 'Pozostałe marki - Toshiba, Fujitsu, Samsung i inne notebooki', laptopy_id);
  END IF;

  -- Komputery - types
  IF komputery_id IS NOT NULL THEN
    INSERT INTO categories (name, slug, description, parent_id) VALUES
      ('Komputery do gier', 'komputery-do-gier', 'PC gamingowe z mocnymi kartami RTX/RX do AAA gier', komputery_id),
      ('Komputery do pracy', 'komputery-do-pracy', 'PC biurowe do pracy biurowej, internetu i multimediów', komputery_id),
      ('Stacje robocze', 'stacje-robocze', 'Workstation do grafiki 3D, edycji wideo, CAD, renderingu', komputery_id),
      ('Mini PC', 'mini-pc', 'Kompaktowe komputery małych rozmiarów - Intel NUC, Mac Mini', komputery_id),
      ('All-in-One', 'all-in-one', 'Komputery AIO zintegrowane z monitorem - iMac, HP, Dell', komputery_id);
  END IF;

  -- Audio - categories
  IF audio_id IS NOT NULL THEN
    INSERT INTO categories (name, slug, description, parent_id) VALUES
      ('Słuchawki bezprzewodowe', 'sluchawki-bezprzewodowe', 'Słuchawki Bluetooth nauszne, TWS douszne AirPods, Galaxy Buds, ANC', audio_id),
      ('Słuchawki przewodowe', 'sluchawki-przewodowe', 'Słuchawki z kablem jack 3.5mm, USB-C, douszne IEM i nauszne studyjne', audio_id),
      ('Głośniki Bluetooth', 'glosniki-bluetooth', 'Przenośne głośniki bezprzewodowe JBL, Sony, Marshall wodoodporne', audio_id),
      ('Soundbary', 'soundbary', 'Soundbary do telewizora Samsung, LG, Sony z subwooferem Dolby Atmos', audio_id),
      ('Zestawy HiFi', 'zestawy-hifi', 'Wieże muzyczne, zestawy stereo 2.1, gramofony winylowe vintage i nowoczesne', audio_id),
      ('Kolumny aktywne', 'kolumny-aktywne', 'Kolumny aktywne JBL, Behringer do muzyki na żywo, DJ, eventy i imprezy', audio_id),
      ('Wzmacniacze', 'wzmacniacze', 'Wzmacniacze audio Hi-Fi, amplitunery Yamaha, Denon, Marantz do kina domowego', audio_id);
  END IF;

  -- Foto - brands and types
  IF foto_id IS NOT NULL THEN
    INSERT INTO categories (name, slug, description, parent_id) VALUES
      ('Aparaty Canon', 'canon-foto', 'Aparaty Canon EOS R5, R6, 5D, 90D lustrzanki i bezlusterkowce Full Frame', foto_id),
      ('Aparaty Nikon', 'nikon-foto', 'Aparaty Nikon Z9, Z6, D850 DSLR lustrzanki i bezlusterkowce mirrorless', foto_id),
      ('Aparaty Sony', 'sony-foto', 'Aparaty Sony Alpha A7, A6000, kamery wideo FX3 pełnoklatkowe i APS-C', foto_id),
      ('Aparaty Fujifilm', 'fujifilm-foto', 'Aparaty Fujifilm X-T5, X-S20, X100V retro film simulation APS-C', foto_id),
      ('Aparaty Panasonic', 'panasonic-foto', 'Aparaty i kamery Panasonic Lumix GH6, S5 Micro Four Thirds i Full Frame', foto_id),
      ('Kamery GoPro', 'gopro', 'Kamery sportowe GoPro Hero 12, 11, Max action cam 4K wodoodporne', foto_id),
      ('Kamery DJI', 'dji-foto', 'Kamery DJI Osmo, gimbale Ronin stabilizatory do wideo i filmowania', foto_id),
      ('Obiektywy', 'obiektywy', 'Obiektywy fotograficzne Canon RF, Nikon Z, Sony E stałoogniskowe i zoom', foto_id),
      ('Akcesoria foto', 'akcesoria-foto', 'Statywy Manfrotto, lampy studyjne, torby fotograficzne, filtry UV ND', foto_id);
  END IF;

  -- Konsole i gry - platforms
  IF konsole_id IS NOT NULL THEN
    INSERT INTO categories (name, slug, description, parent_id) VALUES
      ('PlayStation 5', 'playstation-5', 'Konsola Sony PS5 Standard i Digital Edition, gry PlayStation 5 na płytach i digital', konsole_id),
      ('PlayStation 4', 'playstation-4', 'Konsola PS4 Slim i Pro, gry na PlayStation 4 ekskluzywne i multiplatform', konsole_id),
      ('Xbox Series X/S', 'xbox-series', 'Konsole Microsoft Xbox Series X i Series S Game Pass, gry next-gen', konsole_id),
      ('Xbox One', 'xbox-one', 'Konsola Xbox One S i X, gry Xbox One wsteczna kompatybilność', konsole_id),
      ('Nintendo Switch', 'nintendo-switch', 'Konsola Nintendo Switch OLED, Lite, gry Mario, Zelda, Pokemon ekskluzywne', konsole_id),
      ('Gry PC', 'gry-pc', 'Gry komputerowe PC Steam, Epic Games, GOG pudełkowe i klucze cyfrowe', konsole_id),
      ('Retro konsole', 'retro-konsole', 'Stare konsole kolekcjonerskie: PlayStation 3, PS2, PS1, Xbox 360, Wii, GameCube', konsole_id),
      ('Akcesoria do konsol', 'akcesoria-konsol', 'Pady DualSense, kierownice Logitech, zestawy VR PSVR2, słuchawki gamingowe', konsole_id);
  END IF;

  -- AGD małe - types
  IF agd_male_id IS NOT NULL THEN
    INSERT INTO categories (name, slug, description, parent_id) VALUES
      ('Ekspresy do kawy', 'ekspresy-do-kawy', 'Ekspresy ciśnieniowe DeLonghi, kapsułkowe Nespresso Dolce Gusto, automatyczne', agd_male_id),
      ('Czajniki elektryczne', 'czajniki-elektryczne', 'Czajniki bezprzewodowe elektryczne 1.7L Bosch, Philips, Tefal ze stali', agd_male_id),
      ('Tostery', 'tostery', 'Tostery na tosty 2 i 4 kromki, opiekacze do kanapek gofrownice kontaktowe', agd_male_id),
      ('Roboty kuchenne', 'roboty-kuchenne', 'Roboty kuchenne planetarne Bosch, KitchenAid, Kenwood miksery malaksery', agd_male_id),
      ('Blendery', 'blendery', 'Blendery kielichowe Philips 1000W, blendery ręczne mixery do zup', agd_male_id),
      ('Sokowirówki', 'sokowirówki', 'Wyciskarki wolnoobrotowe do soków, sokowirówki odśrodkowe na owoce warzywa', agd_male_id),
      ('Mikrofale', 'mikrofale', 'Kuchenki mikrofalowe Samsung, LG, Whirlpool 20-30L z grillem i termoobiegiem', agd_male_id),
      ('Odkurzacze', 'odkurzacze', 'Odkurzacze workowe i bezworkowe, robotyczne Roomba Roborock, pionowe Dyson', agd_male_id);
  END IF;

  -- AGD duże - types
  IF agd_duze_id IS NOT NULL THEN
    INSERT INTO categories (name, slug, description, parent_id) VALUES
      ('Lodówki', 'lodowki', 'Lodówki wolnostojące Samsung, LG, Bosch dwudrzwiowe side-by-side i do zabudowy', agd_duze_id),
      ('Zamrażarki', 'zamrazarki', 'Zamrażarki szufladowe pionowe No Frost i zamrażarki skrzyniowe poziome', agd_duze_id),
      ('Pralki', 'pralki', 'Pralki automatyczne 7-9kg ładowane od przodu frontalne i od góry top 1400 obr', agd_duze_id),
      ('Suszarki do ubrań', 'suszarki-do-ubran', 'Suszarki bębnowe kondensacyjne z pompą ciepła Bosch, Electrolux energooszczędne', agd_duze_id),
      ('Zmywarki', 'zmywarki', 'Zmywarki 60cm wolnostojące i 45cm wąskie do zabudowy 12-14 kompletów Bosch', agd_duze_id),
      ('Kuchenki gazowe', 'kuchenki-gazowe', 'Kuchenki gazowe 50-60cm 4 palniki i gazowo-elektryczne z piekarnikiem elektrycznym', agd_duze_id),
      ('Kuchenki elektryczne', 'kuchenki-elektryczne', 'Kuchenki elektryczne ceramiczne i indukcyjne z piekarnikiem termoobieg grill', agd_duze_id),
      ('Piekarniki', 'piekarniki', 'Piekarniki elektryczne do zabudowy Bosch, Electrolux z termoobiegiem piroliza', agd_duze_id),
      ('Płyty grzewcze', 'plyty-grzewcze', 'Płyty indukcyjne 4 pola, płyty ceramiczne i gazowe do zabudowy 60cm', agd_duze_id),
      ('Okapy kuchenne', 'okapy-kuchenne', 'Okapy kuchenne naścienne 60-90cm pochylone i teleskopowe do zabudowy', agd_duze_id);
  END IF;

  -- Telewizory - brands and types
  IF telewizory_id IS NOT NULL THEN
    INSERT INTO categories (name, slug, description, parent_id) VALUES
      ('Samsung TV', 'samsung-tv', 'Telewizory Samsung QLED 4K 8K, Crystal UHD Smart TV 43-85 cali HDR', telewizory_id),
      ('LG TV', 'lg-tv', 'Telewizory LG OLED C3 G3, NanoCell 4K webOS Magic Remote 55-77 cali', telewizory_id),
      ('Sony TV', 'sony-tv', 'Telewizory Sony Bravia XR OLED LED Android TV Google TV 4K 120Hz', telewizory_id),
      ('Philips TV', 'philips-tv', 'Telewizory Philips Ambilight 4K Android TV podświetlenie ambientowe', telewizory_id),
      ('TCL TV', 'tcl-tv', 'Telewizory TCL QLED Mini LED 4K Android TV Google TV budżetowe', telewizory_id),
      ('Xiaomi TV', 'xiaomi-tv', 'Telewizory Xiaomi Mi TV Android TV 4K HDR10 Google Assistant tanio', telewizory_id),
      ('Projektory', 'projektory', 'Projektory do kina domowego 4K Full HD Epson BenQ krótkoogniskowe laserowe', telewizory_id);
  END IF;

  -- Akcesoria komputerowe - detailed types
  IF akcesoria_komp_id IS NOT NULL THEN
    INSERT INTO categories (name, slug, description, parent_id) VALUES
      ('Monitory', 'monitory', 'Monitory LCD LED IPS VA 24-32 cale Full HD 4K 144Hz gamingowe biurowe', akcesoria_komp_id),
      ('Klawiatury', 'klawiatury', 'Klawiatury mechaniczne Cherry MX RGB, membranowe bezprzewodowe gamingowe', akcesoria_komp_id),
      ('Myszki', 'myszki', 'Myszki komputerowe Logitech Razer optyczne laserowe gamingowe bezprzewodowe', akcesoria_komp_id),
      ('Drukarki', 'drukarki', 'Drukarki laserowe monochromatyczne kolorowe, atramentowe 3w1 Brother HP Canon', akcesoria_komp_id),
      ('Skanery', 'skanery', 'Skanery płaskie dokumentów A4, skanery fotograficzne slajdów negatywów', akcesoria_komp_id),
      ('Kamery internetowe', 'kamery-internetowe', 'Webcamy Logitech Full HD 1080p 4K do spotkań Zoom Teams z mikrofonem', akcesoria_komp_id),
      ('Podkładki pod mysz', 'podkladki-pod-mysz', 'Podkładki pod mysz gamingowe XXL RGB SteelSeries Razer i biurowe ergonomiczne', akcesoria_komp_id);
  END IF;

  RAISE NOTICE 'Pomyślnie dodano podkategorie dla Elektroniki';
END $$;
