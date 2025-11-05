-- Delete all existing categories (CASCADE will handle related records)
DELETE FROM categories;

-- Insert main categories with icons
INSERT INTO categories (name, slug, description, icon) VALUES
('Hydraulika', 'hydraulika', 'Naprawy i instalacje hydrauliczne', 'wrench'),
('Elektryka', 'elektryka', 'Instalacje i naprawy elektryczne', 'zap'),
('Sprzątanie', 'sprzatanie', 'Usługi sprzątające i porządkowe', 'sparkles'),
('Budowa i remont', 'budowa-i-remont', 'Prace budowlane i remontowe', 'hammer'),
('Ogrody', 'ogrody', 'Pielęgnacja ogrodów i terenów zielonych', 'leaf'),
('Transport', 'transport', 'Usługi transportowe i przeprowadzkowe', 'truck'),
('IT i komputery', 'it-i-komputery', 'Usługi informatyczne i naprawy sprzętu', 'laptop'),
('Nauka i korepetycje', 'nauka-i-korepetycje', 'Korepetycje i kursy edukacyjne', 'book-open'),
('Opieka', 'opieka', 'Opieka nad dziećmi, osobami starszymi', 'heart'),
('Inne', 'inne', 'Pozostałe usługi', 'help-circle');

-- Get IDs of parent categories for subcategories
DO $$
DECLARE
  hydraulika_id UUID;
  elektryka_id UUID;
  budowa_id UUID;
  ogrody_id UUID;
  transport_id UUID;
  it_id UUID;
  nauka_id UUID;
  opieka_id UUID;
BEGIN
  -- Get parent category IDs
  SELECT id INTO hydraulika_id FROM categories WHERE slug = 'hydraulika';
  SELECT id INTO elektryka_id FROM categories WHERE slug = 'elektryka';
  SELECT id INTO budowa_id FROM categories WHERE slug = 'budowa-i-remont';
  SELECT id INTO ogrody_id FROM categories WHERE slug = 'ogrody';
  SELECT id INTO transport_id FROM categories WHERE slug = 'transport';
  SELECT id INTO it_id FROM categories WHERE slug = 'it-i-komputery';
  SELECT id INTO nauka_id FROM categories WHERE slug = 'nauka-i-korepetycje';
  SELECT id INTO opieka_id FROM categories WHERE slug = 'opieka';

  -- Insert subcategories for Hydraulika
  INSERT INTO categories (name, slug, description, icon, parent_id) VALUES
    ('Instalacje wodne', 'instalacje-wodne', 'Montaż i naprawa instalacji wodnych', 'droplets', hydraulika_id),
    ('Kanalizacja', 'kanalizacja', 'Czyszczenie i naprawa kanalizacji', 'wind', hydraulika_id),
    ('Grzejnictwo', 'grzejnictwo', 'Instalacje grzewcze i piece', 'flame', hydraulika_id);

  -- Insert subcategories for Elektryka
  INSERT INTO categories (name, slug, description, icon, parent_id) VALUES
    ('Instalacje domowe', 'instalacje-domowe', 'Instalacje elektryczne w domu', 'home', elektryka_id),
    ('Oświetlenie', 'oswietlenie', 'Montaż i naprawa oświetlenia', 'lightbulb', elektryka_id),
    ('Domofony', 'domofony', 'Montaż i serwis domofonów', 'phone', elektryka_id);

  -- Insert subcategories for Budowa i remont
  INSERT INTO categories (name, slug, description, icon, parent_id) VALUES
    ('Malowanie', 'malowanie', 'Malowanie ścian i sufitów', 'paint-bucket', budowa_id),
    ('Glazura i terakota', 'glazura-i-terakota', 'Układanie płytek', 'grid-3x3', budowa_id),
    ('Murowanie', 'murowanie', 'Prace murarskie', 'brick-wall', budowa_id),
    ('Sufity podwieszane', 'sufity-podwieszane', 'Montaż sufitów podwieszanych', 'square-stack', budowa_id);

  -- Insert subcategories for Ogrody
  INSERT INTO categories (name, slug, description, icon, parent_id) VALUES
    ('Koszenie trawy', 'koszenie-trawy', 'Pielęgnacja trawników', 'scissors', ogrody_id),
    ('Przycinanie drzew', 'przycinanie-drzew', 'Cięcie i formowanie drzew', 'tree-pine', ogrody_id),
    ('Zakładanie ogrodów', 'zakladanie-ogrodow', 'Projektowanie i zakładanie ogrodów', 'flower-2', ogrody_id);

  -- Insert subcategories for Transport
  INSERT INTO categories (name, slug, description, icon, parent_id) VALUES
    ('Przeprowadzki', 'przeprowadzki', 'Usługi przeprowadzkowe', 'package', transport_id),
    ('Transport gabarytów', 'transport-gabaryty', 'Przewóz dużych przedmiotów', 'container', transport_id),
    ('Taxi bagażowe', 'taxi-bagazowe', 'Transport małych przesyłek', 'car', transport_id);

  -- Insert subcategories for IT
  INSERT INTO categories (name, slug, description, icon, parent_id) VALUES
    ('Naprawa komputerów', 'naprawa-komputerow', 'Serwis PC i laptopów', 'wrench', it_id),
    ('Instalacja systemu', 'instalacja-systemu', 'Instalacja Windows, Linux', 'hard-drive', it_id),
    ('Sieci domowe', 'sieci-domowe', 'Konfiguracja WiFi i sieci', 'wifi', it_id);

  -- Insert subcategories for Nauka
  INSERT INTO categories (name, slug, description, icon, parent_id) VALUES
    ('Matematyka', 'matematyka', 'Korepetycje z matematyki', 'calculator', nauka_id),
    ('Języki obce', 'jezyki-obce', 'Nauka języków obcych', 'languages', nauka_id),
    ('Informatyka', 'informatyka', 'Programowanie i IT', 'code', nauka_id);

  -- Insert subcategories for Opieka
  INSERT INTO categories (name, slug, description, icon, parent_id) VALUES
    ('Opieka nad dziećmi', 'opieka-nad-dziecmi', 'Niania, opieka dzienna', 'baby', opieka_id),
    ('Opieka nad seniorami', 'opieka-nad-seniorami', 'Opieka osób starszych', 'accessibility', opieka_id),
    ('Opieka nad zwierzętami', 'opieka-nad-zwierzetami', 'Wyprowadzanie psów, opieka', 'dog', opieka_id);
END $$;
