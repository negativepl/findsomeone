-- Comprehensive category reset for local classifieds platform
-- Similar to OLX but more local-focused
-- Main categories have icons, subcategories don't need icons

-- Step 1: Remove category references from posts
UPDATE posts SET category_id = NULL WHERE category_id IS NOT NULL;

-- Step 2: Drop the unique constraint on name
ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_name_key;

-- Step 3: Delete all existing categories
DELETE FROM categories WHERE parent_id IS NOT NULL;
DELETE FROM categories WHERE parent_id IS NULL;

-- Step 4: Recreate the unique constraint
ALTER TABLE categories ADD CONSTRAINT categories_name_key UNIQUE (name);

-- Insert main categories with Lucide icons
INSERT INTO categories (name, slug, description, icon) VALUES
-- Wynajem i Wypożyczalnia
('Wynajem i Wypożyczalnia', 'wynajem-i-wypozyczalnia', 'Wynajem sprzętu, narzędzi i przedmiotów', 'key'),

-- Noclegi
('Noclegi', 'noclegi', 'Wynajem pokoi, apartamentów, domów', 'bed'),

-- Motoryzacja
('Motoryzacja', 'motoryzacja', 'Samochody, motocykle, części samochodowe', 'car'),

-- Nieruchomości
('Nieruchomości', 'nieruchomosci', 'Sprzedaż i wynajem nieruchomości', 'home'),

-- Praca
('Praca', 'praca', 'Oferty pracy i zlecenia', 'briefcase'),

-- Usługi
('Usługi', 'uslugi', 'Różnego rodzaju usługi lokalne', 'wrench'),

-- Elektronika
('Elektronika', 'elektronika', 'Telefony, komputery, AGD, RTV', 'smartphone'),

-- Dom i Ogród
('Dom i Ogród', 'dom-i-ogrod', 'Meble, wyposażenie, narzędzia ogrodowe', 'home'),

-- Moda
('Moda', 'moda', 'Odzież, obuwie, dodatki', 'shirt'),

-- Dziecko
('Dziecko', 'dziecko', 'Artykuły dla dzieci i niemowląt', 'baby'),

-- Sport i Hobby
('Sport i Hobby', 'sport-i-hobby', 'Sprzęt sportowy, rowery, hobby', 'dumbbell'),

-- Zwierzęta
('Zwierzęta', 'zwierzeta', 'Zwierzęta i akcesoria dla zwierząt', 'dog'),

-- Muzyka i Edukacja
('Muzyka i Edukacja', 'muzyka-i-edukacja', 'Instrumenty, książki, kursy', 'music'),

-- Zdrowie i Uroda
('Zdrowie i Uroda', 'zdrowie-i-uroda', 'Kosmetyki, suplementy, sprzęt', 'heart-pulse'),

-- Oddam za darmo
('Oddam za darmo', 'oddam-za-darmo', 'Rzeczy do oddania za darmo', 'gift'),

-- Zamienię
('Zamienię', 'zamienie', 'Wymiana przedmiotów', 'repeat'),

-- Inne
('Inne', 'inne', 'Pozostałe ogłoszenia', 'help-circle');

-- Get IDs of parent categories for subcategories
DO $$
DECLARE
  wynajem_id UUID;
  noclegi_id UUID;
  motoryzacja_id UUID;
  nieruchomosci_id UUID;
  praca_id UUID;
  uslugi_id UUID;
  elektronika_id UUID;
  dom_ogrod_id UUID;
  moda_id UUID;
  dziecko_id UUID;
  sport_hobby_id UUID;
  zwierzeta_id UUID;
  muzyka_edukacja_id UUID;
  zdrowie_uroda_id UUID;
  oddam_id UUID;
  zamienie_id UUID;
  inne_id UUID;
BEGIN
  -- Get parent category IDs
  SELECT id INTO wynajem_id FROM categories WHERE slug = 'wynajem-i-wypozyczalnia';
  SELECT id INTO noclegi_id FROM categories WHERE slug = 'noclegi';
  SELECT id INTO motoryzacja_id FROM categories WHERE slug = 'motoryzacja';
  SELECT id INTO nieruchomosci_id FROM categories WHERE slug = 'nieruchomosci';
  SELECT id INTO praca_id FROM categories WHERE slug = 'praca';
  SELECT id INTO uslugi_id FROM categories WHERE slug = 'uslugi';
  SELECT id INTO elektronika_id FROM categories WHERE slug = 'elektronika';
  SELECT id INTO dom_ogrod_id FROM categories WHERE slug = 'dom-i-ogrod';
  SELECT id INTO moda_id FROM categories WHERE slug = 'moda';
  SELECT id INTO dziecko_id FROM categories WHERE slug = 'dziecko';
  SELECT id INTO sport_hobby_id FROM categories WHERE slug = 'sport-i-hobby';
  SELECT id INTO zwierzeta_id FROM categories WHERE slug = 'zwierzeta';
  SELECT id INTO muzyka_edukacja_id FROM categories WHERE slug = 'muzyka-i-edukacja';
  SELECT id INTO zdrowie_uroda_id FROM categories WHERE slug = 'zdrowie-i-uroda';
  SELECT id INTO oddam_id FROM categories WHERE slug = 'oddam-za-darmo';
  SELECT id INTO zamienie_id FROM categories WHERE slug = 'zamienie';
  SELECT id INTO inne_id FROM categories WHERE slug = 'inne';

  -- Subcategories for Wynajem i Wypożyczalnia
  INSERT INTO categories (name, slug, description, parent_id) VALUES
    ('Narzędzia budowlane', 'narzedzia-budowlane', 'Wiertarki, młoty, piły, szlifierki', wynajem_id),
    ('Narzędzia ogrodowe', 'narzedzia-ogrodowe', 'Kosiarki, piły łańcuchowe, wykaszarki', wynajem_id),
    ('Elektronarzędzia', 'elektronarzedzia', 'Frezarki, strugi, szlifierki kątowe', wynajem_id),
    ('Sprzęt budowlany', 'sprzet-budowlany', 'Rusztowania, drabiny, betomiarki', wynajem_id),
    ('Maszyny ciężkie', 'maszyny-ciezkie', 'Koparki, ładowarki, walce', wynajem_id),
    ('Transport i przyczepy', 'transport-i-przyczepy', 'Przyczepy, lawety, busy', wynajem_id),
    ('Sprzęt eventowy', 'sprzet-eventowy', 'Namioty, krzesła, stoły, nagłośnienie', wynajem_id),
    ('Sprzęt elektroniczny', 'sprzet-elektroniczny-wynajem', 'Kamery, projektory, konsole', wynajem_id),
    ('Sport i rekreacja', 'sport-i-rekreacja', 'Rowery, kajaki, sprzęt zimowy', wynajem_id),
    ('Urządzenia czyszczące', 'urzadzenia-czyszczace', 'Myjki ciśnieniowe, odkurzacze przemysłowe', wynajem_id),
    ('Sprzęt medyczny', 'sprzet-medyczny', 'Wózki, balkoniki, łóżka rehabilitacyjne', wynajem_id),
    ('Artykuły dla dzieci', 'artykuly-dla-dzieci', 'Wózki, foteliki, łóżeczka', wynajem_id);

  -- Subcategories for Noclegi
  INSERT INTO categories (name, slug, description, parent_id) VALUES
    ('Pokoje', 'pokoje', 'Wynajem pokoi krótkoterminowy', noclegi_id),
    ('Apartamenty', 'apartamenty', 'Całe mieszkania na doby', noclegi_id),
    ('Domy', 'domy', 'Wynajem domów wakacyjnych', noclegi_id),
    ('Kwatery pracownicze', 'kwatery-pracownicze', 'Noclegi dla pracowników', noclegi_id),
    ('Miejsca kempingowe', 'miejsca-kempingowe', 'Kampery, przyczepy kempingowe', noclegi_id),
    ('Pokoje gościnne', 'pokoje-goscinne', 'Pokoje u prywatnych właścicieli', noclegi_id);

  -- Subcategories for Motoryzacja
  INSERT INTO categories (name, slug, description, parent_id) VALUES
    ('Samochody osobowe', 'samochody-osobowe', 'Sprzedaż samochodów osobowych', motoryzacja_id),
    ('Samochody dostawcze', 'samochody-dostawcze', 'Busy, vany, transportery', motoryzacja_id),
    ('Motocykle i skutery', 'motocykle-i-skutery', 'Jednoślady', motoryzacja_id),
    ('Ciężarowe', 'ciezarowe', 'Samochody ciężarowe', motoryzacja_id),
    ('Rolnicze', 'rolnicze', 'Ciągniki, maszyny rolnicze', motoryzacja_id),
    ('Przyczepy', 'przyczepy', 'Przyczepy samochodowe', motoryzacja_id),
    ('Części samochodowe', 'czesci-samochodowe', 'Części do aut', motoryzacja_id),
    ('Opony i felgi', 'opony-i-felgi', 'Koła do pojazdów', motoryzacja_id),
    ('Akcesoria samochodowe', 'akcesoria-samochodowe', 'Nawigacje, kamery, foteliki', motoryzacja_id),
    ('Tuning', 'tuning', 'Części i akcesoria tuningowe', motoryzacja_id),
    ('Narzędzia samochodowe', 'narzedzia-samochodowe', 'Narzędzia do naprawy aut', motoryzacja_id),
    ('Wynajem samochodów', 'wynajem-samochodow', 'Wypożyczalnie aut', motoryzacja_id);

  -- Subcategories for Nieruchomości
  INSERT INTO categories (name, slug, description, parent_id) VALUES
    ('Mieszkania sprzedaż', 'mieszkania-sprzedaz', 'Sprzedaż mieszkań', nieruchomosci_id),
    ('Mieszkania wynajem', 'mieszkania-wynajem', 'Wynajem długoterminowy mieszkań', nieruchomosci_id),
    ('Domy sprzedaż', 'domy-sprzedaz', 'Sprzedaż domów', nieruchomosci_id),
    ('Domy wynajem', 'domy-wynajem', 'Wynajem domów długoterminowy', nieruchomosci_id),
    ('Działki', 'dzialki', 'Sprzedaż działek budowlanych', nieruchomosci_id),
    ('Garaże i parkingi', 'garaze-i-parkingi', 'Sprzedaż i wynajem garaży', nieruchomosci_id),
    ('Lokale użytkowe', 'lokale-uzytkowe', 'Biura, sklepy, magazyny', nieruchomosci_id),
    ('Hale i magazyny', 'hale-i-magazyny', 'Obiekty przemysłowe', nieruchomosci_id),
    ('Stancje i pokoje', 'stancje-i-pokoje', 'Wynajem pokoi długoterminowy', nieruchomosci_id);

  -- Subcategories for Praca
  INSERT INTO categories (name, slug, description, parent_id) VALUES
    ('Administracja biurowa', 'administracja-biurowa', 'Praca biurowa', praca_id),
    ('Produkcja', 'produkcja', 'Praca produkcyjna', praca_id),
    ('Budowlane', 'budowlane', 'Prace budowlane', praca_id),
    ('Transport i logistyka', 'transport-i-logistyka', 'Kierowcy, kurierzy', praca_id),
    ('Sprzedaż i marketing', 'sprzedaz-i-marketing', 'Handel, marketing', praca_id),
    ('Gastronomia', 'gastronomia', 'Kelnerzy, kucharze', praca_id),
    ('Ochrona', 'ochrona', 'Ochrona osób i mienia', praca_id),
    ('IT i programowanie', 'it-i-programowanie', 'Praca w IT', praca_id),
    ('Sprzątanie', 'sprzatanie-praca', 'Prace porządkowe', praca_id),
    ('Opieka', 'opieka-praca', 'Opiekunki, nianki', praca_id),
    ('Sezonowe', 'sezonowe', 'Prace sezonowe', praca_id),
    ('Zlecenia', 'zlecenia', 'Jednorazowe zlecenia', praca_id);

  -- Subcategories for Usługi
  INSERT INTO categories (name, slug, description, parent_id) VALUES
    ('Budowlane i remontowe', 'budowlane-i-remontowe', 'Malowanie, płytki, tynki', uslugi_id),
    ('Hydrauliczne', 'hydrauliczne', 'Instalacje wodne, kanalizacja', uslugi_id),
    ('Elektryczne', 'elektryczne', 'Instalacje elektryczne', uslugi_id),
    ('Ogrodnicze', 'ogrodnicze', 'Koszenie, pielęgnacja ogrodów', uslugi_id),
    ('Transportowe i przeprowadzki', 'transportowe-i-przeprowadzki', 'Przewóz, przeprowadzki', uslugi_id),
    ('Sprzątanie', 'sprzatanie-uslugi', 'Sprzątanie domów, biur', uslugi_id),
    ('Montaż mebli', 'montaz-mebli', 'Składanie mebli', uslugi_id),
    ('Naprawa AGD', 'naprawa-agd', 'Serwis sprzętu AGD', uslugi_id),
    ('Naprawa RTV', 'naprawa-rtv', 'Serwis telewizorów, audio', uslugi_id),
    ('Komputerowe', 'komputerowe', 'Naprawy PC, instalacje', uslugi_id),
    ('Krawiectwo i pranie', 'krawiectwo-i-pranie', 'Pralnie, krawcy', uslugi_id),
    ('Fotograficzne', 'fotograficzne', 'Fotografia, video', uslugi_id),
    ('Muzyczne', 'muzyczne', 'DJ, muzycy na eventy', uslugi_id),
    ('Kosmetyczne i fryzjerskie', 'kosmetyczne-i-fryzjerskie', 'Fryzjer, kosmetyka', uslugi_id),
    ('Korepetycje', 'korepetycje', 'Nauka, kursy', uslugi_id),
    ('Prawne i księgowe', 'prawne-i-ksiegowe', 'Porady prawne, księgowość', uslugi_id),
    ('Weterynaryjne', 'weterynaryjne', 'Weterynarz, grooming', uslugi_id),
    ('Opieka nad zwierzętami', 'opieka-nad-zwierzetami-uslugi', 'Hotel dla zwierząt, wyprowadzanie', uslugi_id),
    ('Opieka nad dziećmi', 'opieka-nad-dziecmi-uslugi', 'Niania, opieka', uslugi_id),
    ('Opieka nad osobami starszymi', 'opieka-nad-starszymi', 'Opiekunki seniorów', uslugi_id);

  -- Subcategories for Elektronika
  INSERT INTO categories (name, slug, description, parent_id) VALUES
    ('Telefony', 'telefony', 'Smartfony i telefony komórkowe', elektronika_id),
    ('Tablety', 'tablety', 'Tablety i czytniki', elektronika_id),
    ('Laptopy', 'laptopy', 'Komputery przenośne', elektronika_id),
    ('Komputery', 'komputery', 'Komputery stacjonarne', elektronika_id),
    ('Akcesoria komputerowe', 'akcesoria-komputerowe', 'Klawiatury, myszki, monitory', elektronika_id),
    ('Podzespoły PC', 'podzespoly-pc', 'Karty graficzne, procesory, RAM', elektronika_id),
    ('Telewizory', 'telewizory', 'Telewizory i projektory', elektronika_id),
    ('Audio', 'audio', 'Głośniki, słuchawki, wzmacniacze', elektronika_id),
    ('Foto', 'foto', 'Aparaty fotograficzne i kamery', elektronika_id),
    ('Konsole i gry', 'konsole-i-gry', 'Konsole do gier i gry', elektronika_id),
    ('AGD małe', 'agd-male', 'Ekspresy, czajniki, tostery', elektronika_id),
    ('AGD duże', 'agd-duze', 'Lodówki, pralki, zmywarki', elektronika_id),
    ('Akcesoria GSM', 'akcesoria-gsm', 'Etui, ładowarki, folie', elektronika_id);

  -- Subcategories for Dom i Ogród
  INSERT INTO categories (name, slug, description, parent_id) VALUES
    ('Meble', 'meble', 'Stoły, krzesła, szafy', dom_ogrod_id),
    ('Wyposażenie wnętrz', 'wyposazenie-wnetrz', 'Dekoracje, obrazy, dywany', dom_ogrod_id),
    ('Oświetlenie', 'oswietlenie', 'Lampy, żyrandole', dom_ogrod_id),
    ('Narzędzia', 'narzedzia', 'Narzędzia ręczne i elektryczne', dom_ogrod_id),
    ('Majsterkowanie', 'majsterkowanie', 'Materiały budowlane', dom_ogrod_id),
    ('Ogród', 'ogrod', 'Meble ogrodowe, narzędzia', dom_ogrod_id),
    ('Rośliny', 'rosliny', 'Kwiaty, sadzonki, nasiona', dom_ogrod_id),
    ('Tekstylia domowe', 'tekstylia-domowe', 'Pościel, firany, ręczniki', dom_ogrod_id),
    ('Kuchnia i jadalnia', 'kuchnia-i-jadalnia', 'Naczynia, garnki, sztućce', dom_ogrod_id);

  -- Subcategories for Moda
  INSERT INTO categories (name, slug, description, parent_id) VALUES
    ('Odzież damska', 'odziez-damska', 'Ubrania damskie', moda_id),
    ('Odzież męska', 'odziez-meska', 'Ubrania męskie', moda_id),
    ('Obuwie damskie', 'obuwie-damskie', 'Buty damskie', moda_id),
    ('Obuwie męskie', 'obuwie-meskie', 'Buty męskie', moda_id),
    ('Torebki i plecaki', 'torebki-i-plecaki', 'Akcesoria', moda_id),
    ('Biżuteria i zegarki', 'bizuteria-i-zegarki', 'Ozdoby i zegarki', moda_id),
    ('Akcesoria', 'akcesoria-moda', 'Paski, szaliki, czapki', moda_id),
    ('Odzież ciążowa', 'odziez-ciazowa', 'Ubrania dla kobiet w ciąży', moda_id),
    ('Ślub i wesele', 'slub-i-wesele', 'Suknie ślubne, garnitury', moda_id);

  -- Subcategories for Dziecko
  INSERT INTO categories (name, slug, description, parent_id) VALUES
    ('Wózki', 'wozki', 'Wózki dziecięce', dziecko_id),
    ('Foteliki', 'foteliki', 'Foteliki samochodowe', dziecko_id),
    ('Łóżeczka i meble', 'lozeczka-i-meble', 'Meble dziecięce', dziecko_id),
    ('Odzież dla niemowląt', 'odziez-dla-niemowlat', 'Ubranka 0-2 lat', dziecko_id),
    ('Odzież dziecięca', 'odziez-dziecieca', 'Ubranka dla dzieci', dziecko_id),
    ('Obuwie dziecięce', 'obuwie-dzieciece', 'Buty dla dzieci', dziecko_id),
    ('Zabawki', 'zabawki', 'Zabawki dla dzieci', dziecko_id),
    ('Gry i puzzle', 'gry-i-puzzle', 'Gry planszowe, puzzle', dziecko_id),
    ('Książki dla dzieci', 'ksiazki-dla-dzieci', 'Literatura dziecięca', dziecko_id),
    ('Akcesoria do karmienia', 'akcesoria-do-karmienia', 'Butelki, smoczki', dziecko_id),
    ('Pielęgnacja', 'pielegnacja', 'Kosmetyki dla dzieci', dziecko_id);

  -- Subcategories for Sport i Hobby
  INSERT INTO categories (name, slug, description, parent_id) VALUES
    ('Rowery', 'rowery', 'Rowery i akcesoria', sport_hobby_id),
    ('Fitness', 'fitness', 'Sprzęt do ćwiczeń', sport_hobby_id),
    ('Piłka nożna', 'pilka-nozna', 'Sprzęt do piłki nożnej', sport_hobby_id),
    ('Siłownia', 'silownia', 'Hantle, ławki, sztangi', sport_hobby_id),
    ('Sporty zimowe', 'sporty-zimowe', 'Narty, snowboard', sport_hobby_id),
    ('Sporty wodne', 'sporty-wodne', 'Kajaki, deski SUP', sport_hobby_id),
    ('Turystyka', 'turystyka', 'Plecaki, śpiwory, namioty', sport_hobby_id),
    ('Wędkarstwo', 'wedkarstwo', 'Wędki i akcesoria', sport_hobby_id),
    ('Łowiectwo', 'lowiectwo', 'Sprzęt myśliwski', sport_hobby_id),
    ('Kolekcje', 'kolekcje', 'Monety, znaczki, militaria', sport_hobby_id),
    ('Modelarstwo', 'modelarstwo', 'Modele, drony RC', sport_hobby_id),
    ('Gry planszowe', 'gry-planszowe-hobby', 'Gry planszowe dla dorosłych', sport_hobby_id),
    ('Sztuka', 'sztuka', 'Malarstwo, rzeźba', sport_hobby_id);

  -- Subcategories for Zwierzęta
  INSERT INTO categories (name, slug, description, parent_id) VALUES
    ('Psy', 'psy', 'Sprzedaż psów', zwierzeta_id),
    ('Koty', 'koty', 'Sprzedaż kotów', zwierzeta_id),
    ('Gryzonie', 'gryzonie', 'Chomiki, świnki, króliki', zwierzeta_id),
    ('Ptaki', 'ptaki', 'Papugi, kanarki', zwierzeta_id),
    ('Akwaria', 'akwaria', 'Ryby, akwaria, akcesoria', zwierzeta_id),
    ('Terraria', 'terraria', 'Gady, płazy, terraria', zwierzeta_id),
    ('Zwierzęta gospodarskie', 'zwierzeta-gospodarskie', 'Kury, konie, kozy', zwierzeta_id),
    ('Karma dla zwierząt', 'karma-dla-zwierzat', 'Karma i przysmaki', zwierzeta_id),
    ('Akcesoria dla zwierząt', 'akcesoria-dla-zwierzat', 'Smycze, legowiska, zabawki', zwierzeta_id);

  -- Subcategories for Muzyka i Edukacja
  INSERT INTO categories (name, slug, description, parent_id) VALUES
    ('Instrumenty klawiszowe', 'instrumenty-klawiszowe', 'Pianina, keyboardy', muzyka_edukacja_id),
    ('Gitary', 'gitary', 'Gitary akustyczne, elektryczne', muzyka_edukacja_id),
    ('Instrumenty dęte', 'instrumenty-dete', 'Saksofony, trąbki', muzyka_edukacja_id),
    ('Perkusja', 'perkusja', 'Perkusja i zestawy', muzyka_edukacja_id),
    ('Sprzęt DJ', 'sprzet-dj', 'Mikery, kontrolery, gramofony', muzyka_edukacja_id),
    ('Sprzęt nagłaśniający', 'sprzet-naglasniajacy', 'Kolumny, mikrofony', muzyka_edukacja_id),
    ('Książki', 'ksiazki', 'Literatura różna', muzyka_edukacja_id),
    ('Podręczniki', 'podreczniki', 'Książki szkolne', muzyka_edukacja_id),
    ('Kursy i szkolenia', 'kursy-i-szkolenia', 'Materiały edukacyjne', muzyka_edukacja_id);

  -- Subcategories for Zdrowie i Uroda
  INSERT INTO categories (name, slug, description, parent_id) VALUES
    ('Kosmetyki', 'kosmetyki', 'Kosmetyki do pielęgnacji', zdrowie_uroda_id),
    ('Perfumy', 'perfumy', 'Zapachy damskie i męskie', zdrowie_uroda_id),
    ('Sprzęt kosmetyczny', 'sprzet-kosmetyczny', 'Suszarki, prostownice', zdrowie_uroda_id),
    ('Suplementy', 'suplementy', 'Odżywki, witaminy', zdrowie_uroda_id),
    ('Sprzęt rehabilitacyjny', 'sprzet-rehabilitacyjny', 'Wózki, kule, balkoniki', zdrowie_uroda_id);

  -- Subcategories for Oddam za darmo
  INSERT INTO categories (name, slug, description, parent_id) VALUES
    ('Meble za darmo', 'meble-za-darmo', 'Oddawane meble', oddam_id),
    ('Odzież za darmo', 'odziez-za-darmo', 'Oddawana odzież', oddam_id),
    ('Elektronika za darmo', 'elektronika-za-darmo', 'Oddawany sprzęt elektroniczny', oddam_id),
    ('AGD za darmo', 'agd-za-darmo', 'Oddawane AGD', oddam_id),
    ('Dla dzieci za darmo', 'dla-dzieci-za-darmo', 'Oddawane rzeczy dziecięce', oddam_id),
    ('Książki za darmo', 'ksiazki-za-darmo', 'Oddawane książki', oddam_id),
    ('Inne za darmo', 'inne-za-darmo', 'Różne rzeczy za darmo', oddam_id);

  -- Subcategories for Zamienię
  INSERT INTO categories (name, slug, description, parent_id) VALUES
    ('Elektronika na wymianę', 'elektronika-na-wymiane', 'Wymiana sprzętu elektronicznego', zamienie_id),
    ('Telefony na wymianę', 'telefony-na-wymiane', 'Wymiana telefonów', zamienie_id),
    ('Gry i konsole na wymianę', 'gry-i-konsole-na-wymiane', 'Wymiana gier', zamienie_id),
    ('Odzież na wymianę', 'odziez-na-wymiane', 'Wymiana ubrań', zamienie_id),
    ('Inne na wymianę', 'inne-na-wymiane', 'Różne wymiany', zamienie_id);

  -- Subcategories for Inne
  INSERT INTO categories (name, slug, description, parent_id) VALUES
    ('Bilety', 'bilety', 'Bilety na koncerty, wydarzenia', inne_id),
    ('Vouchery', 'vouchery', 'Bony, vouchery', inne_id),
    ('Stracone i znalezione', 'stracone-i-znalezione', 'Zgubione i znalezione rzeczy', inne_id),
    ('Różne', 'rozne', 'Pozostałe ogłoszenia', inne_id);

END $$;
