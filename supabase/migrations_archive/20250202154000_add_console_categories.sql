-- Add console platform categories to Elektronika > Konsole i gry
-- Structure: PlayStation, Xbox, Nintendo, PC Games, Pozostałe

DO $$
DECLARE
  konsole_id uuid;
  playstation_id uuid;
  xbox_id uuid;
  nintendo_id uuid;
  pozostale_id uuid;
BEGIN
  -- Get the "Konsole i gry" parent category ID
  SELECT id INTO konsole_id
  FROM categories
  WHERE slug = 'konsole-i-gry'
  LIMIT 1;

  IF konsole_id IS NULL THEN
    RAISE EXCEPTION 'Kategoria "Konsole i gry" nie została znaleziona.';
  END IF;

  -- Create main platform categories
  INSERT INTO categories (name, slug, description, parent_id) VALUES
    ('PlayStation', 'playstation', 'Konsole PlayStation Sony - PS5 Pro PS5 PS4 Pro PS4 PlayStation Portal i starsze generacje', konsole_id),
    ('Xbox', 'xbox', 'Konsole Xbox Microsoft - Series X/S Xbox One 360 i starsze generacje', konsole_id),
    ('Nintendo', 'nintendo', 'Konsole Nintendo - Switch 2 Switch OLED Wii GameCube retro klasyki', konsole_id),
    ('Gry PC', 'gry-pc', 'Gry komputerowe na PC - klucze Steam Epic Games GOG płyty pudełkowe digital download', konsole_id),
    ('Pozostałe konsole', 'pozostale-konsole', 'Inne konsole - Sega Atari retro klasyczne akcesoria gamingowe VR', konsole_id);

  -- Get IDs for the newly created platform categories
  SELECT id INTO playstation_id FROM categories WHERE slug = 'playstation' LIMIT 1;
  SELECT id INTO xbox_id FROM categories WHERE slug = 'xbox' LIMIT 1;
  SELECT id INTO nintendo_id FROM categories WHERE slug = 'nintendo' LIMIT 1;
  SELECT id INTO pozostale_id FROM categories WHERE slug = 'pozostale-konsole' LIMIT 1;

  -- PlayStation subcategories (newest to oldest)
  INSERT INTO categories (name, slug, description, parent_id) VALUES
    ('PlayStation 5 Pro', 'playstation-5-pro', 'Konsola Sony PS5 Pro z ulepszoną GPU 4K 60fps ray tracing gry PS5 Pro Enhanced wersja cyfrowa', playstation_id),
    ('PlayStation 5', 'playstation-5', 'Konsola Sony PS5 Standard z napędem i Digital Edition gry PlayStation 5 na płytach Blu-ray i digital', playstation_id),
    ('PlayStation 4 Pro', 'playstation-4-pro', 'Konsola PS4 Pro 4K HDR 1TB checkerboard rendering gry PlayStation 4 w wyższej jakości grafiki', playstation_id),
    ('PlayStation 4', 'playstation-4', 'Konsola PS4 Slim 500GB 1TB gry na PlayStation 4 ekskluzywne The Last of Us God of War', playstation_id),
    ('PlayStation Portal', 'playstation-portal', 'PlayStation Portal urządzenie do zdalnego grania Remote Play streaming gier z PS5 przez WiFi', playstation_id),
    ('PlayStation 3', 'playstation-3', 'Konsola PS3 Slim Super Slim retro gry PlayStation 3 backward compatibility klasyki Uncharted', playstation_id),
    ('PlayStation 2', 'playstation-2', 'Konsola PS2 Slim Fat kolekcjonerska gry PlayStation 2 kultowe klasyczne Grand Theft Auto retro', playstation_id),
    ('PlayStation 1', 'playstation-1', 'Konsola PS1 PSX oryginalna pierwsza PlayStation gry PS1 kultowe retro Crash Bandicoot Spyro', playstation_id),
    ('Pozostałe PlayStation', 'pozostale-playstation', 'Akcesoria PlayStation - pady DualSense DualShock PSVR2 gogle VR kamery ładowarki stacje', playstation_id);

  -- Xbox subcategories (newest to oldest)
  INSERT INTO categories (name, slug, description, parent_id) VALUES
    ('Xbox Series X/S', 'xbox-series', 'Konsole Microsoft Xbox Series X 4K 120fps i Series S 1440p Game Pass Ultimate gry next-gen', xbox_id),
    ('Xbox One', 'xbox-one', 'Konsola Xbox One X enhanced 4K S standardowa gry Xbox One wsteczna kompatybilność Halo Forza', xbox_id),
    ('Xbox 360', 'xbox-360', 'Konsola Xbox 360 Slim Arcade Elite retro gry Xbox 360 klasyczne Kinect sensory ruchu', xbox_id),
    ('Xbox Original', 'xbox-original', 'Konsola Xbox oryginalna pierwsza generacja kolekcjonerska gry Xbox klasyczne Halo Combat Evolved', xbox_id),
    ('Pozostałe Xbox', 'pozostale-xbox', 'Akcesoria Xbox - pady Elite kontrolery kierownice zestawy słuchawkowe baterie ładowarki', xbox_id);

  -- Nintendo subcategories (newest to oldest)
  INSERT INTO categories (name, slug, description, parent_id) VALUES
    ('Nintendo Switch 2', 'nintendo-switch-2', 'Nowa konsola Nintendo Switch 2 następna generacja przenośnej konsoli hybrydowej wsteczna kompatybilność', nintendo_id),
    ('Nintendo Switch', 'nintendo-switch', 'Konsola Nintendo Switch OLED 7 cali Lite kompaktowa standardowa gry Mario Zelda Pokemon Animal Crossing', nintendo_id),
    ('Wii U', 'wii-u', 'Konsola Nintendo Wii U z GamePad touchscreen retro gry Wii U ekskluzywne klasyki Mario Kart', nintendo_id),
    ('Wii', 'wii', 'Konsola Nintendo Wii z kontrolerami Motion Plus Wiimote retro gry rodzinne sportowe Mario Party', nintendo_id),
    ('GameCube', 'gamecube', 'Konsola Nintendo GameCube GCN kolekcjonerska retro gry GameCube Super Smash Bros Melee Metroid Prime', nintendo_id),
    ('N64 i starsze', 'nintendo-retro', 'Nintendo 64 N64 SNES Super Nintendo NES Game Boy retro klasyczne kultowe konsole kolekcjonerskie', nintendo_id),
    ('Pozostałe Nintendo', 'pozostale-nintendo', 'Akcesoria Nintendo - Joy-Con Pro Controller etui karty SD powerbank ładowarki stacje dokujące', nintendo_id);

  -- Pozostałe konsole subcategories
  INSERT INTO categories (name, slug, description, parent_id) VALUES
    ('Sega', 'sega-konsole', 'Konsole Sega retro - Mega Drive Genesis Dreamcast Saturn Master System klasyczne kolekcjonerskie Sonic', pozostale_id),
    ('Atari', 'atari-konsole', 'Konsole Atari retro kolekcjonerskie - 2600 VCS Jaguar Lynx klasyczne vintage arcade', pozostale_id),
    ('Steam Deck', 'steam-deck', 'Konsola przenośna Valve Steam Deck OLED handheld PC gry Steam library mobilne granie', pozostale_id),
    ('VR i AR', 'vr-ar-konsole', 'Gogle VR i AR - Meta Quest 3 PSVR2 HTC Vive PlayStation VR wirtualna rzeczywistość gaming', pozostale_id),
    ('Akcesoria gamingowe', 'akcesoria-gamingowe', 'Akcesoria do gier - kierownice Logitech Thrustmaster joysticki HOTAS pedały symulatory fotele', pozostale_id),
    ('Inne konsole', 'inne-konsole-retro', 'Pozostałe konsole retro i współczesne - Neo Geo 3DO Ouya rzadkie kolekcjonerskie unikatowe', pozostale_id);

  RAISE NOTICE 'Pomyślnie dodano strukturę kategorii konsol i gier';
END $$;
