'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Logo } from '@/components/Logo'
import './about.css'

export function AboutPageClient() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [showTeamShapes, setShowTeamShapes] = useState(false)
  const [showMissionUnderline, setShowMissionUnderline] = useState(false)
  const [animatedSlides, setAnimatedSlides] = useState<Set<number>>(new Set([0])) // Hero starts visible
  const totalSlides = 6

  // Determine if current slide is dark (1, 3, 5 are dark slides with index 1, 3, 5)
  const isDarkSlide = currentSlide === 1 || currentSlide === 3 || currentSlide === 5

  // Track which slides have been animated
  useEffect(() => {
    if (!animatedSlides.has(currentSlide)) {
      const timer = setTimeout(() => {
        setAnimatedSlides(prev => new Set(prev).add(currentSlide))
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [currentSlide, animatedSlides])

  // Show/hide shapes based on current slide
  useEffect(() => {
    if (currentSlide === 4) {
      // Small delay before showing shapes
      const timer = setTimeout(() => setShowTeamShapes(true), 100)
      return () => clearTimeout(timer)
    } else {
      setShowTeamShapes(false)
    }
  }, [currentSlide])

  // Show underline on mission slide
  useEffect(() => {
    if (currentSlide === 1) {
      const timer = setTimeout(() => setShowMissionUnderline(true), 500)
      return () => clearTimeout(timer)
    } else {
      setShowMissionUnderline(false)
    }
  }, [currentSlide])

  const goToSlide = useCallback((index: number) => {
    if (index >= 0 && index < totalSlides && !isTransitioning) {
      setIsTransitioning(true)
      setCurrentSlide(index)
      setTimeout(() => setIsTransitioning(false), 800)
    }
  }, [isTransitioning, totalSlides])

  const nextSlide = useCallback(() => {
    goToSlide(currentSlide + 1)
  }, [currentSlide, goToSlide])

  const prevSlide = useCallback(() => {
    goToSlide(currentSlide - 1)
  }, [currentSlide, goToSlide])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault()
        nextSlide()
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault()
        prevSlide()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [nextSlide, prevSlide])

  // Wheel navigation with debounce
  useEffect(() => {
    let timeout: NodeJS.Timeout
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      if (isTransitioning) return

      clearTimeout(timeout)
      timeout = setTimeout(() => {
        if (e.deltaY > 0) {
          nextSlide()
        } else if (e.deltaY < 0) {
          prevSlide()
        }
      }, 50)
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      window.removeEventListener('wheel', handleWheel)
      clearTimeout(timeout)
    }
  }, [isTransitioning, nextSlide, prevSlide])

  // Touch navigation
  useEffect(() => {
    let touchStart = 0
    let touchEnd = 0

    const handleTouchStart = (e: TouchEvent) => {
      touchStart = e.touches[0].clientY
    }

    const handleTouchEnd = (e: TouchEvent) => {
      touchEnd = e.changedTouches[0].clientY
      const diff = touchStart - touchEnd

      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          nextSlide()
        } else {
          prevSlide()
        }
      }
    }

    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [nextSlide, prevSlide])

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Slide indicator dots - LEFT SIDE */}
      <div className="fixed left-8 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3">
        {Array.from({ length: totalSlides }).map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-500 ${
              currentSlide === index
                ? 'bg-[#C44E35] scale-125'
                : isDarkSlide
                ? 'bg-white/30 hover:bg-white/50'
                : 'bg-black/20 hover:bg-black/40'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Navigation arrow UP - RIGHT SIDE TOP (accounting for navbar height + margin) */}
      <button
        onClick={prevSlide}
        disabled={currentSlide === 0}
        className={`fixed right-8 top-40 z-50 w-12 h-12 rounded-full backdrop-blur-sm flex items-center justify-center shadow-lg transition-all duration-500 ${
          currentSlide === 0
            ? 'opacity-0 pointer-events-none'
            : isDarkSlide
            ? 'bg-white/10 hover:bg-white/20 border border-white/20 opacity-100'
            : 'bg-white/80 hover:bg-white opacity-100'
        }`}
        aria-label="Previous slide"
      >
        <svg className={`w-6 h-6 transition-colors duration-500 ${isDarkSlide ? 'text-white' : 'text-black'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </button>

      {/* Navigation arrow DOWN - RIGHT SIDE BOTTOM */}
      <button
        onClick={nextSlide}
        disabled={currentSlide === totalSlides - 1}
        className={`fixed right-8 bottom-24 z-50 w-12 h-12 rounded-full backdrop-blur-sm flex items-center justify-center shadow-lg transition-all duration-500 ${
          currentSlide === totalSlides - 1
            ? 'opacity-0 pointer-events-none'
            : isDarkSlide
            ? 'bg-white/10 hover:bg-white/20 border border-white/20 opacity-100'
            : 'bg-white/80 hover:bg-white opacity-100'
        }`}
        aria-label="Next slide"
      >
        <svg className={`w-6 h-6 transition-colors duration-500 ${isDarkSlide ? 'text-white' : 'text-black'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Slides Container with transform */}
      <div
        className="absolute inset-0 transition-transform duration-800 ease-in-out"
        style={{
          transform: `translateY(-${currentSlide * 100}vh)`,
        }}
      >
        {/* Slide 1 - Hero */}
        <section className="absolute inset-0 w-full h-screen flex items-center justify-center bg-gradient-to-br from-[#FAF8F3] to-[#F5F1E8]">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-20 w-64 h-64 bg-[#C44E35]/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#F97316]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          </div>

          <div className="relative z-10 text-center px-6 max-w-6xl mx-auto animate-fade-in">
            <div className="mb-8 inline-flex items-center justify-center">
              <div className="px-6 py-3 bg-[#C44E35]/10 rounded-full flex items-center gap-3">
                <Logo className="w-8 h-8" />
                <span className="text-[#C44E35] font-semibold text-lg">FindSomeone</span>
              </div>
            </div>
            <h1 className="text-6xl md:text-8xl font-bold mb-8 text-black leading-none tracking-tight animate-slide-up">
              Łączymy ludzi<br />lokalnie
            </h1>
            <p className="text-2xl md:text-3xl text-black/60 mb-12 leading-relaxed max-w-4xl mx-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
              Platforma stworzona z pasją do budowania społeczności lokalnych
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <a href="/signup">
                <button className="px-10 py-5 rounded-full bg-[#C44E35] text-white font-semibold text-lg min-w-[200px]">
                  Dołącz teraz
                </button>
              </a>
              <a href="/posts">
                <button className="px-10 py-5 rounded-full bg-white text-black font-semibold text-lg min-w-[200px]">
                  Zobacz ogłoszenia
                </button>
              </a>
            </div>
          </div>
        </section>

        {/* Slide 2 - Mission */}
        <section className="absolute inset-0 w-full h-screen flex items-center justify-center bg-[#1A1A1A]" style={{ transform: 'translateY(100vh)' }}>
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#C44E35] to-transparent" />
            <div className="absolute top-40 right-40 w-72 h-72 bg-[#C44E35]/20 rounded-full blur-3xl" />
            <div className="absolute bottom-40 left-40 w-96 h-96 bg-[#F97316]/20 rounded-full blur-3xl" />
          </div>

          <div className={`relative z-10 max-w-6xl mx-auto px-6 text-center section-scale-in ${animatedSlides.has(1) ? 'active' : ''}`}>
            <div className="inline-block mb-8 px-6 py-3 bg-white/10 rounded-full text-white/60 text-lg font-semibold backdrop-blur-sm">
              Nasza misja
            </div>
            <h2 className="text-5xl md:text-7xl font-bold mb-12 text-white leading-tight">
              <span className="relative inline-block pb-2">
                Przystępność
                <span className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r from-white via-[#F97316] to-[#C44E35] transition-all duration-1000 ${showMissionUnderline ? 'w-full opacity-100' : 'w-0 opacity-0'}`}></span>
              </span>
              <br />i{' '}
              <span className="bg-gradient-to-r from-white via-[#F97316] to-[#C44E35] bg-clip-text text-transparent">
                perfekcyjny UX
              </span>
            </h2>
            <p className="text-2xl md:text-3xl text-white/80 leading-relaxed max-w-4xl mx-auto">
              Technologia powinna być prosta i przyjemna. Tworzymy platformę,
              która łączy ludzi w najbardziej intuicyjny sposób – bez zbędnych komplikacji.
            </p>
          </div>
        </section>

        {/* Slide 3 - Values */}
        <section className="absolute inset-0 w-full h-screen flex items-center justify-center bg-gradient-to-br from-[#FAF8F3] to-[#F5F1E8]" style={{ transform: 'translateY(200vh)' }}>
          <div className={`relative z-10 max-w-7xl mx-auto px-6 w-full section-fade-up ${animatedSlides.has(2) ? 'active' : ''}`}>
            <h2 className="text-5xl md:text-6xl font-bold text-black text-center mb-16">
              Nasze cechy
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-0 rounded-3xl bg-white shadow-xl transition-all duration-300">
                <CardContent className="p-10 text-center">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#F97316] to-[#C44E35] flex items-center justify-center mb-6 mx-auto">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-3xl font-bold text-black mb-4">Szybkość</h3>
                  <p className="text-xl text-black/60 leading-relaxed">
                    Znajdź to, czego szukasz w kilka sekund
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 rounded-3xl bg-white shadow-xl transition-all duration-300">
                <CardContent className="p-10 text-center">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#F97316] to-[#C44E35] flex items-center justify-center mb-6 mx-auto">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-3xl font-bold text-black mb-4">Prostota</h3>
                  <p className="text-xl text-black/60 leading-relaxed">
                    Intuicyjny interfejs bez niepotrzebnych komplikacji
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 rounded-3xl bg-white shadow-xl transition-all duration-300">
                <CardContent className="p-10 text-center">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#F97316] to-[#C44E35] flex items-center justify-center mb-6 mx-auto">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="text-3xl font-bold text-black mb-4">Bezpieczeństwo</h3>
                  <p className="text-xl text-black/60 leading-relaxed">
                    System weryfikacji budujący zaufanie w społeczności
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Slide 4 - Story */}
        <section className="absolute inset-0 w-full h-screen flex items-center justify-center bg-[#1A1A1A]" style={{ transform: 'translateY(300vh)' }}>
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#C44E35] to-transparent" />
          </div>

          <div className={`relative z-10 max-w-6xl mx-auto px-6 section-slide-right ${animatedSlides.has(3) ? 'active' : ''}`}>
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-5xl md:text-6xl font-bold text-white mb-8 leading-tight">
                  Historia projektu
                </h2>
                <div className="space-y-6 text-xl md:text-2xl text-white/80 leading-relaxed">
                  <p>
                    Znalezienie zaufanego specjalisty nie powinno być trudne – a często takie właśnie jest.
                  </p>
                  <p>
                    Wielu utalentowanych profesjonalistów gubi się w natłoku ogłoszeń i platform, które nie są zaprojektowane z myślą o lokalnych społecznościach.
                  </p>
                  <p className="text-[#F97316] font-semibold">
                    Postanowiliśmy to zmienić.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-center">
                <div className="w-full aspect-square max-w-md rounded-3xl overflow-hidden relative border-2 border-white/10 shadow-2xl">
                  <img
                    src="/images/community.jpg"
                    alt="Lokalna społeczność"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Slide 5 - Team */}
        <section className="absolute inset-0 w-full h-screen flex items-center justify-center bg-gradient-to-br from-[#FAF8F3] to-[#F5F1E8]" style={{ transform: 'translateY(400vh)' }}>
          {/* Design board elements - circles, squares, triangles and lines */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
            {/* Grid lines */}
            <div className="absolute inset-0" style={{
              backgroundImage: 'linear-gradient(#C44E35 1px, transparent 1px), linear-gradient(90deg, #C44E35 1px, transparent 1px)',
              backgroundSize: '50px 50px',
              opacity: 0.1
            }}></div>

            {/* Circles - slide in from sides */}
            <div className={`absolute top-20 left-20 w-32 h-32 rounded-full border-4 border-[#C44E35] transition-all duration-700 ${showTeamShapes ? 'translate-x-0 rotate-0 opacity-100' : '-translate-x-[200px] -rotate-180 opacity-0'}`}></div>
            <div className={`absolute top-40 right-32 w-24 h-24 rounded-full border-4 border-[#F97316] transition-all duration-700 delay-200 ${showTeamShapes ? 'translate-x-0 rotate-0 opacity-100' : 'translate-x-[200px] rotate-180 opacity-0'}`}></div>
            <div className={`absolute bottom-32 left-40 w-40 h-40 rounded-full border-4 border-[#C44E35] transition-all duration-700 delay-100 ${showTeamShapes ? 'translate-x-0 rotate-0 opacity-100' : '-translate-x-[200px] -rotate-180 opacity-0'}`}></div>
            <div className={`absolute bottom-20 right-20 w-28 h-28 rounded-full border-4 border-[#F97316] transition-all duration-700 delay-300 ${showTeamShapes ? 'translate-x-0 rotate-0 opacity-100' : 'translate-x-[200px] rotate-180 opacity-0'}`}></div>

            {/* Squares - slide in from top/bottom */}
            <div className={`absolute top-1/3 left-1/2 w-24 h-24 border-4 border-[#C44E35] rotate-12 transition-all duration-700 delay-400 ${showTeamShapes ? 'translate-y-0 opacity-100' : '-translate-y-[200px] opacity-0'}`}></div>
            <div className={`absolute bottom-1/3 right-1/4 w-32 h-32 border-4 border-[#F97316] rotate-45 transition-all duration-700 delay-500 ${showTeamShapes ? 'translate-y-0 opacity-100' : 'translate-y-[200px] opacity-0'}`}></div>

            {/* Triangles - slide in from sides */}
            <svg className={`absolute top-1/2 left-1/4 w-28 h-28 transition-all duration-700 delay-100 ${showTeamShapes ? 'translate-x-0 rotate-0 opacity-100' : '-translate-x-[200px] -rotate-180 opacity-0'}`} viewBox="0 0 100 100">
              <polygon points="50,10 90,90 10,90" fill="none" stroke="#C44E35" strokeWidth="4" />
            </svg>
            <svg className={`absolute bottom-1/4 right-1/3 w-20 h-20 transition-all duration-700 delay-300 ${showTeamShapes ? 'translate-x-0 rotate-0 opacity-100' : 'translate-x-[200px] rotate-180 opacity-0'}`} viewBox="0 0 100 100">
              <polygon points="50,10 90,90 10,90" fill="none" stroke="#F97316" strokeWidth="4" />
            </svg>

            {/* Nested shapes - square in circle */}
            <div className={`absolute top-1/4 left-[35%] w-36 h-36 rounded-full border-3 border-[#F97316] flex items-center justify-center transition-all duration-700 delay-400 ${showTeamShapes ? 'translate-y-0 translate-x-0 opacity-100' : '-translate-y-[250px] -translate-x-[100px] opacity-0'}`}>
              <div className="w-20 h-20 border-3 border-[#C44E35] rotate-45"></div>
            </div>

            {/* Circle in square */}
            <div className={`absolute top-[35%] left-1/4 w-32 h-32 border-3 border-[#C44E35] rotate-12 flex items-center justify-center transition-all duration-700 delay-600 ${showTeamShapes ? 'translate-y-0 translate-x-0 opacity-100' : 'translate-y-[250px] -translate-x-[100px] opacity-0'}`}>
              <div className="w-20 h-20 rounded-full border-3 border-[#F97316]"></div>
            </div>

            {/* Lines */}
            <svg className="absolute inset-0 w-full h-full">
              <line x1="10%" y1="20%" x2="30%" y2="40%" stroke="#C44E35" strokeWidth="3" strokeDasharray="10,5" />
              <line x1="70%" y1="30%" x2="90%" y2="50%" stroke="#F97316" strokeWidth="3" strokeDasharray="10,5" />
              <line x1="20%" y1="70%" x2="40%" y2="90%" stroke="#C44E35" strokeWidth="3" strokeDasharray="10,5" />
              <line x1="60%" y1="80%" x2="85%" y2="95%" stroke="#F97316" strokeWidth="3" strokeDasharray="10,5" />
            </svg>

            {/* Small dots */}
            <div className="absolute top-1/4 left-1/4 w-3 h-3 rounded-full bg-[#C44E35]"></div>
            <div className="absolute top-1/3 right-1/4 w-3 h-3 rounded-full bg-[#F97316]"></div>
            <div className="absolute bottom-1/4 left-1/3 w-3 h-3 rounded-full bg-[#C44E35]"></div>
            <div className="absolute bottom-1/3 right-1/3 w-3 h-3 rounded-full bg-[#F97316]"></div>
          </div>

          <div className={`relative z-10 max-w-5xl mx-auto px-6 section-fade-up ${animatedSlides.has(4) ? 'active' : ''}`}>
            <h2 className="text-5xl md:text-6xl font-bold text-black text-center mb-16">
              Twórca projektu
            </h2>

            <Card className="border-0 rounded-3xl bg-white shadow-2xl overflow-hidden">
              <CardContent className="p-12 md:p-16">
                <div className="flex flex-col md:flex-row gap-12 items-center">
                  <div className="w-48 h-48 rounded-full bg-gradient-to-br from-[#C44E35] to-[#A03828] flex items-center justify-center flex-shrink-0 shadow-xl">
                    <span className="text-7xl font-bold text-white">M</span>
                  </div>
                  <div className="text-center md:text-left flex-1">
                    <h3 className="text-4xl md:text-5xl font-bold text-black mb-3">Marcin Baszewski</h3>
                    <p className="text-2xl text-[#C44E35] mb-6 font-semibold">Założyciel & Developer</p>
                    <p className="text-xl text-black/70 leading-relaxed mb-4">
                      29 lat. Tworzę aplikacje z pasją do doskonałego UX i dbałością o każdy detal.
                    </p>
                    <p className="text-xl text-black/70 leading-relaxed">
                      Wierzę, że najlepsze produkty to te, w których doświadczenie użytkownika i estetyka wizualna idą w parze z funkcjonalnością.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Slide 6 - Features & CTA */}
        <section className="absolute inset-0 w-full h-screen flex items-center justify-center bg-[#1A1A1A]" style={{ transform: 'translateY(500vh)' }}>
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-20 w-96 h-96 bg-[#C44E35]/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#F97316]/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          </div>

          <div className={`relative z-10 max-w-6xl mx-auto px-6 text-center section-scale-in ${animatedSlides.has(5) ? 'active' : ''}`}>
            <h2 className="text-5xl md:text-7xl font-bold mb-8 text-white leading-tight">
              Gotowy do rozpoczęcia?
            </h2>
            <p className="text-2xl md:text-3xl text-white/80 mb-12 leading-relaxed max-w-3xl mx-auto">
              Dołącz do społeczności FindSomeone i zacznij łączyć się z ludźmi w Twojej okolicy
            </p>

            <div className="grid md:grid-cols-2 gap-8 mb-12 max-w-4xl mx-auto">
              <Card className="border-0 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/15 transition-all">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 rounded-xl bg-[#C44E35]/20 flex items-center justify-center mb-4 mx-auto">
                    <svg className="w-8 h-8 text-[#C44E35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Inteligentne wyszukiwanie</h3>
                  <p className="text-lg text-white/60">Znajdź dokładnie to, czego potrzebujesz</p>
                </CardContent>
              </Card>

              <Card className="border-0 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/15 transition-all">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 rounded-xl bg-[#C44E35]/20 flex items-center justify-center mb-4 mx-auto">
                    <svg className="w-8 h-8 text-[#C44E35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Bezpośrednia komunikacja</h3>
                  <p className="text-lg text-white/60">Wiadomości z powiadomieniami real-time</p>
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <a href="/signup">
                <button className="px-12 py-6 rounded-full bg-[#C44E35] text-white font-semibold text-xl min-w-[240px]">
                  Utwórz konto
                </button>
              </a>
              <a href="/posts">
                <button className="px-12 py-6 rounded-full bg-white text-black font-semibold text-xl min-w-[240px]">
                  Przeglądaj ogłoszenia
                </button>
              </a>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
