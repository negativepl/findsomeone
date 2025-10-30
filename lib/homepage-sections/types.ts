// Homepage section types and configurations

export type SectionType =
  | 'seeking_help'
  | 'offering_help'
  | 'newest_posts'
  | 'city_based'
  | 'popular_categories'
  | 'recently_viewed'
  | 'hero_banner'
  | 'custom_html'
  | 'custom_content'
  | 'testimonials'
  | 'faq'
  | 'stats'
  | 'features'
  | 'cta'
  | 'image_gallery'
  | 'spacer'

export interface HomepageSection {
  id: string
  type: SectionType
  title?: string
  subtitle?: string
  is_active: boolean
  sort_order: number
  config: Record<string, any>
  // Colors
  background_color?: string
  text_color?: string
  // Spacing
  padding_top?: number
  padding_bottom?: number
  padding_left?: number
  padding_right?: number
  margin_top?: number
  margin_bottom?: number
  // Container
  container_width?: 'full' | 'boxed' | 'narrow'
  container_classes?: string
  // Border & Shadow
  border_width?: number
  border_color?: string
  border_radius?: number
  box_shadow?: string
  // Background Image
  background_image_url?: string
  background_size?: 'cover' | 'contain' | 'auto'
  background_position?: string
  background_overlay_opacity?: number
  background_overlay_color?: string
  // Visibility
  visible_on_mobile: boolean
  visible_on_desktop: boolean
  // Timestamps
  created_at: string
  updated_at: string
}

// Configuration schemas for each section type
export interface SeekingHelpConfig {
  limit?: number
  show_see_all_button?: boolean
  category_filter?: string[]
  sort_by?: 'created_at' | 'price' | 'views'
  sort_order?: 'asc' | 'desc'
}

export interface OfferingHelpConfig {
  limit?: number
  show_see_all_button?: boolean
  category_filter?: string[]
  sort_by?: 'created_at' | 'price' | 'views'
  sort_order?: 'asc' | 'desc'
}

export interface NewestPostsConfig {
  limit?: number
  category_filter?: string[]
  sort_by?: 'created_at' | 'price' | 'views'
  sort_order?: 'asc' | 'desc'
}

export interface CityBasedConfig {
  limit?: number
  use_geolocation?: boolean
  fallback_city?: string
  show_see_all_button?: boolean
}

export interface PopularCategoriesConfig {
  limit?: number
  layout?: 'grid' | 'carousel'
  layout_mobile?: 'grid' | 'carousel'
  layout_desktop?: 'grid' | 'carousel'
}

export interface RecentlyViewedConfig {
  limit?: number
}

export interface HeroBannerConfig {
  title: string
  subtitle?: string
  description?: string
  background_image_url?: string
  background_attachment?: 'scroll' | 'fixed' | 'parallax'
  container_width?: 'full' | 'container' | '7xl' | '6xl' | '5xl' | '4xl' | '3xl'
  overlay_opacity?: number
  overlay_color?: string
  overlay_blur?: number
  border_width?: number
  border_color?: string
  border_radius?: number
  button_text?: string
  button_link?: string
  button_color?: string
  button_text_color?: string
  button_text_secondary?: string
  button_link_secondary?: string
  button_color_secondary?: string
  button_text_color_secondary?: string
  height?: 'small' | 'medium' | 'large' | 'full'
  text_alignment?: 'left' | 'center' | 'right'
}

export interface CustomHTMLConfig {
  html_content: string
  css_classes?: string
  container_classes?: string
}

export interface CustomContentConfig {
  content: string
  content_column_2?: string
  content_column_3?: string
  layout?: 'single' | 'two-column' | 'three-column'
  text_alignment?: 'left' | 'center' | 'right'
  background_color?: string
  text_color?: string
}

export interface TestimonialsConfig {
  testimonials: {
    name: string
    role?: string
    company?: string
    avatar_url?: string
    rating?: number
    text: string
  }[]
  layout?: 'grid' | 'carousel' | 'list'
  show_ratings?: boolean
  columns?: number
}

export interface FAQConfig {
  items: {
    question: string
    answer: string
  }[]
  layout?: 'accordion' | 'grid'
  columns?: number
}

export interface StatsConfig {
  stats: {
    number: number
    label: string
    icon?: string
    suffix?: string
    prefix?: string
  }[]
  layout?: 'horizontal' | 'grid'
  columns?: number
  animate?: boolean
}

export interface FeaturesConfig {
  features: {
    title: string
    description: string
    icon?: string
  }[]
  layout?: 'grid' | 'list'
  columns?: number
}

export interface CTAConfig {
  heading: string
  subheading?: string
  description?: string
  button_text: string
  button_link: string
  button_text_secondary?: string
  button_link_secondary?: string
  text_alignment?: 'left' | 'center' | 'right'
  button_color?: string
  button_text_color?: string
  button_color_secondary?: string
  button_text_color_secondary?: string
}

export interface ImageGalleryConfig {
  images: {
    url: string
    alt?: string
    caption?: string
  }[]
  layout?: 'grid' | 'masonry' | 'carousel'
  columns?: number
  lightbox?: boolean
}

export interface SpacerConfig {
  height_desktop?: number
  height_mobile?: number
}

// Section metadata for the builder UI
export interface SectionTypeMetadata {
  type: SectionType
  label: string
  description: string
  icon: string // SVG path or component name
  defaultConfig: Record<string, any>
  configSchema: {
    name: string
    label: string
    type: 'text' | 'number' | 'boolean' | 'select' | 'multi-select' | 'textarea' | 'color'
    options?: { value: string; label: string }[]
    default?: any
    placeholder?: string
    description?: string
  }[]
}

export const SECTION_TYPES: Record<SectionType, SectionTypeMetadata> = {
  seeking_help: {
    type: 'seeking_help',
    label: 'Ogłoszenia',
    description: 'Wyświetla najnowsze ogłoszenia',
    icon: 'search',
    defaultConfig: {
      limit: 8,
      show_see_all_button: true,
      sort_by: 'created_at',
      sort_order: 'desc'
    },
    configSchema: [
      {
        name: 'limit',
        label: 'Liczba postów',
        type: 'number',
        default: 8,
        description: 'Ile postów wyświetlić w sekcji'
      },
      {
        name: 'sort_by',
        label: 'Sortuj według',
        type: 'select',
        options: [
          { value: 'created_at', label: 'Data dodania' },
          { value: 'price', label: 'Cena' },
          { value: 'views', label: 'Wyświetlenia' }
        ],
        default: 'created_at'
      },
      {
        name: 'sort_order',
        label: 'Kolejność',
        type: 'select',
        options: [
          { value: 'desc', label: 'Malejąco' },
          { value: 'asc', label: 'Rosnąco' }
        ],
        default: 'desc'
      },
      {
        name: 'show_see_all_button',
        label: 'Pokaż przycisk "Zobacz wszystkie"',
        type: 'boolean',
        default: true
      },
      {
        name: 'category_filter',
        label: 'Filtr kategorii',
        type: 'multi-select',
        description: 'Wybierz kategorie do wyświetlenia (puste = wszystkie)'
      }
    ]
  },
  offering_help: {
    type: 'offering_help',
    label: 'Polecane ogłoszenia',
    description: 'Wyświetla polecane ogłoszenia',
    icon: 'hand',
    defaultConfig: {
      limit: 8,
      show_see_all_button: true,
      sort_by: 'created_at',
      sort_order: 'desc'
    },
    configSchema: [
      {
        name: 'limit',
        label: 'Liczba postów',
        type: 'number',
        default: 8
      },
      {
        name: 'sort_by',
        label: 'Sortuj według',
        type: 'select',
        options: [
          { value: 'created_at', label: 'Data dodania' },
          { value: 'price', label: 'Cena' },
          { value: 'views', label: 'Wyświetlenia' }
        ],
        default: 'created_at'
      },
      {
        name: 'sort_order',
        label: 'Kolejność',
        type: 'select',
        options: [
          { value: 'desc', label: 'Malejąco' },
          { value: 'asc', label: 'Rosnąco' }
        ],
        default: 'desc'
      },
      {
        name: 'show_see_all_button',
        label: 'Pokaż przycisk "Zobacz wszystkie"',
        type: 'boolean',
        default: true
      },
      {
        name: 'category_filter',
        label: 'Filtr kategorii',
        type: 'multi-select'
      }
    ]
  },
  newest_posts: {
    type: 'newest_posts',
    label: 'Nowe ogłoszenia',
    description: 'Wyświetla najnowsze posty',
    icon: 'clock',
    defaultConfig: {
      limit: 8,
      sort_by: 'created_at',
      sort_order: 'desc'
    },
    configSchema: [
      {
        name: 'limit',
        label: 'Liczba postów',
        type: 'number',
        default: 8
      },
      {
        name: 'sort_by',
        label: 'Sortuj według',
        type: 'select',
        options: [
          { value: 'created_at', label: 'Data dodania' },
          { value: 'price', label: 'Cena' },
          { value: 'views', label: 'Wyświetlenia' }
        ],
        default: 'created_at'
      },
      {
        name: 'sort_order',
        label: 'Kolejność',
        type: 'select',
        options: [
          { value: 'desc', label: 'Malejąco' },
          { value: 'asc', label: 'Rosnąco' }
        ],
        default: 'desc'
      },
      {
        name: 'category_filter',
        label: 'Filtr kategorii',
        type: 'multi-select'
      }
    ]
  },
  city_based: {
    type: 'city_based',
    label: 'W Twoim mieście',
    description: 'Wyświetla posty z lokalizacji użytkownika',
    icon: 'location',
    defaultConfig: {
      limit: 8,
      use_geolocation: true,
      show_see_all_button: true
    },
    configSchema: [
      {
        name: 'limit',
        label: 'Liczba postów',
        type: 'number',
        default: 8
      },
      {
        name: 'use_geolocation',
        label: 'Użyj geolokalizacji',
        type: 'boolean',
        default: true,
        description: 'Automatycznie wykryj miasto użytkownika'
      },
      {
        name: 'fallback_city',
        label: 'Miasto rezerwowe',
        type: 'text',
        placeholder: 'np. Warszawa',
        description: 'Jeśli geolokalizacja nie działa'
      },
      {
        name: 'show_see_all_button',
        label: 'Pokaż przycisk "Zobacz wszystkie"',
        type: 'boolean',
        default: true
      }
    ]
  },
  popular_categories: {
    type: 'popular_categories',
    label: 'Popularne kategorie',
    description: 'Wyświetla najpopularniejsze kategorie',
    icon: 'grid',
    defaultConfig: {
      limit: 8,
      layout_mobile: 'carousel',
      layout_desktop: 'grid'
    },
    configSchema: [
      {
        name: 'limit',
        label: 'Liczba kategorii',
        type: 'number',
        default: 8
      },
      {
        name: 'layout_mobile',
        label: 'Układ na mobile',
        type: 'select',
        options: [
          { value: 'grid', label: 'Siatka' },
          { value: 'carousel', label: 'Karuzela' }
        ],
        default: 'carousel',
        description: 'Układ wyświetlania na urządzeniach mobilnych'
      },
      {
        name: 'layout_desktop',
        label: 'Układ na desktop',
        type: 'select',
        options: [
          { value: 'grid', label: 'Siatka' },
          { value: 'carousel', label: 'Karuzela' }
        ],
        default: 'grid',
        description: 'Układ wyświetlania na komputerach'
      }
    ]
  },
  recently_viewed: {
    type: 'recently_viewed',
    label: 'Ostatnio wyświetlane',
    description: 'Wyświetla ostatnio przeglądane posty',
    icon: 'eye',
    defaultConfig: {
      limit: 8
    },
    configSchema: [
      {
        name: 'limit',
        label: 'Liczba postów',
        type: 'number',
        default: 8
      }
    ]
  },
  hero_banner: {
    type: 'hero_banner',
    label: 'Baner/Hero',
    description: 'Duży baner promocyjny z obrazkiem i przyciskami',
    icon: 'photo',
    defaultConfig: {
      title: 'Tytuł banera',
      subtitle: 'Podtytuł',
      description: 'Opis banera',
      background_image_url: '',
      background_attachment: 'scroll',
      container_width: 'full',
      overlay_opacity: 50,
      overlay_color: '#000000',
      overlay_blur: 0,
      border_width: 0,
      border_color: '#000000',
      border_radius: 0,
      button_text: 'Dowiedz się więcej',
      button_link: '/posts',
      button_color: '#C44E35',
      button_text_color: '#FFFFFF',
      button_color_secondary: '#FFFFFF',
      button_text_color_secondary: '#000000',
      height: 'medium',
      text_alignment: 'center'
    },
    configSchema: [
      {
        name: 'title',
        label: 'Tytuł',
        type: 'text',
        placeholder: 'Tytuł banera'
      },
      {
        name: 'subtitle',
        label: 'Podtytuł',
        type: 'text',
        placeholder: 'Podtytuł'
      },
      {
        name: 'description',
        label: 'Opis',
        type: 'textarea',
        placeholder: 'Opis banera...'
      },
      {
        name: 'background_image_url',
        label: 'URL obrazka tła',
        type: 'text',
        placeholder: 'https://example.com/image.jpg',
        description: 'Link do obrazka tła (Unsplash, Imgur, etc.)'
      },
      {
        name: 'background_attachment',
        label: 'Zachowanie tła',
        type: 'select',
        options: [
          { value: 'scroll', label: 'Przewijane (normalne)' },
          { value: 'fixed', label: 'Stałe (fixed)' },
          { value: 'parallax', label: 'Parallax (efekt głębi)' }
        ],
        default: 'scroll',
        description: 'Jak tło zachowuje się przy przewijaniu strony'
      },
      {
        name: 'container_width',
        label: 'Szerokość kontenera',
        type: 'select',
        options: [
          { value: 'full', label: 'Pełna szerokość' },
          { value: 'container', label: 'Standardowy kontener (1424px→1168px→912px→656px)' },
          { value: '7xl', label: 'max-w-7xl (1280px)' },
          { value: '6xl', label: 'max-w-6xl (1152px)' },
          { value: '5xl', label: 'max-w-5xl (1024px)' },
          { value: '4xl', label: 'max-w-4xl (896px)' },
          { value: '3xl', label: 'max-w-3xl (768px)' }
        ],
        default: 'full',
        description: 'Szerokość sekcji banera - "Standardowy kontener" dopasowuje się do breakpointów projektu'
      },
      {
        name: 'height',
        label: 'Wysokość banera',
        type: 'select',
        options: [
          { value: 'small', label: 'Mała (300px)' },
          { value: 'medium', label: 'Średnia (500px)' },
          { value: 'large', label: 'Duża (700px)' },
          { value: 'full', label: 'Pełny ekran' }
        ],
        default: 'medium'
      },
      {
        name: 'overlay_opacity',
        label: 'Krycie nakładki (%)',
        type: 'number',
        default: 50,
        description: 'Intensywność nakładki - 0 = transparentne, 100 = nieprzezroczyste'
      },
      {
        name: 'overlay_blur',
        label: 'Rozmycie nakładki (px)',
        type: 'number',
        default: 0,
        description: 'Efekt rozmycia (blur) dla tła - 0 = brak, 20 = silne rozmycie'
      },
      {
        name: 'overlay_color',
        label: 'Kolor nakładki',
        type: 'color',
        default: '#000000',
        description: 'Kolor nakładki na obrazku tła'
      },
      {
        name: 'border_width',
        label: 'Szerokość ramki (px)',
        type: 'number',
        default: 0,
        description: 'Grubość obramowania sekcji - 0 = brak ramki'
      },
      {
        name: 'border_color',
        label: 'Kolor ramki',
        type: 'color',
        default: '#000000',
        description: 'Kolor obramowania sekcji'
      },
      {
        name: 'border_radius',
        label: 'Zaokrąglenie rogów (px)',
        type: 'number',
        default: 0,
        description: 'Promień zaokrąglenia rogów - 0 = ostre rogi, 24 = bardzo zaokrąglone'
      },
      {
        name: 'text_alignment',
        label: 'Wyrównanie tekstu',
        type: 'select',
        options: [
          { value: 'left', label: 'Do lewej' },
          { value: 'center', label: 'Do środka' },
          { value: 'right', label: 'Do prawej' }
        ],
        default: 'center'
      },
      {
        name: 'button_text',
        label: 'Tekst przycisku głównego',
        type: 'text',
        placeholder: 'Dowiedz się więcej'
      },
      {
        name: 'button_link',
        label: 'Link przycisku głównego',
        type: 'text',
        placeholder: '/posts'
      },
      {
        name: 'button_color',
        label: 'Kolor tła przycisku głównego',
        type: 'color',
        default: '#C44E35',
        description: 'Kolor tła przycisku głównego'
      },
      {
        name: 'button_text_color',
        label: 'Kolor tekstu przycisku głównego',
        type: 'color',
        default: '#FFFFFF',
        description: 'Kolor tekstu na przycisku głównym'
      },
      {
        name: 'button_text_secondary',
        label: 'Tekst przycisku drugiego (opcjonalny)',
        type: 'text',
        placeholder: 'Przeglądaj'
      },
      {
        name: 'button_link_secondary',
        label: 'Link przycisku drugiego',
        type: 'text',
        placeholder: '/categories'
      },
      {
        name: 'button_color_secondary',
        label: 'Kolor tła przycisku drugiego',
        type: 'color',
        default: '#FFFFFF',
        description: 'Kolor tła przycisku drugiego'
      },
      {
        name: 'button_text_color_secondary',
        label: 'Kolor tekstu przycisku drugiego',
        type: 'color',
        default: '#000000',
        description: 'Kolor tekstu na przycisku drugim'
      }
    ]
  },
  custom_html: {
    type: 'custom_html',
    label: 'Własny HTML',
    description: 'Dodaj własny kod HTML',
    icon: 'code',
    defaultConfig: {
      html_content: '<div class="container mx-auto px-6 py-12"><p>Twoja własna treść HTML</p></div>',
      css_classes: ''
    },
    configSchema: [
      {
        name: 'html_content',
        label: 'Kod HTML',
        type: 'textarea',
        placeholder: '<div>Twoja treść</div>',
        description: 'Uwaga: Używaj tylko zaufanego HTML'
      },
      {
        name: 'css_classes',
        label: 'Klasy CSS',
        type: 'text',
        placeholder: 'my-custom-class another-class'
      }
    ]
  },
  custom_content: {
    type: 'custom_content',
    label: 'Własna treść',
    description: 'Dodaj blok tekstowy z formatowaniem',
    icon: 'document',
    defaultConfig: {
      content: 'Twoja własna treść',
      content_column_2: '',
      content_column_3: '',
      layout: 'single',
      text_alignment: 'left',
      background_color: '#FFFFFF',
      text_color: '#000000'
    },
    configSchema: [
      {
        name: 'layout',
        label: 'Układ',
        type: 'select',
        options: [
          { value: 'single', label: 'Jedna kolumna' },
          { value: 'two-column', label: 'Dwie kolumny' },
          { value: 'three-column', label: 'Trzy kolumny' }
        ],
        default: 'single'
      },
      {
        name: 'text_alignment',
        label: 'Wyrównanie tekstu',
        type: 'select',
        options: [
          { value: 'left', label: 'Do lewej' },
          { value: 'center', label: 'Do środka' },
          { value: 'right', label: 'Do prawej' }
        ],
        default: 'left',
        description: 'Wyrównanie tekstu we wszystkich kolumnach'
      },
      {
        name: 'content',
        label: 'Treść kolumny 1',
        type: 'textarea',
        placeholder: 'Wpisz treść dla pierwszej kolumny...',
        rows: 8
      },
      {
        name: 'content_column_2',
        label: 'Treść kolumny 2',
        type: 'textarea',
        placeholder: 'Wpisz treść dla drugiej kolumny...',
        rows: 8
      },
      {
        name: 'content_column_3',
        label: 'Treść kolumny 3',
        type: 'textarea',
        placeholder: 'Wpisz treść dla trzeciej kolumny...',
        rows: 8
      }
    ]
  },
  testimonials: {
    type: 'testimonials',
    label: 'Opinie klientów',
    description: 'Wyświetla opinie i referencje',
    icon: 'message-square',
    defaultConfig: {
      testimonials: [
        {
          name: "Jan Kowalski",
          role: "CEO",
          company: "Firma XYZ",
          avatar_url: "https://i.pravatar.cc/150?img=1",
          rating: 5,
          text: "Świetna usługa! Polecam każdemu. Wszystko przebiegło sprawnie i profesjonalnie."
        },
        {
          name: "Anna Nowak",
          role: "Marketing Manager",
          company: "ABC Sp. z o.o.",
          avatar_url: "https://i.pravatar.cc/150?img=5",
          rating: 5,
          text: "Bardzo wysoka jakość wykonania. Jestem w pełni zadowolona z rezultatów."
        },
        {
          name: "Piotr Wiśniewski",
          role: "Przedsiębiorca",
          company: "",
          avatar_url: "https://i.pravatar.cc/150?img=3",
          rating: 4,
          text: "Dobra komunikacja i terminowość. Na pewno skorzystam ponownie."
        }
      ],
      layout: 'grid',
      show_ratings: true,
      columns: 3
    },
    configSchema: [
      {
        name: 'testimonials',
        label: 'Opinie (JSON)',
        type: 'textarea',
        placeholder: `[
  {
    "name": "Jan Kowalski",
    "role": "CEO",
    "company": "Firma XYZ",
    "avatar_url": "https://i.pravatar.cc/150?img=1",
    "rating": 5,
    "text": "Świetna usługa! Polecam każdemu."
  }
]`,
        description: 'Lista opinii w formacie JSON. Każda opinia: name, role, company, avatar_url, rating (1-5), text'
      },
      {
        name: 'layout',
        label: 'Układ',
        type: 'select',
        options: [
          { value: 'grid', label: 'Siatka' },
          { value: 'carousel', label: 'Karuzela' },
          { value: 'list', label: 'Lista' }
        ],
        default: 'grid'
      },
      {
        name: 'columns',
        label: 'Liczba kolumn',
        type: 'number',
        default: 3
      },
      {
        name: 'show_ratings',
        label: 'Pokaż oceny gwiazdkowe',
        type: 'boolean',
        default: true
      }
    ]
  },
  faq: {
    type: 'faq',
    label: 'FAQ',
    description: 'Najczęściej zadawane pytania',
    icon: 'help-circle',
    defaultConfig: {
      items: [
        {
          question: "Jak mogę skontaktować się z wykonawcą?",
          answer: "Możesz skontaktować się przez formularz kontaktowy dostępny w każdym ogłoszeniu lub bezpośrednio przez podany numer telefonu."
        },
        {
          question: "Czy usługi są bezpłatne?",
          answer: "Przeglądanie ogłoszeń jest całkowicie bezpłatne. Szczegóły dotyczące kosztów usług znajdziesz w każdym ogłoszeniu."
        },
        {
          question: "Jak długo trwa realizacja usługi?",
          answer: "Czas realizacji zależy od rodzaju usługi i jest ustalany indywidualnie z wykonawcą. Zazwyczaj wynosi od 1 do 7 dni roboczych."
        },
        {
          question: "Czy mogę anulować zamówienie?",
          answer: "Tak, możesz anulować zamówienie zgodnie z regulaminem. Szczegóły polityki anulowania znajdziesz w warunkach świadczenia usług."
        }
      ],
      layout: 'accordion',
      columns: 1
    },
    configSchema: [
      {
        name: 'items',
        label: 'Pytania i odpowiedzi (JSON)',
        type: 'textarea',
        placeholder: `[
  {
    "question": "Jak mogę skontaktować się z wykonawcą?",
    "answer": "Możesz skontaktować się przez formularz kontaktowy dostępny w każdym ogłoszeniu."
  },
  {
    "question": "Czy usługi są bezpłatne?",
    "answer": "Przeglądanie ogłoszeń jest bezpłatne. Szczegóły dotyczące usług znajdziesz w każdym ogłoszeniu."
  }
]`,
        description: 'Lista pytań i odpowiedzi w formacie JSON. Każde FAQ: question, answer'
      },
      {
        name: 'layout',
        label: 'Układ',
        type: 'select',
        options: [
          { value: 'accordion', label: 'Akordeon' },
          { value: 'grid', label: 'Siatka' }
        ],
        default: 'accordion'
      },
      {
        name: 'columns',
        label: 'Liczba kolumn',
        type: 'number',
        default: 1
      }
    ]
  },
  stats: {
    type: 'stats',
    label: 'Statystyki',
    description: 'Liczniki i statystyki z animacją',
    icon: 'bar-chart',
    defaultConfig: {
      stats: [
        {
          number: 1000,
          label: "Zadowolonych klientów",
          icon: "Users",
          suffix: "+",
          prefix: ""
        },
        {
          number: 500,
          label: "Zrealizowanych projektów",
          icon: "CheckCircle",
          suffix: "+",
          prefix: ""
        },
        {
          number: 15,
          label: "Lat doświadczenia",
          icon: "Award",
          suffix: "+",
          prefix: ""
        },
        {
          number: 98,
          label: "Zadowolenie klientów",
          icon: "Star",
          suffix: "%",
          prefix: ""
        }
      ],
      layout: 'horizontal',
      columns: 4,
      animate: true
    },
    configSchema: [
      {
        name: 'stats',
        label: 'Statystyki (JSON)',
        type: 'textarea',
        placeholder: `[
  {
    "number": 1000,
    "label": "Zadowolonych klientów",
    "icon": "Users",
    "suffix": "+",
    "prefix": ""
  },
  {
    "number": 500,
    "label": "Zrealizowanych projektów",
    "icon": "CheckCircle",
    "suffix": "+",
    "prefix": ""
  }
]`,
        description: 'Lista statystyk w formacie JSON. Każda stat: number, label, icon (nazwa Lucide), suffix, prefix'
      },
      {
        name: 'layout',
        label: 'Układ',
        type: 'select',
        options: [
          { value: 'horizontal', label: 'Poziomy' },
          { value: 'grid', label: 'Siatka' }
        ],
        default: 'horizontal'
      },
      {
        name: 'columns',
        label: 'Liczba kolumn',
        type: 'number',
        default: 4
      },
      {
        name: 'animate',
        label: 'Animacja liczników',
        type: 'boolean',
        default: true
      }
    ]
  },
  features: {
    type: 'features',
    label: 'Funkcje/Cechy',
    description: 'Wyświetla cechy lub funkcje produktu',
    icon: 'star',
    defaultConfig: {
      features: [
        {
          title: "Szybka realizacja",
          description: "Wykonujemy usługi w ekspresowym tempie bez utraty jakości. Twoja sprawa jest dla nas priorytetem.",
          icon: "Zap"
        },
        {
          title: "Profesjonalizm",
          description: "Doświadczony zespół z wieloletnią praktyką. Gwarantujemy najwyższą jakość wykonania.",
          icon: "Award"
        },
        {
          title: "Konkurencyjne ceny",
          description: "Oferujemy najlepsze ceny na rynku. Bez ukrytych kosztów i dodatkowych opłat.",
          icon: "DollarSign"
        }
      ],
      layout: 'grid',
      columns: 3
    },
    configSchema: [
      {
        name: 'features',
        label: 'Cechy (JSON)',
        type: 'textarea',
        placeholder: `[
  {
    "title": "Szybka realizacja",
    "description": "Wykonujemy usługi w ekspresowym tempie bez utraty jakości.",
    "icon": "Zap"
  },
  {
    "title": "Profesjonalizm",
    "description": "Doświadczony zespół z wieloletnią praktyką.",
    "icon": "Award"
  }
]`,
        description: 'Lista cech w formacie JSON. Każda cecha: title, description, icon (nazwa Lucide)'
      },
      {
        name: 'layout',
        label: 'Układ',
        type: 'select',
        options: [
          { value: 'grid', label: 'Siatka' },
          { value: 'list', label: 'Lista' }
        ],
        default: 'grid'
      },
      {
        name: 'columns',
        label: 'Liczba kolumn',
        type: 'number',
        default: 3
      }
    ]
  },
  cta: {
    type: 'cta',
    label: 'Call to Action',
    description: 'Sekcja z wezwaniem do działania',
    icon: 'zap',
    defaultConfig: {
      heading: 'Gotowy żeby zacząć?',
      subheading: 'Dołącz do tysięcy zadowolonych użytkowników',
      description: '',
      button_text: 'Rozpocznij teraz',
      button_link: '/dashboard/my-posts/new',
      text_alignment: 'center',
      button_color: '#C44E35',
      button_text_color: '#FFFFFF',
      button_color_secondary: '#000000',
      button_text_color_secondary: '#FFFFFF'
    },
    configSchema: [
      {
        name: 'heading',
        label: 'Nagłówek',
        type: 'text',
        placeholder: 'Główny nagłówek'
      },
      {
        name: 'subheading',
        label: 'Podtytuł',
        type: 'text',
        placeholder: 'Podtytuł (opcjonalny)'
      },
      {
        name: 'description',
        label: 'Opis',
        type: 'textarea',
        placeholder: 'Dodatkowy opis...'
      },
      {
        name: 'button_text',
        label: 'Tekst przycisku głównego',
        type: 'text',
        placeholder: 'Rozpocznij teraz'
      },
      {
        name: 'button_link',
        label: 'Link przycisku głównego',
        type: 'text',
        placeholder: '/dashboard/my-posts/new'
      },
      {
        name: 'button_text_secondary',
        label: 'Tekst przycisku drugiego (opcjonalny)',
        type: 'text',
        placeholder: 'Dowiedz się więcej'
      },
      {
        name: 'button_link_secondary',
        label: 'Link przycisku drugiego',
        type: 'text',
        placeholder: '/about'
      },
      {
        name: 'text_alignment',
        label: 'Wyrównanie tekstu',
        type: 'select',
        options: [
          { value: 'left', label: 'Do lewej' },
          { value: 'center', label: 'Do środka' },
          { value: 'right', label: 'Do prawej' }
        ],
        default: 'center'
      },
      {
        name: 'button_color',
        label: 'Kolor przycisku głównego',
        type: 'color',
        default: '#C44E35',
        description: 'Kolor tła przycisku głównego'
      },
      {
        name: 'button_text_color',
        label: 'Kolor tekstu przycisku głównego',
        type: 'color',
        default: '#FFFFFF',
        description: 'Kolor tekstu na przycisku głównym'
      },
      {
        name: 'button_color_secondary',
        label: 'Kolor przycisku drugiego',
        type: 'color',
        default: '#000000',
        description: 'Kolor tła przycisku drugiego (opcjonalny)'
      },
      {
        name: 'button_text_color_secondary',
        label: 'Kolor tekstu przycisku drugiego',
        type: 'color',
        default: '#FFFFFF',
        description: 'Kolor tekstu na przycisku drugim'
      }
    ]
  },
  image_gallery: {
    type: 'image_gallery',
    label: 'Galeria zdjęć',
    description: 'Galeria obrazków z lightboxem',
    icon: 'image',
    defaultConfig: {
      images: [
        {
          url: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800",
          alt: "Przykładowe zdjęcie 1",
          caption: "Profesjonalne wykonanie"
        },
        {
          url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
          alt: "Przykładowe zdjęcie 2",
          caption: "Dbałość o szczegóły"
        },
        {
          url: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800",
          alt: "Przykładowe zdjęcie 3",
          caption: "Najwyższa jakość"
        },
        {
          url: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800",
          alt: "Przykładowe zdjęcie 4",
          caption: "Zadowoleni klienci"
        },
        {
          url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800",
          alt: "Przykładowe zdjęcie 5",
          caption: "Nowoczesne rozwiązania"
        },
        {
          url: "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800",
          alt: "Przykładowe zdjęcie 6",
          caption: "Sprawdzona jakość"
        }
      ],
      layout: 'grid',
      columns: 3,
      lightbox: true
    },
    configSchema: [
      {
        name: 'images',
        label: 'Zdjęcia (JSON)',
        type: 'textarea',
        placeholder: `[
  {
    "url": "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800",
    "alt": "Profesjonalne wykonanie",
    "caption": "Najwyższa jakość usług"
  },
  {
    "url": "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
    "alt": "Dbałość o szczegóły",
    "caption": "Precyzja w każdym detalu"
  },
  {
    "url": "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800",
    "alt": "Nowoczesne rozwiązania",
    "caption": "Innowacyjne podejście"
  }
]`,
        description: 'Lista zdjęć w formacie JSON. Każde zdjęcie: url, alt, caption (opcjonalny)'
      },
      {
        name: 'layout',
        label: 'Układ',
        type: 'select',
        options: [
          { value: 'grid', label: 'Siatka' },
          { value: 'masonry', label: 'Masonry' },
          { value: 'carousel', label: 'Karuzela' }
        ],
        default: 'grid'
      },
      {
        name: 'columns',
        label: 'Liczba kolumn',
        type: 'number',
        default: 3
      },
      {
        name: 'lightbox',
        label: 'Powiększenie po kliknięciu',
        type: 'boolean',
        default: true,
        description: 'Otwórz zdjęcie w pełnym rozmiarze po kliknięciu'
      }
    ]
  },
  spacer: {
    type: 'spacer',
    label: 'Odstęp',
    description: 'Pusty odstęp/separator',
    icon: 'move-vertical',
    defaultConfig: {
      height_desktop: 80,
      height_mobile: 40
    },
    configSchema: [
      {
        name: 'height_desktop',
        label: 'Wysokość na desktop (px)',
        type: 'number',
        default: 80,
        description: 'Wysokość odstępu na urządzeniach desktop'
      },
      {
        name: 'height_mobile',
        label: 'Wysokość na mobile (px)',
        type: 'number',
        default: 40,
        description: 'Wysokość odstępu na urządzeniach mobilnych'
      }
    ]
  }
}
