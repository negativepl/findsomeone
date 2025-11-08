-- Fix brand names (Apple iPhone -> Apple, Google Pixel -> Google)
-- and improve all subcategory descriptions to be more detailed and professional

-- Fix phone brand names
UPDATE categories SET
  name = 'Apple',
  description = 'Telefony iPhone - smartfony marki Apple z systemem iOS'
WHERE slug = 'apple-iphone';

UPDATE categories SET
  name = 'Google',
  description = 'Telefony Pixel - smartfony Google z czystym Androidem'
WHERE slug = 'google-pixel';

-- Improve descriptions for Wynajem i Wypożyczalnia subcategories
UPDATE categories SET description = 'Wypożyczalnia narzędzi budowlanych - wiertarki, młoty udarowe, piły, szlifierki i inne' WHERE slug = 'narzedzia-budowlane';
UPDATE categories SET description = 'Wynajem narzędzi ogrodowych - kosiarki, piły łańcuchowe, wykaszarki, przycinki do żywopłotu' WHERE slug = 'narzedzia-ogrodowe';
UPDATE categories SET description = 'Wypożyczalnia elektronarzędzi - frezarki, strugi elektryczne, szlifierki kątowe' WHERE slug = 'elektronarzedzia';
UPDATE categories SET description = 'Wynajem sprzętu budowlanego - rusztowania, drabiny, betomiarki, zagęszczarki' WHERE slug = 'sprzet-budowlany';
UPDATE categories SET description = 'Wypożyczalnia maszyn ciężkich - koparki, ładowarki, walce drogowe, minikoparki' WHERE slug = 'maszyny-ciezkie';
UPDATE categories SET description = 'Wynajem przyczep i transportu - przyczepy samochodowe, lawety, busy dostawcze' WHERE slug = 'transport-i-przyczepy';
UPDATE categories SET description = 'Wypożyczalnia sprzętu eventowego - namioty, krzesła, stoły, nagłośnienie, sceny' WHERE slug = 'sprzet-eventowy';
UPDATE categories SET description = 'Wynajem elektroniki - kamery, projektory, konsole do gier, sprzęt multimedialny' WHERE slug = 'sprzet-elektroniczny-wynajem';
UPDATE categories SET description = 'Wypożyczalnia sprzętu sportowego - rowery, kajaki, narty, deski snowboardowe' WHERE slug = 'sport-i-rekreacja';
UPDATE categories SET description = 'Wynajem urządzeń czyszczących - myjki ciśnieniowe, odkurzacze przemysłowe, maszyny parowe' WHERE slug = 'urzadzenia-czyszczace';
UPDATE categories SET description = 'Wypożyczalnia sprzętu medycznego - wózki inwalidzkie, balkoniki, łóżka rehabilitacyjne' WHERE slug = 'sprzet-medyczny';
UPDATE categories SET description = 'Wynajem artykułów dla dzieci - wózki dziecięce, foteliki samochodowe, łóżeczka turystyczne' WHERE slug = 'artykuly-dla-dzieci';

-- Improve descriptions for Noclegi subcategories
UPDATE categories SET description = 'Wynajem pokoi na doby - tanie noclegi krótkoterminowe w pokojach gościnnych' WHERE slug = 'pokoje';
UPDATE categories SET description = 'Wynajem apartamentów na doby - całe mieszkania dla turystów i osób w podróży służbowej' WHERE slug = 'apartamenty';
UPDATE categories SET description = 'Wynajem domów wakacyjnych - domy letniskowe i domki na krótki pobyt' WHERE slug = 'domy';
UPDATE categories SET description = 'Kwatery pracownicze - noclegi dla pracowników sezonowych i delegowanych' WHERE slug = 'kwatery-pracownicze';
UPDATE categories SET description = 'Miejsca kempingowe - pola namiotowe, miejsca dla kamperów i przyczep kempingowych' WHERE slug = 'miejsca-kempingowe';
UPDATE categories SET description = 'Pokoje gościnne u gospodarzy - noclegi u prywatnych właścicieli, agroturystyka' WHERE slug = 'pokoje-goscinne';

-- Improve descriptions for Motoryzacja subcategories
UPDATE categories SET description = 'Sprzedaż samochodów osobowych - auta używane i nowe wszystkich marek' WHERE slug = 'samochody-osobowe';
UPDATE categories SET description = 'Sprzedaż samochodów dostawczych - busy, vany, transportery do pracy i biznesu' WHERE slug = 'samochody-dostawcze';
UPDATE categories SET description = 'Sprzedaż motocykli i skuterów - jednoślady, motorowery, quady' WHERE slug = 'motocykle-i-skutery';
UPDATE categories SET description = 'Samochody ciężarowe - ciężarówki, wywrotki, pojazdy do transportu' WHERE slug = 'ciezarowe';
UPDATE categories SET description = 'Pojazdy rolnicze - ciągniki, kombajny, maszyny i sprzęt rolniczy' WHERE slug = 'rolnicze';
UPDATE categories SET description = 'Przyczepy samochodowe - przyczepy bagażowe, lawety, przyczepy specjalistyczne' WHERE slug = 'przyczepy';
UPDATE categories SET description = 'Części zamienne do samochodów - oryginalne i zamienniki do wszystkich marek' WHERE slug = 'czesci-samochodowe';
UPDATE categories SET description = 'Opony i felgi - koła letnie, zimowe i całoroczne do samochodów' WHERE slug = 'opony-i-felgi';
UPDATE categories SET description = 'Akcesoria samochodowe - nawigacje GPS, kamery, foteliki, organizery' WHERE slug = 'akcesoria-samochodowe';
UPDATE categories SET description = 'Tuning samochodowy - części i akcesoria do modyfikacji i poprawy wyglądu aut' WHERE slug = 'tuning';
UPDATE categories SET description = 'Narzędzia samochodowe - klucze, podnośniki, komputery diagnostyczne' WHERE slug = 'narzedzia-samochodowe';
UPDATE categories SET description = 'Wynajem samochodów - wypożyczalnie aut osobowych i dostawczych' WHERE slug = 'wynajem-samochodow';

-- Improve descriptions for Nieruchomości subcategories
UPDATE categories SET description = 'Sprzedaż mieszkań - oferty mieszkań do kupienia od właścicieli i deweloperów' WHERE slug = 'mieszkania-sprzedaz';
UPDATE categories SET description = 'Wynajem długoterminowy mieszkań - mieszkania na wynajem od właścicieli' WHERE slug = 'mieszkania-wynajem';
UPDATE categories SET description = 'Sprzedaż domów - domy jednorodzinne, bliźniaki, szeregowce na sprzedaż' WHERE slug = 'domy-sprzedaz';
UPDATE categories SET description = 'Wynajem długoterminowy domów - domy do wynajęcia dla rodzin' WHERE slug = 'domy-wynajem';
UPDATE categories SET description = 'Sprzedaż działek - działki budowlane, rolne, rekreacyjne' WHERE slug = 'dzialki';
UPDATE categories SET description = 'Garaże i miejsca parkingowe - sprzedaż i wynajem garaży, parkingi' WHERE slug = 'garaze-i-parkingi';
UPDATE categories SET description = 'Lokale użytkowe - biura, sklepy, lokale usługowe do wynajęcia lub sprzedaży' WHERE slug = 'lokale-uzytkowe';
UPDATE categories SET description = 'Hale i magazyny - obiekty przemysłowe, hale produkcyjne, magazyny' WHERE slug = 'hale-i-magazyny';
UPDATE categories SET description = 'Pokoje i stancje - wynajem pokoi długoterminowy dla studentów i pracowników' WHERE slug = 'stancje-i-pokoje';

-- Improve descriptions for Praca subcategories
UPDATE categories SET description = 'Praca administracyjno-biurowa - oferty pracy w biurach, recepcje, sekretariat' WHERE slug = 'administracja-biurowa';
UPDATE categories SET description = 'Praca produkcyjna - praca w produkcji, fabrykach, zakładach przemysłowych' WHERE slug = 'produkcja';
UPDATE categories SET description = 'Prace budowlane - oferty dla budowlańców, murarzy, tynkarzy, dekarzy' WHERE slug = 'budowlane';
UPDATE categories SET description = 'Transport i logistyka - praca dla kierowców, kurierów, magazynierów' WHERE slug = 'transport-i-logistyka';
UPDATE categories SET description = 'Sprzedaż i marketing - oferty dla handlowców, sprzedawców, marketerów' WHERE slug = 'sprzedaz-i-marketing';
UPDATE categories SET description = 'Praca w gastronomii - kelnerzy, kucharze, barmani, pizzerzy' WHERE slug = 'gastronomia';
UPDATE categories SET description = 'Praca w ochronie - oferty dla ochroniarzy, pracowników ochrony mienia' WHERE slug = 'ochrona';
UPDATE categories SET description = 'Praca w IT i programowanie - oferty dla programistów, testerów, adminów' WHERE slug = 'it-i-programowanie';
UPDATE categories SET description = 'Praca sprzątająca - oferty dla sprzątaczek, pracowników obsługi czystości' WHERE slug = 'sprzatanie-praca';
UPDATE categories SET description = 'Opieka nad osobami - oferty dla opiekunek osób starszych i dzieci' WHERE slug = 'opieka-praca';
UPDATE categories SET description = 'Prace sezonowe - oferty pracy tymczasowej, sezonowej, wakacyjnej' WHERE slug = 'sezonowe';
UPDATE categories SET description = 'Jednorazowe zlecenia - zlecenia krótkoterminowe, prace dorywcze' WHERE slug = 'zlecenia';

-- Improve descriptions for Usługi subcategories
UPDATE categories SET description = 'Usługi budowlane i remontowe - malowanie, układanie płytek, tynkowanie, gładzie' WHERE slug = 'budowlane-i-remontowe';
UPDATE categories SET description = 'Usługi hydrauliczne - instalacje wodno-kanalizacyjne, naprawy, udrażnianie' WHERE slug = 'hydrauliczne';
UPDATE categories SET description = 'Usługi elektryczne - instalacje elektryczne, naprawy, montaż osprzętu' WHERE slug = 'elektryczne';
UPDATE categories SET description = 'Usługi ogrodnicze - koszenie trawników, pielęgnacja ogrodów, zakładanie trawników' WHERE slug = 'ogrodnicze';
UPDATE categories SET description = 'Transport i przeprowadzki - przewóz mebli, przeprowadzki mieszkań i firm' WHERE slug = 'transportowe-i-przeprowadzki';
UPDATE categories SET description = 'Usługi sprzątające - sprzątanie domów, mieszkań, biur, mycie okien' WHERE slug = 'sprzatanie-uslugi';
UPDATE categories SET description = 'Montaż i składanie mebli - profesjonalny montaż mebli z IKEA i innych sklepów' WHERE slug = 'montaz-mebli';
UPDATE categories SET description = 'Naprawa AGD - serwis pralek, lodówek, zmywarek, piekarników' WHERE slug = 'naprawa-agd';
UPDATE categories SET description = 'Naprawa RTV - serwis telewizorów, sprzętu audio, kin domowych' WHERE slug = 'naprawa-rtv';
UPDATE categories SET description = 'Usługi komputerowe - naprawa komputerów, instalacja systemów, usuwanie wirusów' WHERE slug = 'komputerowe';
UPDATE categories SET description = 'Krawiectwo i pranie - usługi krawieckie, pralnicze, czyszczenie chemiczne' WHERE slug = 'krawiectwo-i-pranie';
UPDATE categories SET description = 'Usługi fotograficzne - fotografia ślubna, okolicznościowa, produktowa' WHERE slug = 'fotograficzne';
UPDATE categories SET description = 'Usługi muzyczne - DJ na wesela, muzycy na eventy, nagłośnienie' WHERE slug = 'muzyczne';
UPDATE categories SET description = 'Usługi kosmetyczne i fryzjerskie - strzyżenie, koloryzacja, zabiegi kosmetyczne' WHERE slug = 'kosmetyczne-i-fryzjerskie';
UPDATE categories SET description = 'Korepetycje i nauka - korepetycje ze wszystkich przedmiotów, kursy językowe' WHERE slug = 'korepetycje';
UPDATE categories SET description = 'Usługi prawne i księgowe - porady prawne, prowadzenie ksiąg, deklaracje' WHERE slug = 'prawne-i-ksiegowe';
UPDATE categories SET description = 'Usługi weterynaryjne - weterynarz, zabiegi, grooming dla zwierząt' WHERE slug = 'weterynaryjne';
UPDATE categories SET description = 'Opieka nad zwierzętami - hotel dla psów i kotów, wyprowadzanie, pet sitting' WHERE slug = 'opieka-nad-zwierzetami-uslugi';
UPDATE categories SET description = 'Opieka nad dziećmi - niania, opiekunka do dziecka, animatorki' WHERE slug = 'opieka-nad-dziecmi-uslugi';
UPDATE categories SET description = 'Opieka nad seniorami - opiekunki osób starszych, pomoc w codziennych czynnościach' WHERE slug = 'opieka-nad-starszymi';

-- Improve descriptions for Elektronika subcategories
UPDATE categories SET description = 'Telefony komórkowe - smartfony używane i nowe wszystkich marek' WHERE slug = 'telefony';
UPDATE categories SET description = 'Tablety i czytniki - tablety Android, iPad, e-booki' WHERE slug = 'tablety';
UPDATE categories SET description = 'Laptopy - komputery przenośne do pracy i nauki' WHERE slug = 'laptopy';
UPDATE categories SET description = 'Komputery stacjonarne - PC do gier, pracy, do domu i biura' WHERE slug = 'komputery';
UPDATE categories SET description = 'Akcesoria komputerowe - klawiatury, myszki, monitory, drukarki' WHERE slug = 'akcesoria-komputerowe';
UPDATE categories SET description = 'Podzespoły komputerowe - karty graficzne, procesory, RAM, dyski' WHERE slug = 'podzespoly-pc';
UPDATE categories SET description = 'Telewizory i projektory - TV LED, OLED, projektory do kina domowego' WHERE slug = 'telewizory';
UPDATE categories SET description = 'Sprzęt audio - głośniki, słuchawki, wzmacniacze, soundbary' WHERE slug = 'audio';
UPDATE categories SET description = 'Aparaty i kamery - aparaty fotograficzne, kamery wideo, obiektywy' WHERE slug = 'foto';
UPDATE categories SET description = 'Konsole i gry - PlayStation, Xbox, Nintendo, gry na konsole' WHERE slug = 'konsole-i-gry';
UPDATE categories SET description = 'AGD małe - ekspresy do kawy, czajniki, tostery, roboty kuchenne' WHERE slug = 'agd-male';
UPDATE categories SET description = 'AGD duże - lodówki, pralki, zmywarki, kuchenki, piekarniki' WHERE slug = 'agd-duze';
UPDATE categories SET description = 'Akcesoria GSM - etui, ładowarki, folie ochronne, powerbanki' WHERE slug = 'akcesoria-gsm';

-- Improve descriptions for Dom i Ogród subcategories
UPDATE categories SET description = 'Meble - stoły, krzesła, szafy, komody, łóżka do domu' WHERE slug = 'meble';
UPDATE categories SET description = 'Wyposażenie wnętrz - dekoracje, obrazy, dywany, zasłony' WHERE slug = 'wyposazenie-wnetrz';
UPDATE categories SET description = 'Oświetlenie - lampy, żyrandole, lampki nocne, oświetlenie LED' WHERE slug = 'oswietlenie';
UPDATE categories SET description = 'Narzędzia - narzędzia ręczne i elektryczne do majsterkowania' WHERE slug = 'narzedzia';
UPDATE categories SET description = 'Majsterkowanie - materiały budowlane, farby, kleje, śruby' WHERE slug = 'majsterkowanie';
UPDATE categories SET description = 'Ogród - meble ogrodowe, grille, narzędzia do pielęgnacji ogrodu' WHERE slug = 'ogrod';
UPDATE categories SET description = 'Rośliny - kwiaty doniczkowe, sadzonki, nasiona, cebulki' WHERE slug = 'rosliny';
UPDATE categories SET description = 'Tekstylia domowe - pościel, koce, firany, poduszki, ręczniki' WHERE slug = 'tekstylia-domowe';
UPDATE categories SET description = 'Kuchnia i jadalnia - naczynia, garnki, patelnie, sztućce, serwisy' WHERE slug = 'kuchnia-i-jadalnia';

-- Improve descriptions for Moda subcategories
UPDATE categories SET description = 'Odzież damska - sukienki, spódnice, bluzki, spodnie dla kobiet' WHERE slug = 'odziez-damska';
UPDATE categories SET description = 'Odzież męska - koszule, spodnie, marynarki, t-shirty dla mężczyzn' WHERE slug = 'odziez-meska';
UPDATE categories SET description = 'Obuwie damskie - buty, szpilki, botki, sandały dla kobiet' WHERE slug = 'obuwie-damskie';
UPDATE categories SET description = 'Obuwie męskie - buty męskie, sportowe, eleganckie, zimowe' WHERE slug = 'obuwie-meskie';
UPDATE categories SET description = 'Torebki i plecaki - torebki damskie, plecaki, torby podróżne' WHERE slug = 'torebki-i-plecaki';
UPDATE categories SET description = 'Biżuteria i zegarki - naszyjniki, bransoletki, pierścionki, zegarki' WHERE slug = 'bizuteria-i-zegarki';
UPDATE categories SET description = 'Akcesoria modowe - paski, szaliki, czapki, rękawiczki' WHERE slug = 'akcesoria-moda';
UPDATE categories SET description = 'Odzież ciążowa - ubrania dla kobiet w ciąży, odzież do karmienia' WHERE slug = 'odziez-ciazowa';
UPDATE categories SET description = 'Ślub i wesele - suknie ślubne, garnitury, dodatki ślubne' WHERE slug = 'slub-i-wesele';

-- Improve descriptions for Dziecko subcategories
UPDATE categories SET description = 'Wózki dziecięce - wózki spacerowe, głębokie, wielofunkcyjne' WHERE slug = 'wozki';
UPDATE categories SET description = 'Foteliki samochodowe - foteliki 0-13kg, 9-18kg, 15-36kg' WHERE slug = 'foteliki';
UPDATE categories SET description = 'Łóżeczka i meble dziecięce - łóżeczka, przewijaki, szafki' WHERE slug = 'lozeczka-i-meble';
UPDATE categories SET description = 'Odzież dla niemowląt - body, pajacyki, śpioszki 0-24 miesięcy' WHERE slug = 'odziez-dla-niemowlat';
UPDATE categories SET description = 'Odzież dziecięca - ubranka dla dzieci od 2 lat wzwyż' WHERE slug = 'odziez-dziecieca';
UPDATE categories SET description = 'Obuwie dziecięce - buciki, sandałki, kapcie dla dzieci' WHERE slug = 'obuwie-dzieciece';
UPDATE categories SET description = 'Zabawki - zabawki edukacyjne, pluszaki, lalki, samochodziki' WHERE slug = 'zabawki';
UPDATE categories SET description = 'Gry i puzzle - gry planszowe, puzzle, gry edukacyjne dla dzieci' WHERE slug = 'gry-i-puzzle';
UPDATE categories SET description = 'Książki dla dzieci - bajki, kolorowankiobrazy, książeczki edukacyjne' WHERE slug = 'ksiazki-dla-dzieci';
UPDATE categories SET description = 'Akcesoria do karmienia - butelki, smoczki, podgrzewacze, sterylizatory' WHERE slug = 'akcesoria-do-karmienia';
UPDATE categories SET description = 'Pielęgnacja niemowląt - kosmetyki dla dzieci, kąpiel, pieluchy' WHERE slug = 'pielegnacja';

-- Improve descriptions for Sport i Hobby subcategories
UPDATE categories SET description = 'Rowery - rowery górskie, szosowe, miejskie, dziecięce' WHERE slug = 'rowery';
UPDATE categories SET description = 'Fitness - orbitreki, bieżnie, stepery, maty do ćwiczeń' WHERE slug = 'fitness';
UPDATE categories SET description = 'Piłka nożna - piłki, bramki, stroje, ochraniacze do gry w piłkę' WHERE slug = 'pilka-nozna';
UPDATE categories SET description = 'Siłownia - hantle, ławki, sztangi, atlas, wyciągi do treningu' WHERE slug = 'silownia';
UPDATE categories SET description = 'Sporty zimowe - narty, snowboard, łyżwy, kijki, buty narciarskie' WHERE slug = 'sporty-zimowe';
UPDATE categories SET description = 'Sporty wodne - kajaki, deski SUP, pontony, sprzęt do pływania' WHERE slug = 'sporty-wodne';
UPDATE categories SET description = 'Turystyka - plecaki turystyczne, śpiwory, namioty, karimat' WHERE slug = 'turystyka';
UPDATE categories SET description = 'Wędkarstwo - wędki, kołowrotki, przynęty, sprzęt wędkarski' WHERE slug = 'wedkarstwo';
UPDATE categories SET description = 'Łowiectwo - broń myśliwska, optyka, odzież, sprzęt dla myśliwych' WHERE slug = 'lowiectwo';
UPDATE categories SET description = 'Kolekcje - monety, znaczki, militaria, antyki kolekcjonerskie' WHERE slug = 'kolekcje';
UPDATE categories SET description = 'Modelarstwo - modele RC, drony, samoloty, helikoptery zdalnie sterowane' WHERE slug = 'modelarstwo';
UPDATE categories SET description = 'Gry planszowe - gry strategiczne, rodzinne, karciane dla dorosłych' WHERE slug = 'gry-planszowe-hobby';
UPDATE categories SET description = 'Sztuka - obrazy, rzeźby, grafiki, dzieła sztuki' WHERE slug = 'sztuka';

-- Improve descriptions for Zwierzęta subcategories
UPDATE categories SET description = 'Psy - sprzedaż szczeniąt rasowych i mieszańców, adopcje' WHERE slug = 'psy';
UPDATE categories SET description = 'Koty - sprzedaż kociąt rasowych i mieszańców, adopcje' WHERE slug = 'koty';
UPDATE categories SET description = 'Gryzonie - chomiki, świnki morskie, króliki, szynszyle' WHERE slug = 'gryzonie';
UPDATE categories SET description = 'Ptaki - papugi, kanarki, papużki faliste, gołębie' WHERE slug = 'ptaki';
UPDATE categories SET description = 'Akwaria - rybki akwariowe, akwaria, filtry, pokarm' WHERE slug = 'akwaria';
UPDATE categories SET description = 'Terraria - gady, węże, jaszczurki, żółwie, płazy' WHERE slug = 'terraria';
UPDATE categories SET description = 'Zwierzęta gospodarskie - kury, kozy, owce, konie, króliki' WHERE slug = 'zwierzeta-gospodarskie';
UPDATE categories SET description = 'Karma dla zwierząt - karma dla psów, kotów, gryzoni, przysmaki' WHERE slug = 'karma-dla-zwierzat';
UPDATE categories SET description = 'Akcesoria dla zwierząt - smycze, legowiska, zabawki, kuwety' WHERE slug = 'akcesoria-dla-zwierzat';

-- Improve descriptions for Muzyka i Edukacja subcategories
UPDATE categories SET description = 'Instrumenty klawiszowe - pianina, fortepiany, keyboardy, syntezatory' WHERE slug = 'instrumenty-klawiszowe';
UPDATE categories SET description = 'Gitary - gitary akustyczne, elektryczne, klasyczne, basowe' WHERE slug = 'gitary';
UPDATE categories SET description = 'Instrumenty dęte - saksofony, trąbki, klarnety, flety' WHERE slug = 'instrumenty-dete';
UPDATE categories SET description = 'Perkusja - zestawy perkusyjne, talerze, bębny, cajony' WHERE slug = 'perkusja';
UPDATE categories SET description = 'Sprzęt DJ - mikery DJ, kontrolery, gramofony, słuchawki DJ' WHERE slug = 'sprzet-dj';
UPDATE categories SET description = 'Sprzęt nagłaśniający - kolumny, mikrofony, wzmacniacze, miksery' WHERE slug = 'sprzet-naglasniajacy';
UPDATE categories SET description = 'Książki - literatura piękna, kryminały, biografie, poradniki' WHERE slug = 'ksiazki';
UPDATE categories SET description = 'Podręczniki szkolne - książki do nauki dla szkół podstawowych i średnich' WHERE slug = 'podreczniki';
UPDATE categories SET description = 'Kursy i szkolenia - materiały edukacyjne, kursy online, e-learning' WHERE slug = 'kursy-i-szkolenia';

-- Improve descriptions for Zdrowie i Uroda subcategories
UPDATE categories SET description = 'Kosmetyki - kremy, serum, maseczki, pielęgnacja twarzy i ciała' WHERE slug = 'kosmetyki';
UPDATE categories SET description = 'Perfumy - zapachy damskie, męskie, unisex, wody toaletowe' WHERE slug = 'perfumy';
UPDATE categories SET description = 'Sprzęt kosmetyczny - suszarki do włosów, prostownice, depilatory' WHERE slug = 'sprzet-kosmetyczny';
UPDATE categories SET description = 'Suplementy diety - odżywki białkowe, witaminy, minerały, zdrowa żywność' WHERE slug = 'suplementy';
UPDATE categories SET description = 'Sprzęt rehabilitacyjny - wózki inwalidzkie, kule, balkoniki, laski' WHERE slug = 'sprzet-rehabilitacyjny';

-- Improve descriptions for Oddam za darmo subcategories
UPDATE categories SET description = 'Meble do oddania - szafy, stoły, krzesła, łóżka za darmo' WHERE slug = 'meble-za-darmo';
UPDATE categories SET description = 'Odzież do oddania - ubrania, buty, dodatki za darmo' WHERE slug = 'odziez-za-darmo';
UPDATE categories SET description = 'Elektronika do oddania - telefony, laptopy, sprzęt RTV za darmo' WHERE slug = 'elektronika-za-darmo';
UPDATE categories SET description = 'AGD do oddania - pralki, lodówki, kuchenki za darmo' WHERE slug = 'agd-za-darmo';
UPDATE categories SET description = 'Rzeczy dla dzieci za darmo - zabawki, ubranka, wózki do oddania' WHERE slug = 'dla-dzieci-za-darmo';
UPDATE categories SET description = 'Książki do oddania - literatura różna za darmo' WHERE slug = 'ksiazki-za-darmo';
UPDATE categories SET description = 'Różne rzeczy za darmo - przedmioty, które można odebrać bezpłatnie' WHERE slug = 'inne-za-darmo';

-- Improve descriptions for Zamienię subcategories
UPDATE categories SET description = 'Wymiana elektroniki - zamiana telefonów, laptopów, tabletów' WHERE slug = 'elektronika-na-wymiane';
UPDATE categories SET description = 'Wymiana telefonów - zamiana smartfonów na inne modele' WHERE slug = 'telefony-na-wymiane';
UPDATE categories SET description = 'Wymiana gier i konsol - zamiana gier, PlayStation, Xbox, Nintendo' WHERE slug = 'gry-i-konsole-na-wymiane';
UPDATE categories SET description = 'Wymiana odzieży - zamiana ubrań, butów, dodatków' WHERE slug = 'odziez-na-wymiane';
UPDATE categories SET description = 'Różne wymiany - zamiana innych przedmiotów' WHERE slug = 'inne-na-wymiane';

-- Improve descriptions for Inne subcategories
UPDATE categories SET description = 'Bilety - bilety na koncerty, festiwale, mecze, wydarzenia' WHERE slug = 'bilety';
UPDATE categories SET description = 'Vouchery i bony - bony podarunkowe, vouchery do sklepów i usług' WHERE slug = 'vouchery';
UPDATE categories SET description = 'Zgubione i znalezione - ogłoszenia o zgubionych lub znalezionych rzeczach' WHERE slug = 'stracone-i-znalezione';
UPDATE categories SET description = 'Różne ogłoszenia - pozostałe ogłoszenia nieprzypisane do innych kategorii' WHERE slug = 'rozne';
