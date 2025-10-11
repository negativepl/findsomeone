/**
 * Script to fetch Polish cities data and generate SQL insert statements
 *
 * This uses a curated list of major Polish cities with their voivodeships
 * For a complete list, you would need to integrate with GUS API or use external datasets
 */

interface City {
  name: string
  voivodeship: string
  population: number
  latitude?: number
  longitude?: number
  popular?: boolean
}

// Major Polish cities by voivodeship
const polishCities: City[] = [
  // Mazowieckie
  { name: 'Warszawa', voivodeship: 'Mazowieckie', population: 1793579, popular: true, latitude: 52.2297, longitude: 21.0122 },
  { name: 'Radom', voivodeship: 'Mazowieckie', population: 210532, popular: true },
  { name: 'Płock', voivodeship: 'Mazowieckie', population: 117128 },
  { name: 'Siedlce', voivodeship: 'Mazowieckie', population: 77990 },
  { name: 'Ostrołęka', voivodeship: 'Mazowieckie', population: 51012 },

  // Małopolskie
  { name: 'Kraków', voivodeship: 'Małopolskie', population: 779115, popular: true, latitude: 50.0647, longitude: 19.9450 },
  { name: 'Tarnów', voivodeship: 'Małopolskie', population: 106278 },
  { name: 'Nowy Sącz', voivodeship: 'Małopolskie', population: 83116 },

  // Śląskie
  { name: 'Katowice', voivodeship: 'Śląskie', population: 292774, popular: true, latitude: 50.2649, longitude: 19.0238 },
  { name: 'Częstochowa', voivodeship: 'Śląskie', population: 217530, popular: true },
  { name: 'Sosnowiec', voivodeship: 'Śląskie', population: 197586 },
  { name: 'Gliwice', voivodeship: 'Śląskie', population: 175102 },
  { name: 'Zabrze', voivodeship: 'Śląskie', population: 169756 },
  { name: 'Bielsko-Biała', voivodeship: 'Śląskie', population: 168319 },
  { name: 'Bytom', voivodeship: 'Śląskie', population: 160624 },
  { name: 'Ruda Śląska', voivodeship: 'Śląskie', population: 135303 },
  { name: 'Rybnik', voivodeship: 'Śląskie', population: 135327 },
  { name: 'Tychy', voivodeship: 'Śląskie', population: 127831 },

  // Dolnośląskie
  { name: 'Wrocław', voivodeship: 'Dolnośląskie', population: 641928, popular: true, latitude: 51.1079, longitude: 17.0385 },
  { name: 'Wałbrzych', voivodeship: 'Dolnośląskie', population: 110140 },
  { name: 'Legnica', voivodeship: 'Dolnośląskie', population: 99350 },

  // Wielkopolskie
  { name: 'Poznań', voivodeship: 'Wielkopolskie', population: 529410, popular: true, latitude: 52.4064, longitude: 16.9252 },
  { name: 'Kalisz', voivodeship: 'Wielkopolskie', population: 99106 },
  { name: 'Konin', voivodeship: 'Wielkopolskie', population: 72420 },

  // Zachodniopomorskie
  { name: 'Szczecin', voivodeship: 'Zachodniopomorskie', population: 396168, popular: true, latitude: 53.4285, longitude: 14.5528 },
  { name: 'Koszalin', voivodeship: 'Zachodniopomorskie', population: 107680 },
  { name: 'Stargard', voivodeship: 'Zachodniopomorskie', population: 67293 },

  // Lubelskie
  { name: 'Lublin', voivodeship: 'Lubelskie', population: 337944, popular: true, latitude: 51.2465, longitude: 22.5684 },
  { name: 'Chełm', voivodeship: 'Lubelskie', population: 61895 },
  { name: 'Zamość', voivodeship: 'Lubelskie', population: 62397 },

  // Podkarpackie
  { name: 'Rzeszów', voivodeship: 'Podkarpackie', population: 196208, popular: true, latitude: 50.0412, longitude: 21.9991 },
  { name: 'Przemyśl', voivodeship: 'Podkarpackie', population: 60442 },
  { name: 'Stalowa Wola', voivodeship: 'Podkarpackie', population: 59388 },

  // Łódzkie
  { name: 'Łódź', voivodeship: 'Łódzkie', population: 670642, popular: true, latitude: 51.7592, longitude: 19.4560 },
  { name: 'Piotrków Trybunalski', voivodeship: 'Łódzkie', population: 71252 },

  // Kujawsko-Pomorskie
  { name: 'Bydgoszcz', voivodeship: 'Kujawsko-Pomorskie', population: 344091, popular: true, latitude: 53.1235, longitude: 18.0084 },
  { name: 'Toruń', voivodeship: 'Kujawsko-Pomorskie', population: 196935, popular: true },
  { name: 'Włocławek', voivodeship: 'Kujawsko-Pomorskie', population: 106928 },

  // Pomorskie
  { name: 'Gdańsk', voivodeship: 'Pomorskie', population: 470907, popular: true, latitude: 54.3520, longitude: 18.6466 },
  { name: 'Gdynia', voivodeship: 'Pomorskie', population: 243918, popular: true },
  { name: 'Słupsk', voivodeship: 'Pomorskie', population: 90879 },

  // Warmińsko-Mazurskie
  { name: 'Olsztyn', voivodeship: 'Warmińsko-Mazurskie', population: 171249, popular: true, latitude: 53.7784, longitude: 20.4801 },
  { name: 'Elbląg', voivodeship: 'Warmińsko-Mazurskie', population: 119317 },

  // Lubuskie
  { name: 'Gorzów Wielkopolski', voivodeship: 'Lubuskie', population: 122762 },
  { name: 'Zielona Góra', voivodeship: 'Lubuskie', population: 140297, popular: true },

  // Podlaskie
  { name: 'Białystok', voivodeship: 'Podlaskie', population: 296958, popular: true, latitude: 53.1325, longitude: 23.1688 },
  { name: 'Suwałki', voivodeship: 'Podlaskie', population: 69317 },

  // Świętokrzyskie
  { name: 'Kielce', voivodeship: 'Świętokrzyskie', population: 192468, popular: true, latitude: 50.8661, longitude: 20.6286 },

  // Opolskie
  { name: 'Opole', voivodeship: 'Opolskie', population: 127839, popular: true, latitude: 50.6751, longitude: 17.9213 },
]

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ł/g, 'l')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function generateSQL(): string {
  const values = polishCities.map(city => {
    const slug = slugify(city.name)
    const popular = city.popular ? 'true' : 'false'
    const lat = city.latitude || 'NULL'
    const lng = city.longitude || 'NULL'

    return `  ('${city.name}', '${slug}', '${city.voivodeship}', ${city.population}, ${lat}, ${lng}, ${popular})`
  }).join(',\n')

  return `-- Insert Polish cities data
INSERT INTO public.cities (name, slug, voivodeship, population, latitude, longitude, popular)
VALUES
${values}
ON CONFLICT (slug) DO UPDATE SET
  population = EXCLUDED.population,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  popular = EXCLUDED.popular;
`
}

// Generate and write SQL
const sql = generateSQL()
console.log(sql)
console.log(`\n-- Total cities: ${polishCities.length}`)
console.log(`-- Popular cities: ${polishCities.filter(c => c.popular).length}`)
