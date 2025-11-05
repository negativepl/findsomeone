-- Add audio subcategories to Elektronika > Sprzęt audio

DO $$
DECLARE
  audio_id uuid;
BEGIN
  -- Get the "Sprzęt audio" subcategory ID
  SELECT id INTO audio_id
  FROM categories
  WHERE slug = 'audio'
  LIMIT 1;

  IF audio_id IS NULL THEN
    RAISE EXCEPTION 'Podkategoria "Sprzęt audio" nie została znaleziona.';
  END IF;

  -- Insert audio subcategories
  INSERT INTO categories (name, slug, description, parent_id) VALUES
    ('Słuchawki bezprzewodowe', 'sluchawki-bezprzewodowe', 'Słuchawki Bluetooth - AirPods Pro Max Sony WH-1000XM5 nauszne douszne TWS ANC redukcja hałasu', audio_id),
    ('Słuchawki przewodowe', 'sluchawki-przewodowe', 'Słuchawki z kablem - jack 3.5mm USB-C studyjne IEM douszne audiophile HiFi Sennheiser Beyerdynamic', audio_id),
    ('Słuchawki gamingowe', 'sluchawki-gamingowe', 'Słuchawki do gier - mikrofon dźwięk przestrzenny 7.1 SteelSeries HyperX Razer Logitech RGB', audio_id),
    ('Głośniki Bluetooth', 'glosniki-bluetooth', 'Przenośne głośniki bezprzewodowe - JBL Charge Flip Sony SRS Marshall Kilburn wodoodporne IP67', audio_id),
    ('Soundbary', 'soundbary', 'Soundbary do TV - Samsung HW LG Ecotrics Sony HT subwoofer Dolby Atmos DTS:X kino domowe', audio_id),
    ('Zestawy HiFi', 'zestawy-hifi', 'Wieże stereo - zestawy 2.1 gramofony winylowe vintage Yamaha Denon wzmacniacze audiophile', audio_id),
    ('Kolumny aktywne', 'kolumny-aktywne', 'Głośniki aktywne - JBL Partybox Behringer Eurolive do DJ eventów imprez koncertów nagłośnienie', audio_id),
    ('Wzmacniacze audio', 'wzmacniacze-audio', 'Wzmacniacze - amplitunery Yamaha Denon Marantz Pioneer lampowe tranzystorowe AV receiver', audio_id),
    ('Mikrofony', 'mikrofony', 'Mikrofony - USB pojemnościowe dynamiczne Rode NT1 Shure SM7B Blue Yeti streaming podcast studio', audio_id),
    ('Interfejsy audio', 'interfejsy-audio', 'Karty dźwiękowe - Focusrite Scarlett PreSonus AudioBox Behringer UMC DAC USB-C produkcja muzyki', audio_id),
    ('Pozostały sprzęt audio', 'pozostaly-sprzet-audio', 'Inne audio - odtwarzacze MP3 dyktafony adaptery Bluetooth przedwzmacniacze phono kable audio', audio_id);

  RAISE NOTICE 'Pomyślnie dodano kategorie sprzętu audio';
END $$;
