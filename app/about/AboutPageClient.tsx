'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Logo } from '@/components/Logo'
import { TextFlip } from '@/components/ui/text-flip'
import { Vortex } from '@/components/ui/vortex'
import { AnimatedTestimonials } from '@/components/ui/animated-testimonials'
import './about.css'

export function AboutPageClient() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [showTeamShapes, setShowTeamShapes] = useState(false)
  const [showMissionUnderline, setShowMissionUnderline] = useState(false)
  const [animatedSlides, setAnimatedSlides] = useState<Set<number>>(new Set([0])) // Hero starts visible
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null)
  const [lineAnimationKey, setLineAnimationKey] = useState(0) // For triggering line bounce animation
  const totalSlides = 5

  // Determine if current slide is dark (1, 3 are dark slides)
  const isDarkSlide = currentSlide === 1 || currentSlide === 3

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
    if (currentSlide === 3) {
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

  // Callback for text flip to trigger line animation
  const handleTextChange = useCallback(() => {
    setLineAnimationKey(prev => prev + 1)
  }, [])

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
      {/* Slide indicator dots - TOP CENTER on mobile, LEFT CENTER on desktop */}
      <div className="fixed top-16 left-1/2 -translate-x-1/2 md:top-1/2 md:left-8 md:-translate-y-1/2 md:translate-x-0 z-30 flex flex-row md:flex-col gap-2 md:gap-3">
        {Array.from({ length: totalSlides }).map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-500 ${
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

      {/* Navigation arrow UP - adjusted for mobile */}
      <button
        onClick={prevSlide}
        disabled={currentSlide === 0}
        className={`fixed right-3 md:right-8 top-[40%] md:top-1/3 z-30 w-9 h-9 md:w-12 md:h-12 rounded-full backdrop-blur-sm flex items-center justify-center shadow-lg transition-all duration-500 ${
          currentSlide === 0
            ? 'opacity-0 pointer-events-none'
            : isDarkSlide
            ? 'bg-white/10 hover:bg-white/20 border border-white/20 opacity-100'
            : 'bg-white/80 hover:bg-white opacity-100'
        }`}
        aria-label="Previous slide"
      >
        <svg className={`w-4 h-4 md:w-6 md:h-6 transition-colors duration-500 ${isDarkSlide ? 'text-white' : 'text-black'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </button>

      {/* Navigation arrow DOWN - adjusted for mobile dock */}
      <button
        onClick={nextSlide}
        disabled={currentSlide === totalSlides - 1}
        className={`fixed right-3 md:right-8 bottom-[40%] md:bottom-1/3 z-30 w-9 h-9 md:w-12 md:h-12 rounded-full backdrop-blur-sm flex items-center justify-center shadow-lg transition-all duration-500 ${
          currentSlide === totalSlides - 1
            ? 'opacity-0 pointer-events-none'
            : isDarkSlide
            ? 'bg-white/10 hover:bg-white/20 border border-white/20 opacity-100'
            : 'bg-white/80 hover:bg-white opacity-100'
        }`}
        aria-label="Next slide"
      >
        <svg className={`w-5 h-5 md:w-6 md:h-6 transition-colors duration-500 ${isDarkSlide ? 'text-white' : 'text-black'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <section className="absolute inset-0 w-full h-screen flex items-center justify-center bg-gradient-to-br from-[#FAF8F3] to-[#F5F1E8] pt-16 pb-24 md:pt-0 md:pb-0">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-20 w-64 h-64 bg-[#C44E35]/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#F97316]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          </div>

          <div className="relative z-10 text-center px-4 md:px-6 max-w-6xl mx-auto animate-fade-in">
            <div className="mb-6 md:mb-8 inline-flex items-center justify-center">
              <div className="px-4 md:px-6 py-2 md:py-3 bg-[#C44E35]/10 rounded-full flex items-center gap-2 md:gap-3">
                <Logo className="w-6 h-6 md:w-8 md:h-8" />
                <span className="text-[#C44E35] font-semibold text-base md:text-lg">FindSomeone</span>
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-8xl font-bold mb-6 md:mb-8 text-black leading-none tracking-tight animate-slide-up">
              Łączymy ludzi<br />lokalnie
            </h1>
            <div className="text-lg md:text-2xl lg:text-3xl text-black/60 mb-8 md:mb-12 leading-relaxed max-w-4xl mx-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <p className="mb-6">Platforma stworzona z pasją do</p>
              <div className="flex flex-col items-center gap-4">
                {/* Animated divider line with bounce effect */}
                <div className="w-full max-w-2xl">
                  <motion.div
                    key={lineAnimationKey}
                    className="h-0.5 md:h-1 w-full bg-gradient-to-r from-transparent via-[#C44E35] to-transparent rounded-full"
                    initial={{ scaleY: 1, y: 0, opacity: 1 }}
                    animate={{
                      scaleY: [1, 1.5, 0.9, 1.1, 1],
                      y: [0, -4, 2, -1, 0],
                      opacity: [1, 0.8, 1, 0.9, 1],
                    }}
                    transition={{
                      duration: 0.5,
                      ease: [0.4, 0, 0.2, 1],
                      delay: 0.25, // Delay to sync with text landing
                    }}
                  />
                </div>

                {/* Text container */}
                <div className="flex justify-center items-center min-h-[2.5rem] md:min-h-[3rem] lg:min-h-[4rem] w-full">
                  <TextFlip
                    words={[
                      'wynajmu mieszkań i pokoi',
                      'lokalnych ogłoszeń',
                      'sprzedaży i zakupów',
                      'znajdowania usług',
                      'wynajmu sprzętu',
                      'poszukiwania pracy',
                    ]}
                    className="inline-block"
                    textClassName="text-lg md:text-2xl lg:text-3xl font-bold text-black"
                    interval={3000}
                    animationDuration={0.6}
                    onWordChange={handleTextChange}
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <a href="/signup">
                <button className="px-8 md:px-10 py-4 md:py-5 rounded-full bg-[#C44E35] text-white font-semibold text-base md:text-lg min-w-[180px] md:min-w-[200px]">
                  Dołącz teraz
                </button>
              </a>
              <a href="/posts">
                <button className="px-8 md:px-10 py-4 md:py-5 rounded-full bg-white text-black font-semibold text-base md:text-lg min-w-[180px] md:min-w-[200px]">
                  Zobacz ogłoszenia
                </button>
              </a>
            </div>
          </div>
        </section>

        {/* Slide 2 - Mission */}
        <section className="absolute inset-0 w-full h-screen pt-16 pb-24 md:pt-0 md:pb-0" style={{ transform: 'translateY(100vh)' }}>
          <Vortex
            backgroundColor="#1A1A1A"
            baseHue={15}
            particleCount={600}
            rangeSpeed={1.2}
            baseRadius={1.5}
            containerClassName="absolute inset-0"
            className="w-full h-full flex items-center justify-center"
          >
            <div className={`max-w-6xl mx-auto px-4 md:px-6 text-center section-scale-in ${animatedSlides.has(1) ? 'active' : ''}`}>
              <div className="inline-block mb-6 md:mb-8 px-4 md:px-6 py-2 md:py-3 bg-white/10 rounded-full text-white/60 text-sm md:text-lg font-semibold backdrop-blur-sm">
                Nasza misja
              </div>
              <h2 className="text-3xl md:text-5xl lg:text-7xl font-bold mb-8 md:mb-12 text-white leading-tight">
                <span className="relative inline-block pb-2">
                  Przystępność
                  <span className={`absolute bottom-0 left-0 h-0.5 md:h-1 bg-gradient-to-r from-white via-[#F97316] to-[#C44E35] transition-all duration-1000 ${showMissionUnderline ? 'w-full opacity-100' : 'w-0 opacity-0'}`}></span>
                </span>
                <br />i{' '}
                <span className="bg-gradient-to-r from-white via-[#F97316] to-[#C44E35] bg-clip-text text-transparent">
                  perfekcyjny UX
                </span>
              </h2>
              <p className="text-lg md:text-2xl lg:text-3xl text-white/80 leading-relaxed max-w-4xl mx-auto">
                Technologia powinna być prosta i przyjemna. Tworzymy platformę,
                która łączy ludzi w najbardziej intuicyjny sposób – bez zbędnych komplikacji.
              </p>
            </div>
          </Vortex>
        </section>

        {/* Slide 3 - Story */}
        <section className="absolute inset-0 w-full h-screen flex items-center justify-center bg-gradient-to-br from-[#FAF8F3] to-[#F5F1E8] pt-20 pb-28 md:py-0" style={{ transform: 'translateY(200vh)' }}>
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-20 w-64 h-64 bg-[#C44E35]/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#F97316]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          </div>

          <div className={`relative z-10 max-w-6xl mx-auto px-4 md:px-6 section-slide-right ${animatedSlides.has(2) ? 'active' : ''}`}>
            <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-black mb-6 md:mb-8 leading-tight">
                  Historia projektu
                </h2>
                <div className="space-y-4 md:space-y-6 text-base md:text-xl lg:text-2xl text-black/70 leading-relaxed">
                  <p>
                    Znalezienie pomocy w okolicy nie powinno być trudne – a często takie właśnie jest.
                  </p>
                  <p>
                    Wielu utalentowanych ludzi gubi się w natłoku ogłoszeń i platform, które nie są zaprojektowane z myślą o społecznościach.
                  </p>
                  <p className="text-[#C44E35] font-semibold">
                    Postanowiliśmy to zmienić.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-center">
                <AnimatedTestimonials
                  testimonials={[
                    {
                      src: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=800&fit=crop&auto=format',
                      name: 'Zespół',
                    },
                    {
                      src: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&h=800&fit=crop&auto=format',
                      name: 'Współpraca',
                    },
                    {
                      src: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=800&fit=crop&auto=format',
                      name: 'Innowacja',
                    },
                    {
                      src: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&h=800&fit=crop&auto=format',
                      name: 'Społeczność',
                    },
                    {
                      src: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=800&fit=crop&auto=format',
                      name: 'Technologia',
                    },
                  ]}
                  autoplay={true}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Slide 4 - Team */}
        <section className="absolute inset-0 w-full h-screen flex items-center justify-center bg-[#1A1A1A] pt-20 pb-28 md:pt-0 md:pb-0" style={{ transform: 'translateY(300vh)' }}>
          {/* Design board elements - circles, squares, triangles and lines */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
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

          <div className={`relative z-10 max-w-5xl mx-auto px-4 md:px-6 section-fade-up ${animatedSlides.has(3) ? 'active' : ''}`}>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white text-center mb-8 md:mb-16">
              Twórca projektu
            </h2>

            <Card className="border-0 rounded-2xl md:rounded-3xl bg-white shadow-2xl overflow-hidden">
              <CardContent className="p-6 md:p-12 lg:p-16">
                <div className="flex flex-col md:flex-row gap-6 md:gap-12 items-center">
                  <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-gradient-to-br from-[#C44E35] to-[#A03828] flex items-center justify-center flex-shrink-0 shadow-xl">
                    <span className="text-5xl md:text-7xl font-bold text-white">M</span>
                  </div>
                  <div className="text-center md:text-left flex-1">
                    <h3 className="text-2xl md:text-4xl lg:text-5xl font-bold text-black mb-2 md:mb-3">Marcin Baszewski</h3>
                    <p className="text-lg md:text-2xl text-[#C44E35] mb-4 md:mb-6 font-semibold">Założyciel & Developer</p>
                    <p className="text-base md:text-xl text-black/70 leading-relaxed mb-3 md:mb-4">
                      29 lat. Tworzę aplikacje z pasją do doskonałego UX i dbałością o każdy detal.
                    </p>
                    <p className="text-base md:text-xl text-black/70 leading-relaxed">
                      Wierzę, że najlepsze produkty to te, w których doświadczenie użytkownika i estetyka wizualna idą w parze z funkcjonalnością.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Slide 5 - Features & CTA */}
        <section className="absolute inset-0 w-full h-screen flex items-center justify-center bg-gradient-to-br from-[#FAF8F3] to-[#F5F1E8] pt-20 pb-28 md:py-0" style={{ transform: 'translateY(400vh)' }}>
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-20 w-96 h-96 bg-[#C44E35]/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#F97316]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          </div>

          <div className={`relative z-10 max-w-6xl mx-auto px-4 md:px-6 text-center section-scale-in ${animatedSlides.has(4) ? 'active' : ''}`}>
            <h2 className="text-3xl md:text-5xl lg:text-7xl font-bold mb-6 md:mb-8 text-black leading-tight">
              Gotowy do rozpoczęcia?
            </h2>
            <p className="text-lg md:text-2xl lg:text-3xl text-black/70 mb-8 md:mb-12 leading-relaxed max-w-3xl mx-auto">
              Dołącz do społeczności FindSomeone i zacznij łączyć się z ludźmi w Twojej okolicy
            </p>

            <div className="grid md:grid-cols-2 gap-4 md:gap-8 mb-8 md:mb-12 max-w-4xl mx-auto">
              <Card className="border-0 rounded-xl md:rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all">
                <CardContent className="p-6 md:p-8 text-center">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg md:rounded-xl bg-[#C44E35]/10 flex items-center justify-center mb-3 md:mb-4 mx-auto">
                    <svg className="w-6 h-6 md:w-8 md:h-8 text-[#C44E35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg md:text-2xl font-bold text-black mb-1 md:mb-2">Inteligentne wyszukiwanie</h3>
                  <p className="text-sm md:text-lg text-black/60">Znajdź dokładnie to, czego potrzebujesz</p>
                </CardContent>
              </Card>

              <Card className="border-0 rounded-xl md:rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all">
                <CardContent className="p-6 md:p-8 text-center">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg md:rounded-xl bg-[#C44E35]/10 flex items-center justify-center mb-3 md:mb-4 mx-auto">
                    <svg className="w-6 h-6 md:w-8 md:h-8 text-[#C44E35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="text-lg md:text-2xl font-bold text-black mb-1 md:mb-2">Bezpośrednia komunikacja</h3>
                  <p className="text-sm md:text-lg text-black/60">Wiadomości z powiadomieniami real-time</p>
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center">
              <a href="/signup">
                <button className="px-8 md:px-12 py-4 md:py-6 rounded-full bg-[#C44E35] text-white font-semibold text-base md:text-xl min-w-[200px] md:min-w-[240px]">
                  Utwórz konto
                </button>
              </a>
              <a href="/posts">
                <button className="px-8 md:px-12 py-4 md:py-6 rounded-full bg-white border border-[#C44E35] text-[#C44E35] font-semibold text-base md:text-xl min-w-[200px] md:min-w-[240px] hover:bg-[#C44E35]/10 transition-colors">
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
