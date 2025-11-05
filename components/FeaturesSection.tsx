'use client'

import { FeatureCard } from '@/components/FeatureCard'
import { ClickHintAnimation } from '@/components/ClickHintAnimation'
import { TapHintAnimation } from '@/components/TapHintAnimation'
import { ScrollGradients } from '@/components/ScrollGradients'
import { ScrollIndicator } from '@/components/ScrollIndicator'

export function FeaturesSection() {
  return (
    <section className="container mx-auto px-6 py-3 md:py-14">
      <div className="mb-8 relative">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Dlaczego FindSomeone?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Prosta, bezpieczna platforma do lokalnej wymiany pomocy i usług
          </p>
        </div>
        {/* Click animation hint - desktop only */}
        <div className="hidden md:block absolute right-8 lg:right-12 xl:right-16 2xl:right-20 top-1/2 -translate-y-1/2">
          <ClickHintAnimation />
        </div>
        {/* Tap animation hint - mobile only (hidden on very small screens) */}
        <div className="hidden min-[430px]:block md:hidden absolute right-6 bottom-0 translate-y-6">
          <TapHintAnimation />
        </div>
      </div>

      {/* Mobile: Horizontal scroll carousel */}
      <div className="relative -mx-6 md:hidden">
        <ScrollGradients containerId="features-scroll-mobile" />

        <div
          id="features-scroll-mobile"
          className="overflow-x-auto overflow-y-visible snap-x snap-mandatory scrollbar-hide w-full"
        >
          <div className="horizontal-scroll-padding-mobile flex gap-4 pb-2">
          <div className="flex-shrink-0 snap-center" style={{ width: '280px' }}>
            <FeatureCard
              title="Całkowicie darmowe"
              description="Dodawanie ogłoszeń bez opłat i limitów. Publikuj gdzie i ile chcesz, kiedy tylko chcesz!"
              expandedContent="Nie ma żadnych ukrytych kosztów. Możesz dodawać nieograniczoną liczbę ogłoszeń, edytować je w dowolnym momencie i promować swoje usługi całkowicie za darmo. Nasza misja to łączenie ludzi bez barier finansowych."
            />
          </div>

          <div className="flex-shrink-0 snap-center" style={{ width: '280px' }}>
            <FeatureCard
              title="Bezpieczny kontakt"
              description="Wbudowany system wiadomości. Negocjuj warunki i ustalaj szczegóły bez podawania numeru telefonu."
              expandedContent="System wiadomości jest zintegrowany w platformie - możesz bezpiecznie komunikować się z innymi użytkownikami, załączać zdjęcia i negocjować warunki. Twój numer telefonu pozostaje prywatny do momentu, aż zdecydujesz się go udostępnić."
            />
          </div>

          <div className="flex-shrink-0 snap-center" style={{ width: '280px' }}>
            <FeatureCard
              title="Przemyślany design"
              description="Przepiękny UX/UI z przemyślanymi funkcjami i perfekcyjnym dostosowaniem do urządzeń mobilnych."
              expandedContent="Każdy element interfejsu został starannie zaprojektowany z myślą o Twojej wygodzie. Responsywny design działa płynnie na wszystkich urządzeniach - od telefonu przez tablet po komputer. Intuicyjna nawigacja, ciemny motyw i przemyślane funkcje sprawiają, że korzystanie z platformy to prawdziwa przyjemność."
            />
          </div>

          <div className="flex-shrink-0 snap-center" style={{ width: '280px' }}>
            <FeatureCard
              title="Czat AI"
              description="Nawigatorek - bot który chętnie odpowie na Twoje pytania i pomoże znaleźć to czego szukasz."
              expandedContent="Nawigatorek to inteligentny asystent AI, który pomoże Ci szybko znaleźć odpowiednie ogłoszenia. Zadaj pytanie w naturalnym języku, a Nawigatorek przeszuka bazę ogłoszeń i podpowie najlepsze opcje. Dostępny dla zalogowanych użytkowników."
            />
          </div>
        </div>
        </div>
        <ScrollIndicator containerId="features-scroll-mobile" />
      </div>

      {/* Tablet & Desktop: Grid layout */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <FeatureCard
          title="Całkowicie darmowe"
          description="Dodawanie ogłoszeń bez opłat i limitów. Publikuj gdzie i ile chcesz, kiedy tylko chcesz!"
          expandedContent="Nie ma żadnych ukrytych kosztów. Możesz dodawać nieograniczoną liczbę ogłoszeń, edytować je w dowolnym momencie i promować swoje usługi całkowicie za darmo. Nasza misja to łączenie ludzi bez barier finansowych."
        />

        <FeatureCard
          title="Bezpieczny kontakt"
          description="Wbudowany system wiadomości. Negocjuj warunki i ustalaj szczegóły bez podawania numeru telefonu."
          expandedContent="System wiadomości jest zintegrowany w platformie - możesz bezpiecznie komunikować się z innymi użytkownikami, załączać zdjęcia i negocjować warunki. Twój numer telefonu pozostaje prywatny do momentu, aż zdecydujesz się go udostępnić."
        />

        <FeatureCard
          title="Przemyślany design"
          description="Przepiękny UX/UI z przemyślanymi funkcjami i perfekcyjnym dostosowaniem do urządzeń mobilnych."
          expandedContent="Każdy element interfejsu został starannie zaprojektowany z myślą o Twojej wygodzie. Responsywny design działa płynnie na wszystkich urządzeniach - od telefonu przez tablet po komputer. Intuicyjna nawigacja, ciemny motyw i przemyślane funkcje sprawiają, że korzystanie z platformy to prawdziwa przyjemność."
        />

        <FeatureCard
          title="Czat AI"
          description="Nawigatorek - bot który chętnie odpowie na Twoje pytania i pomoże znaleźć to czego szukasz."
          expandedContent="Nawigatorek to inteligentny asystent AI, który pomoże Ci szybko znaleźć odpowiednie ogłoszenia. Zadaj pytanie w naturalnym języku, a Nawigatorek przeszuka bazę ogłoszeń i podpowie najlepsze opcje. Dostępny dla zalogowanych użytkowników."
        />
      </div>
    </section>
  )
}
