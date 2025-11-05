-- Reorganize console subcategories into hierarchical structure:
-- PlayStation -> PS5 Pro, PS5, PS4 Pro, PS4, PS3, PS2, PS1, PS Portal
-- Xbox -> Series X/S, One, 360, Original
-- Nintendo -> Switch 2, Switch, Wii U, Wii, GameCube, N64
-- PC Games
-- Other -> Retro consoles, Accessories

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

  -- Check if we found the category
  IF konsole_id IS NULL THEN
    RAISE EXCEPTION 'Kategoria "Konsole i gry" nie została znaleziona.';
  END IF;

  -- Delete old flat subcategories (they will be recreated in hierarchical structure)
  DELETE FROM categories WHERE parent_id = konsole_id;

  -- Create main platform categories
  INSERT INTO categories (name, slug, description, parent_id) VALUES
    ('PlayStation', 'playstation', 'Konsole PlayStation - PS5, PS4 i starsze generacje Sony', konsole_id),
    ('Xbox', 'xbox', 'Konsole Xbox - Series X/S, One i starsze generacje Microsoft', konsole_id),
    ('Nintendo', 'nintendo', 'Konsole Nintendo - Switch, Wii, GameCube i retro', konsole_id),
    ('Gry PC', 'gry-pc', 'Gry komputerowe PC Steam, Epic Games, GOG pudełkowe i klucze cyfrowe', konsole_id),
    ('Pozostałe konsole', 'pozostale-konsole', 'Retro konsole, akcesoria i inne platformy', konsole_id);

  -- Get IDs for the newly created platform categories
  SELECT id INTO playstation_id FROM categories WHERE slug = 'playstation' LIMIT 1;
  SELECT id INTO xbox_id FROM categories WHERE slug = 'xbox' LIMIT 1;
  SELECT id INTO nintendo_id FROM categories WHERE slug = 'nintendo' LIMIT 1;
  SELECT id INTO pozostale_id FROM categories WHERE slug = 'pozostale-konsole' LIMIT 1;

  -- PlayStation subcategories (newest to oldest)
  INSERT INTO categories (name, slug, description, parent_id) VALUES
    ('PlayStation 5 Pro', 'playstation-5-pro', 'Konsola Sony PS5 Pro z ulepszoną grafiką i wydajnością, gry PS5 Pro Enhanced', playstation_id),
    ('PlayStation 5', 'playstation-5', 'Konsola Sony PS5 Standard i Digital Edition, gry PlayStation 5 na płytach i digital', playstation_id),
    ('PlayStation 4 Pro', 'playstation-4-pro', 'Konsola PS4 Pro 4K HDR, gry PlayStation 4 w wyższej rozdzielczości', playstation_id),
    ('PlayStation 4', 'playstation-4', 'Konsola PS4 Slim i standardowa, gry na PlayStation 4 ekskluzywne i multiplatform', playstation_id),
    ('PlayStation Portal', 'playstation-portal', 'PlayStation Portal urządzenie do zdalnego grania Remote Play na PS5', playstation_id),
    ('PlayStation 3', 'playstation-3', 'Konsola PS3 Slim Super Slim, gry PlayStation 3 retro klasyki Sony', playstation_id),
    ('PlayStation 2', 'playstation-2', 'Konsola PS2 Slim Fat kolekcjonerska, gry PlayStation 2 klasyczne tytuły', playstation_id),
    ('PlayStation 1', 'playstation-1', 'Konsola PS1 PSX oryginalna, gry PlayStation 1 kultowe retro', playstation_id);

  -- Xbox subcategories (newest to oldest)
  INSERT INTO categories (name, slug, description, parent_id) VALUES
    ('Xbox Series X/S', 'xbox-series', 'Konsole Microsoft Xbox Series X i Series S Game Pass, gry next-gen', xbox_id),
    ('Xbox One', 'xbox-one', 'Konsola Xbox One X, S i standardowa, gry Xbox One wsteczna kompatybilność', xbox_id),
    ('Xbox 360', 'xbox-360', 'Konsola Xbox 360 Slim Arcade retro, gry Xbox 360 klasyczne tytuły Microsoft', xbox_id),
    ('Xbox Original', 'xbox-original', 'Konsola Xbox oryginalna pierwsza generacja kolekcjonerska, gry Xbox klasyczne', xbox_id);

  -- Nintendo subcategories (newest to oldest)
  INSERT INTO categories (name, slug, description, parent_id) VALUES
    ('Nintendo Switch 2', 'nintendo-switch-2', 'Nowa konsola Nintendo Switch 2 następna generacja przenośnej konsoli', nintendo_id),
    ('Nintendo Switch', 'nintendo-switch', 'Konsola Nintendo Switch OLED, Lite, Standard, gry Mario, Zelda, Pokemon ekskluzywne', nintendo_id),
    ('Wii U', 'wii-u', 'Konsola Nintendo Wii U z GamePad retro, gry Wii U klasyki Nintendo', nintendo_id),
    ('Wii', 'wii', 'Konsola Nintendo Wii z kontrolerami Motion retro, gry Wii rodzinne i sportowe', nintendo_id),
    ('GameCube', 'gamecube', 'Konsola Nintendo GameCube kolekcjonerska retro, gry GameCube klasyczne tytuły', nintendo_id),
    ('N64 i starsze', 'nintendo-retro', 'Nintendo 64, SNES, NES i inne klasyczne retro konsole Nintendo', nintendo_id);

  -- Pozostałe konsole subcategories
  INSERT INTO categories (name, slug, description, parent_id) VALUES
    ('Retro konsole', 'retro-konsole', 'Stare konsole kolekcjonerskie: Sega, Atari, inne platformy retro', pozostale_id),
    ('Akcesoria do konsol', 'akcesoria-konsol', 'Pady DualSense, kierownice Logitech, zestawy VR PSVR2, słuchawki gamingowe', pozostale_id);

  RAISE NOTICE 'Pomyślnie zreorganizowano strukturę kategorii konsol i gier';
END $$;
