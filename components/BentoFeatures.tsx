'use client'

import { motion } from 'motion/react'
import { MessageCircle, Sparkles, Smartphone, DollarSign, Send, User } from 'lucide-react'
import { useState } from 'react'

export function BentoFeatures() {
  const [activeCardIndex, setActiveCardIndex] = useState(0)
  const [currentDeviceIndex, setCurrentDeviceIndex] = useState(0)

  const handleCardClick = () => {
    setActiveCardIndex((prev) => (prev + 1) % 3)
  }
  return (
    <section className="container mx-auto px-6 py-8 md:py-16">
      <div className="text-center mb-8 md:mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
          Dlaczego FindSomeone?
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Prosta, bezpieczna platforma do lokalnej wymiany pomocy i usług
        </p>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-6 md:auto-rows-auto md:items-start">

        {/* Position 1 (Top Left): Całkowicie darmowe - TALL */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="group relative overflow-hidden md:bg-gradient-to-br md:from-card md:to-card/50 md:border md:border-border md:rounded-3xl md:p-8 md:hover:border-brand/40 md:transition-all md:duration-300 md:min-h-[500px]"
        >
          <div className="relative z-10">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              Całkowicie darmowe
            </h3>
            <p className="text-muted-foreground text-base mb-6">
              Dodawanie ogłoszeń bez opłat i limitów. Publikuj gdzie i ile chcesz, kiedy tylko chcesz!
            </p>

            {/* Mockup: Post Card Preview - Stacked Cards */}
            <div className="relative h-[380px] md:h-[311px] lg:h-[327px] xl:h-[327px] cursor-pointer flex items-center scale-90 xl:scale-100 select-none" onClick={handleCardClick}>
              {/* Card 1 */}
              <motion.div
                animate={{
                  y: activeCardIndex === 0 ? 0 : activeCardIndex === 1 ? 20 : 40,
                  rotate: activeCardIndex === 0 ? -2 : activeCardIndex === 1 ? 2 : -3,
                  opacity: activeCardIndex === 0 ? 1 : activeCardIndex === 1 ? 0.85 : 0.7,
                  scale: activeCardIndex === 0 ? 1 : activeCardIndex === 1 ? 0.97 : 0.94,
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                }}
                style={{
                  zIndex: activeCardIndex === 0 ? 30 : activeCardIndex === 1 ? 20 : 10,
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  height: '300px',
                }}
                className="bg-background/95 backdrop-blur-sm border-2 border-border/70 rounded-3xl p-2 xl:p-3 shadow-xl xl:inset-0 xl:h-auto"
              >
                {/* Mobile: vertical layout, Desktop: horizontal layout */}
                <div className="flex flex-col xl:flex-row gap-2 xl:gap-4 h-full">
                  {/* Image placeholder - square on mobile, tall on desktop */}
                  <div className="w-full xl:w-40 h-32 xl:h-full bg-gradient-to-br from-brand/20 to-brand/5 rounded-xl xl:rounded-2xl flex-shrink-0 flex items-center justify-center overflow-hidden">
                    <svg className="w-12 xl:w-16 h-12 xl:h-16 text-brand/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>

                  {/* Content area */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-1 xl:py-2">
                    {/* Title */}
                    <h4 className="text-sm xl:text-base font-semibold text-foreground truncate">
                      Pomoc przy przeprowadzce
                    </h4>

                    {/* Description */}
                    <p className="text-xs xl:text-sm text-muted-foreground line-clamp-2 xl:line-clamp-3 mt-1 xl:mt-1.5 mb-auto leading-relaxed">
                      Potrzebuję pomocy przy przeprowadzce. Przeniesienie mebli z 3 piętra bez windy. Mam kanapę, szafę, stolik i kilka kartonów. Auto podstawiam, potrzebna tylko pomoc przy noszeniu.
                    </p>

                    {/* Location & Date/Time - above divider */}
                    <div className="flex items-center justify-between gap-1 xl:gap-2 mb-1.5 xl:mb-2">
                      <span className="text-xs xl:text-sm text-muted-foreground truncate">Warszawa</span>
                      <span className="text-xs xl:text-sm text-muted-foreground whitespace-nowrap">2 lis 2025</span>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-border/50 mb-1.5 xl:mb-2" />

                    {/* Bottom section: User & Price */}
                    <div className="flex items-center justify-between gap-1 xl:gap-2">
                      <div className="flex items-center gap-1.5 xl:gap-2 min-w-0">
                        <div className="w-6 xl:w-8 h-6 xl:h-8 rounded-full bg-brand/20 flex-shrink-0 flex items-center justify-center text-brand">
                          <User className="w-3 xl:w-4 h-3 xl:h-4" />
                        </div>
                        <div className="min-w-0 flex flex-col">
                          <span className="text-xs xl:text-sm text-foreground font-medium truncate">Wypełniaczek</span>
                          <span className="text-[10px] xl:text-xs text-muted-foreground whitespace-nowrap">Ocena: 5.0 (69)</span>
                        </div>
                      </div>
                      <span className="text-sm xl:text-base font-bold text-foreground whitespace-nowrap">0 PLN</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Card 2 */}
              <motion.div
                animate={{
                  y: activeCardIndex === 1 ? 0 : activeCardIndex === 2 ? 20 : 40,
                  rotate: activeCardIndex === 1 ? -2 : activeCardIndex === 2 ? 2 : -3,
                  opacity: activeCardIndex === 1 ? 1 : activeCardIndex === 2 ? 0.85 : 0.7,
                  scale: activeCardIndex === 1 ? 1 : activeCardIndex === 2 ? 0.97 : 0.94,
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                }}
                style={{
                  zIndex: activeCardIndex === 1 ? 30 : activeCardIndex === 2 ? 20 : 10,
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  height: '300px',
                }}
                className="bg-background/95 backdrop-blur-sm border-2 border-border/70 rounded-3xl p-2 xl:p-3 shadow-xl xl:inset-0 xl:h-auto"
              >
                <div className="flex flex-col xl:flex-row gap-2 xl:gap-4 h-full">
                  {/* Image placeholder - square on mobile, tall on desktop */}
                  <div className="w-full xl:w-40 h-32 xl:h-full bg-gradient-to-br from-brand/15 to-brand/3 rounded-xl xl:rounded-2xl flex-shrink-0 flex items-center justify-center overflow-hidden">
                    <svg className="w-12 xl:w-16 h-12 xl:h-16 text-brand/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>

                  {/* Content area */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-1 xl:py-2">
                    {/* Title */}
                    <h4 className="text-sm xl:text-base font-semibold text-foreground truncate">
                      Sprzedam rower górski
                    </h4>

                    {/* Description */}
                    <p className="text-xs xl:text-sm text-muted-foreground line-clamp-2 xl:line-clamp-3 mt-1 xl:mt-1.5 mb-auto leading-relaxed">
                      Rower górski w bardzo dobrym stanie, używany sezonowo. Amortyzowana przednia widełka Rock Shox, przerzutki Shimano 21 biegów, koła 26 cali. Idealny na wypady w teren.
                    </p>

                    {/* Location & Date/Time - above divider */}
                    <div className="flex items-center justify-between gap-1 xl:gap-2 mb-1.5 xl:mb-2">
                      <span className="text-xs xl:text-sm text-muted-foreground truncate">Kraków</span>
                      <span className="text-xs xl:text-sm text-muted-foreground whitespace-nowrap">1 lis 2025</span>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-border/50 mb-1.5 xl:mb-2" />

                    {/* Bottom section: User & Price */}
                    <div className="flex items-center justify-between gap-1 xl:gap-2">
                      <div className="flex items-center gap-1.5 xl:gap-2 min-w-0">
                        <div className="w-6 xl:w-8 h-6 xl:h-8 rounded-full bg-brand/20 flex-shrink-0 flex items-center justify-center text-brand">
                          <User className="w-3 xl:w-4 h-3 xl:h-4" />
                        </div>
                        <div className="min-w-0 flex flex-col">
                          <span className="text-xs xl:text-sm text-foreground font-medium truncate">Anna K.</span>
                          <span className="text-[10px] xl:text-xs text-muted-foreground whitespace-nowrap">Ocena: 4.8 (23)</span>
                        </div>
                      </div>
                      <span className="text-sm xl:text-base font-bold text-foreground whitespace-nowrap">850 PLN</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Card 3 */}
              <motion.div
                animate={{
                  y: activeCardIndex === 2 ? 0 : activeCardIndex === 0 ? 20 : 40,
                  rotate: activeCardIndex === 2 ? -2 : activeCardIndex === 0 ? 2 : -3,
                  opacity: activeCardIndex === 2 ? 1 : activeCardIndex === 0 ? 0.85 : 0.7,
                  scale: activeCardIndex === 2 ? 1 : activeCardIndex === 0 ? 0.97 : 0.94,
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                }}
                style={{
                  zIndex: activeCardIndex === 2 ? 30 : activeCardIndex === 0 ? 20 : 10,
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  height: '300px',
                }}
                className="bg-background/95 backdrop-blur-sm border-2 border-border/70 rounded-3xl p-2 xl:p-3 shadow-xl xl:inset-0 xl:h-auto"
              >
                <div className="flex flex-col xl:flex-row gap-2 xl:gap-4 h-full">
                  {/* Image placeholder - square on mobile, tall on desktop */}
                  <div className="w-full xl:w-40 h-32 xl:h-full bg-gradient-to-br from-brand/10 to-brand/2 rounded-xl xl:rounded-2xl flex-shrink-0 flex items-center justify-center overflow-hidden">
                    <svg className="w-12 xl:w-16 h-12 xl:h-16 text-brand/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>

                  {/* Content area */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-1 xl:py-2">
                    {/* Title */}
                    <h4 className="text-sm xl:text-base font-semibold text-foreground truncate">
                      Lekcje gitary akustycznej
                    </h4>

                    {/* Description */}
                    <p className="text-xs xl:text-sm text-muted-foreground line-clamp-2 xl:line-clamp-3 mt-1 xl:mt-1.5 mb-auto leading-relaxed">
                      Doświadczony gitarzysta z 10-letnim stażem udzieli profesjonalnych lekcji gitary dla początkujących i średnio zaawansowanych. Pierwsza lekcja gratis! Nauka akordów, melodii i techniki gry.
                    </p>

                    {/* Location & Date/Time - above divider */}
                    <div className="flex items-center justify-between gap-1 xl:gap-2 mb-1.5 xl:mb-2">
                      <span className="text-xs xl:text-sm text-muted-foreground truncate">Wrocław</span>
                      <span className="text-xs xl:text-sm text-muted-foreground whitespace-nowrap">31 paź 2025</span>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-border/50 mb-1.5 xl:mb-2" />

                    {/* Bottom section: User & Price */}
                    <div className="flex items-center justify-between gap-1 xl:gap-2">
                      <div className="flex items-center gap-1.5 xl:gap-2 min-w-0">
                        <div className="w-6 xl:w-8 h-6 xl:h-8 rounded-full bg-brand/20 flex-shrink-0 flex items-center justify-center text-brand">
                          <User className="w-3 xl:w-4 h-3 xl:h-4" />
                        </div>
                        <div className="min-w-0 flex flex-col">
                          <span className="text-xs xl:text-sm text-foreground font-medium truncate">Marcin B.</span>
                          <span className="text-[10px] xl:text-xs text-muted-foreground whitespace-nowrap">Ocena: 5.0 (15)</span>
                        </div>
                      </div>
                      <span className="text-sm xl:text-base font-bold text-foreground whitespace-nowrap">60 PLN/h</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Decorative gradient - desktop only */}
          <div className="hidden md:block absolute inset-0 bg-gradient-to-br from-brand/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </motion.div>

        {/* Position 2 (Top Right): Przemyślany design - SHORT */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="group relative overflow-hidden md:bg-gradient-to-br md:from-card md:to-card/50 md:border md:border-border md:rounded-3xl md:p-8 md:hover:border-brand/40 md:transition-all md:duration-300 md:min-h-[380px] xl:min-h-[392px] 2xl:min-h-[380px]"
        >
          <div className="relative z-10 h-full flex flex-col">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              Przemyślany design
            </h3>
            <p className="text-muted-foreground text-base mb-4">
              Przepiękny UX/UI z perfekcyjnym dostosowaniem do wszystkich urządzeń.
            </p>

            {/* Mockup: Responsive Devices with Light/Dark Mode Split */}

            {/* Desktop view - show all three devices */}
            <div className="hidden xl:flex flex-1 items-center justify-center gap-12 xl:mt-0">
              {/* Mobile */}
              <div className="w-20 h-40 bg-border rounded-xl border-2 border-border flex flex-col overflow-hidden shadow-lg">
                <div className="h-2 flex relative">
                  <div className="w-1/2 bg-[#FAFAFA]" />
                  <div className="w-1/2 bg-[#1A1A1A]" />
                  <div className="absolute inset-0 flex items-center justify-center pt-0.5">
                    <div className="w-4 h-1.5 bg-[#1A1A1A] rounded" />
                  </div>
                </div>
                <div className="flex-1 flex">
                  {/* Light mode half */}
                  <div className="w-1/2 bg-[#FAFAFA] p-2 flex flex-col gap-1">
                    <div className="h-1.5 bg-[#E5E5E5] rounded" />
                    <div className="h-1.5 bg-[#E5E5E5] rounded w-2/3" />
                    <div className="flex-1 bg-[#FFFFFF] border border-[#E5E5E5] rounded mt-1" />
                  </div>
                  {/* Dark mode half */}
                  <div className="w-1/2 bg-[#1A1A1A] p-2 flex flex-col gap-1">
                    <div className="h-1.5 bg-[#2A2A2A] rounded" />
                    <div className="h-1.5 bg-[#2A2A2A] rounded w-2/3" />
                    <div className="flex-1 bg-[#252525] border border-[#2A2A2A] rounded mt-1" />
                  </div>
                </div>
                <div className="h-1.5 flex">
                  <div className="w-1/2 bg-[#FAFAFA]" />
                  <div className="w-1/2 bg-[#1A1A1A]" />
                </div>
              </div>

              {/* Tablet */}
              <div className="w-32 h-44 bg-border rounded-xl border-2 border-border flex flex-col overflow-hidden shadow-lg">
                <div className="h-2 flex">
                  <div className="w-1/2 bg-[#FAFAFA]" />
                  <div className="w-1/2 bg-[#1A1A1A]" />
                </div>
                <div className="flex-1 flex">
                  {/* Light mode half */}
                  <div className="w-1/2 bg-[#FAFAFA] p-2.5 flex flex-col gap-1.5">
                    <div className="h-1.5 bg-[#E5E5E5] rounded" />
                    <div className="grid grid-cols-2 gap-1.5 flex-1">
                      <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded" />
                      <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded" />
                    </div>
                  </div>
                  {/* Dark mode half */}
                  <div className="w-1/2 bg-[#1A1A1A] p-2.5 flex flex-col gap-1.5">
                    <div className="h-1.5 bg-[#2A2A2A] rounded" />
                    <div className="grid grid-cols-2 gap-1.5 flex-1">
                      <div className="bg-[#252525] border border-[#2A2A2A] rounded" />
                      <div className="bg-[#252525] border border-[#2A2A2A] rounded" />
                    </div>
                  </div>
                </div>
                <div className="h-1.5 flex">
                  <div className="w-1/2 bg-[#FAFAFA]" />
                  <div className="w-1/2 bg-[#1A1A1A]" />
                </div>
              </div>

              {/* Desktop - MacBook with keyboard */}
              <div className="flex flex-col items-center" style={{ perspective: '500px' }}>
                {/* Screen */}
                <div className="w-44 h-28 bg-border rounded-t-lg border-2 border-b-0 border-border flex flex-col overflow-hidden shadow-2xl" style={{ transformStyle: 'preserve-3d', transform: 'rotateX(-35deg)', transformOrigin: 'bottom center' }}>
                  <div className="h-1.5 flex relative">
                    <div className="w-1/2 bg-[#FAFAFA] flex items-center pl-1 pt-0.5 gap-0.5">
                      <div className="w-1 h-1 bg-[#FF5F57] rounded-full" />
                      <div className="w-1 h-1 bg-[#FFBD2E] rounded-full" />
                      <div className="w-1 h-1 bg-[#28CA42] rounded-full" />
                    </div>
                    <div className="w-1/2 bg-[#1A1A1A]" />
                    <div className="absolute inset-0 flex items-start justify-center">
                      <div className="w-4 h-1 bg-[#1A1A1A] rounded-bl-[1px] rounded-br-[1px]" />
                    </div>
                  </div>
                  <div className="flex-1 flex">
                    {/* Light mode half */}
                    <div className="w-1/2 bg-[#FAFAFA] p-2 flex flex-col gap-1">
                      <div className="h-1.5 bg-[#E5E5E5] rounded" />
                      <div className="grid grid-cols-3 gap-1 flex-1">
                        <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded" />
                        <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded" />
                        <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded" />
                      </div>
                    </div>
                    {/* Dark mode half */}
                    <div className="w-1/2 bg-[#1A1A1A] p-2 flex flex-col gap-1">
                      <div className="h-1.5 bg-[#2A2A2A] rounded" />
                      <div className="grid grid-cols-3 gap-1 flex-1">
                        <div className="bg-[#252525] border border-[#2A2A2A] rounded" />
                        <div className="bg-[#252525] border border-[#2A2A2A] rounded" />
                        <div className="bg-[#252525] border border-[#2A2A2A] rounded" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Keyboard base */}
                <div className="w-44 h-24 bg-gradient-to-b from-muted to-muted/80 rounded-b-lg border-2 border-t-0 border-border shadow-md flex flex-col">
                  <div className="flex gap-1 px-1 pt-2">
                    {/* Left speaker */}
                    <div className="flex flex-col gap-[2px] pt-1">
                      <div className="w-[2px] h-[2px] bg-foreground/20 rounded-full" />
                      <div className="w-[2px] h-[2px] bg-foreground/20 rounded-full" />
                      <div className="w-[2px] h-[2px] bg-foreground/20 rounded-full" />
                      <div className="w-[2px] h-[2px] bg-foreground/20 rounded-full" />
                      <div className="w-[2px] h-[2px] bg-foreground/20 rounded-full" />
                      <div className="w-[2px] h-[2px] bg-foreground/20 rounded-full" />
                      <div className="w-[2px] h-[2px] bg-foreground/20 rounded-full" />
                      <div className="w-[2px] h-[2px] bg-foreground/20 rounded-full" />
                      <div className="w-[2px] h-[2px] bg-foreground/20 rounded-full" />
                      <div className="w-[2px] h-[2px] bg-foreground/20 rounded-full" />
                    </div>

                    {/* Keyboard well (inset area) */}
                    <div className="flex-1 bg-[#0A0A0A] rounded-sm shadow-inner border border-foreground/5 p-1.5 flex flex-col max-h-[46px]">
                      {/* Keyboard area */}
                      <div className="flex flex-col gap-0.5">
                        {/* Keys rows */}
                        <div className="flex gap-0.5 justify-center">
                          <div className="w-2 h-1.5 bg-foreground/15 rounded-[1px]" />
                          <div className="w-2 h-1.5 bg-foreground/15 rounded-[1px]" />
                          <div className="w-2 h-1.5 bg-foreground/15 rounded-[1px]" />
                          <div className="w-2 h-1.5 bg-foreground/15 rounded-[1px]" />
                          <div className="w-2 h-1.5 bg-foreground/15 rounded-[1px]" />
                          <div className="w-2 h-1.5 bg-foreground/15 rounded-[1px]" />
                          <div className="w-2 h-1.5 bg-foreground/15 rounded-[1px]" />
                          <div className="w-2 h-1.5 bg-foreground/15 rounded-[1px]" />
                          <div className="w-2 h-1.5 bg-foreground/15 rounded-[1px]" />
                          <div className="w-2 h-1.5 bg-foreground/15 rounded-[1px]" />
                        </div>
                        <div className="flex gap-0.5 justify-center">
                          <div className="w-2 h-1.5 bg-foreground/15 rounded-[1px]" />
                          <div className="w-2 h-1.5 bg-foreground/15 rounded-[1px]" />
                          <div className="w-2 h-1.5 bg-foreground/15 rounded-[1px]" />
                          <div className="w-2 h-1.5 bg-foreground/15 rounded-[1px]" />
                          <div className="w-2 h-1.5 bg-foreground/15 rounded-[1px]" />
                          <div className="w-2 h-1.5 bg-foreground/15 rounded-[1px]" />
                          <div className="w-2 h-1.5 bg-foreground/15 rounded-[1px]" />
                          <div className="w-2 h-1.5 bg-foreground/15 rounded-[1px]" />
                          <div className="w-2 h-1.5 bg-foreground/15 rounded-[1px]" />
                        </div>
                        <div className="flex gap-0.5 justify-center">
                          <div className="w-3 h-1.5 bg-foreground/15 rounded-[1px]" />
                          <div className="w-2 h-1.5 bg-foreground/15 rounded-[1px]" />
                          <div className="w-2 h-1.5 bg-foreground/15 rounded-[1px]" />
                          <div className="w-2 h-1.5 bg-foreground/15 rounded-[1px]" />
                          <div className="w-2 h-1.5 bg-foreground/15 rounded-[1px]" />
                          <div className="w-2 h-1.5 bg-foreground/15 rounded-[1px]" />
                          <div className="w-3 h-1.5 bg-foreground/15 rounded-[1px]" />
                        </div>
                        <div className="flex gap-0.5 justify-center">
                          <div className="w-3 h-1.5 bg-foreground/15 rounded-[1px]" />
                          <div className="w-14 h-1.5 bg-foreground/15 rounded-[1px]" />
                          <div className="w-3 h-1.5 bg-foreground/15 rounded-[1px]" />
                        </div>
                      </div>
                    </div>

                    {/* Right speaker */}
                    <div className="flex flex-col gap-[2px] pt-1">
                      <div className="w-[2px] h-[2px] bg-foreground/20 rounded-full" />
                      <div className="w-[2px] h-[2px] bg-foreground/20 rounded-full" />
                      <div className="w-[2px] h-[2px] bg-foreground/20 rounded-full" />
                      <div className="w-[2px] h-[2px] bg-foreground/20 rounded-full" />
                      <div className="w-[2px] h-[2px] bg-foreground/20 rounded-full" />
                      <div className="w-[2px] h-[2px] bg-foreground/20 rounded-full" />
                      <div className="w-[2px] h-[2px] bg-foreground/20 rounded-full" />
                      <div className="w-[2px] h-[2px] bg-foreground/20 rounded-full" />
                      <div className="w-[2px] h-[2px] bg-foreground/20 rounded-full" />
                      <div className="w-[2px] h-[2px] bg-foreground/20 rounded-full" />
                    </div>
                  </div>

                  {/* Trackpad - outside the keyboard well */}
                  <div className="mt-2 mx-auto w-14 h-8 bg-foreground/5 rounded-sm border border-foreground/10 shadow-inner mb-2" />
                </div>
              </div>
            </div>

            {/* Mobile carousel view - show one device at a time */}
            <div className="xl:hidden flex-1 flex flex-col items-center justify-center mt-4 relative">
              <div className="relative w-full max-w-[280px] h-[200px] md:h-[154px] lg:h-[134px] flex items-center justify-center">
                {/* Mobile Device */}
                <motion.div
                  key={`mobile-${currentDeviceIndex}`}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: currentDeviceIndex === 0 ? 1 : 0, x: currentDeviceIndex === 0 ? 0 : -100 }}
                  transition={{ duration: 0.3 }}
                  className="absolute w-24 h-48 bg-border rounded-xl border-2 border-border flex flex-col overflow-hidden shadow-lg"
                  style={{ display: currentDeviceIndex === 0 ? 'flex' : 'none' }}
                >
                  <div className="h-2.5 flex relative">
                    <div className="w-1/2 bg-[#FAFAFA]" />
                    <div className="w-1/2 bg-[#1A1A1A]" />
                    <div className="absolute inset-0 flex items-center justify-center pt-0.5">
                      <div className="w-6 h-2 bg-[#1A1A1A] rounded" />
                    </div>
                  </div>
                  <div className="flex-1 flex">
                    <div className="w-1/2 bg-[#FAFAFA] p-2.5 flex flex-col gap-1.5">
                      <div className="h-2 bg-[#E5E5E5] rounded" />
                      <div className="h-2 bg-[#E5E5E5] rounded w-2/3" />
                      <div className="flex-1 bg-[#FFFFFF] border border-[#E5E5E5] rounded mt-1.5" />
                    </div>
                    <div className="w-1/2 bg-[#1A1A1A] p-2.5 flex flex-col gap-1.5">
                      <div className="h-2 bg-[#2A2A2A] rounded" />
                      <div className="h-2 bg-[#2A2A2A] rounded w-2/3" />
                      <div className="flex-1 bg-[#252525] border border-[#2A2A2A] rounded mt-1.5" />
                    </div>
                  </div>
                  <div className="h-2 flex">
                    <div className="w-1/2 bg-[#FAFAFA]" />
                    <div className="w-1/2 bg-[#1A1A1A]" />
                  </div>
                </motion.div>

                {/* Tablet Device */}
                <motion.div
                  key={`tablet-${currentDeviceIndex}`}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: currentDeviceIndex === 1 ? 1 : 0, x: currentDeviceIndex === 1 ? 0 : -100 }}
                  transition={{ duration: 0.3 }}
                  className="absolute w-40 h-56 bg-border rounded-xl border-2 border-border flex flex-col overflow-hidden shadow-lg"
                  style={{ display: currentDeviceIndex === 1 ? 'flex' : 'none' }}
                >
                  <div className="h-2.5 flex">
                    <div className="w-1/2 bg-[#FAFAFA]" />
                    <div className="w-1/2 bg-[#1A1A1A]" />
                  </div>
                  <div className="flex-1 flex">
                    <div className="w-1/2 bg-[#FAFAFA] p-3 flex flex-col gap-2">
                      <div className="h-2 bg-[#E5E5E5] rounded" />
                      <div className="grid grid-cols-2 gap-2 flex-1">
                        <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded" />
                        <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded" />
                      </div>
                    </div>
                    <div className="w-1/2 bg-[#1A1A1A] p-3 flex flex-col gap-2">
                      <div className="h-2 bg-[#2A2A2A] rounded" />
                      <div className="grid grid-cols-2 gap-2 flex-1">
                        <div className="bg-[#252525] border border-[#2A2A2A] rounded" />
                        <div className="bg-[#252525] border border-[#2A2A2A] rounded" />
                      </div>
                    </div>
                  </div>
                  <div className="h-2 flex">
                    <div className="w-1/2 bg-[#FAFAFA]" />
                    <div className="w-1/2 bg-[#1A1A1A]" />
                  </div>
                </motion.div>

                {/* MacBook Device */}
                <motion.div
                  key={`macbook-${currentDeviceIndex}`}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: currentDeviceIndex === 2 ? 1 : 0, x: currentDeviceIndex === 2 ? 0 : -100 }}
                  transition={{ duration: 0.3 }}
                  className="absolute flex flex-col items-center"
                  style={{ perspective: '500px', display: currentDeviceIndex === 2 ? 'flex' : 'none' }}
                >
                  <div className="w-52 h-32 bg-border rounded-t-lg border-2 border-b-0 border-border flex flex-col overflow-hidden shadow-2xl" style={{ transformStyle: 'preserve-3d', transform: 'rotateX(-35deg)', transformOrigin: 'bottom center' }}>
                    <div className="h-2 flex relative">
                      <div className="w-1/2 bg-[#FAFAFA] flex items-center pl-1.5 pt-0.5 gap-0.5">
                        <div className="w-1.5 h-1.5 bg-[#FF5F57] rounded-full" />
                        <div className="w-1.5 h-1.5 bg-[#FFBD2E] rounded-full" />
                        <div className="w-1.5 h-1.5 bg-[#28CA42] rounded-full" />
                      </div>
                      <div className="w-1/2 bg-[#1A1A1A]" />
                      <div className="absolute inset-0 flex items-start justify-center">
                        <div className="w-6 h-1.5 bg-[#1A1A1A] rounded-bl-[1px] rounded-br-[1px]" />
                      </div>
                    </div>
                    <div className="flex-1 flex">
                      <div className="w-1/2 bg-[#FAFAFA] p-2.5 flex flex-col gap-1.5">
                        <div className="h-2 bg-[#E5E5E5] rounded" />
                        <div className="grid grid-cols-3 gap-1.5 flex-1">
                          <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded" />
                          <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded" />
                          <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded" />
                        </div>
                      </div>
                      <div className="w-1/2 bg-[#1A1A1A] p-2.5 flex flex-col gap-1.5">
                        <div className="h-2 bg-[#2A2A2A] rounded" />
                        <div className="grid grid-cols-3 gap-1.5 flex-1">
                          <div className="bg-[#252525] border border-[#2A2A2A] rounded" />
                          <div className="bg-[#252525] border border-[#2A2A2A] rounded" />
                          <div className="bg-[#252525] border border-[#2A2A2A] rounded" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="w-52 h-28 bg-gradient-to-b from-muted to-muted/80 rounded-b-lg border-2 border-t-0 border-border shadow-md flex flex-col">
                    <div className="flex gap-1.5 px-1.5 pt-2.5">
                      <div className="flex flex-col gap-[2px] pt-1">
                        {[...Array(10)].map((_, i) => (
                          <div key={i} className="w-[2px] h-[2px] bg-foreground/20 rounded-full" />
                        ))}
                      </div>
                      <div className="flex-1 bg-[#0A0A0A] rounded-sm shadow-inner border border-foreground/5 p-2 flex flex-col max-h-[52px]">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex gap-0.5 justify-center">
                            {[...Array(10)].map((_, i) => (
                              <div key={i} className="w-2.5 h-2 bg-foreground/15 rounded-[1px]" />
                            ))}
                          </div>
                          <div className="flex gap-0.5 justify-center">
                            {[...Array(9)].map((_, i) => (
                              <div key={i} className="w-2.5 h-2 bg-foreground/15 rounded-[1px]" />
                            ))}
                          </div>
                          <div className="flex gap-0.5 justify-center">
                            <div className="w-4 h-2 bg-foreground/15 rounded-[1px]" />
                            {[...Array(5)].map((_, i) => (
                              <div key={i} className="w-2.5 h-2 bg-foreground/15 rounded-[1px]" />
                            ))}
                            <div className="w-4 h-2 bg-foreground/15 rounded-[1px]" />
                          </div>
                          <div className="flex gap-0.5 justify-center">
                            <div className="w-4 h-2 bg-foreground/15 rounded-[1px]" />
                            <div className="w-16 h-2 bg-foreground/15 rounded-[1px]" />
                            <div className="w-4 h-2 bg-foreground/15 rounded-[1px]" />
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-[2px] pt-1">
                        {[...Array(10)].map((_, i) => (
                          <div key={i} className="w-[2px] h-[2px] bg-foreground/20 rounded-full" />
                        ))}
                      </div>
                    </div>
                    <div className="mt-2 mx-auto w-16 h-9 bg-foreground/5 rounded-sm border border-foreground/10 shadow-inner mb-2" />
                  </div>
                </motion.div>
              </div>

              {/* Carousel controls */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setCurrentDeviceIndex((prev) => (prev - 1 + 3) % 3)}
                  className="w-10 h-10 rounded-full bg-brand/10 hover:bg-brand/20 transition-colors flex items-center justify-center"
                  aria-label="Previous device"
                >
                  <svg className="w-5 h-5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {/* Dots indicator */}
                <div className="flex gap-2 items-center">
                  {[0, 1, 2].map((index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentDeviceIndex(index)}
                      className={`h-2 rounded-full transition-all ${
                        currentDeviceIndex === index ? 'w-6 bg-brand' : 'w-2 bg-brand/30'
                      }`}
                      aria-label={`Go to device ${index + 1}`}
                    />
                  ))}
                </div>

                <button
                  onClick={() => setCurrentDeviceIndex((prev) => (prev + 1) % 3)}
                  className="w-10 h-10 rounded-full bg-brand/10 hover:bg-brand/20 transition-colors flex items-center justify-center"
                  aria-label="Next device"
                >
                  <svg className="w-5 h-5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="hidden md:block absolute inset-0 bg-gradient-to-br from-brand/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </motion.div>

        {/* Position 3 (Bottom Left): Bezpieczny kontakt - SHORT */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="group relative overflow-hidden md:bg-gradient-to-br md:from-card md:to-card/50 md:border md:border-border md:rounded-3xl md:p-8 md:hover:border-brand/40 md:transition-all md:duration-300 md:min-h-[380px]"
        >
          <div className="relative z-10 h-full flex flex-col">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              Bezpieczny kontakt
            </h3>
            <p className="text-muted-foreground text-base mb-6">
              Wbudowany system wiadomości. Negocjuj warunki bez podawania telefonu.
            </p>

            {/* Mockup: Chat Messages */}
            <div className="flex-1 flex flex-col justify-between">
              <div className="space-y-3 mb-4">
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 rounded-full bg-brand/20 flex-shrink-0 flex items-center justify-center text-brand">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="bg-muted/80 rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[75%]">
                    <p className="text-sm text-foreground mb-1">Witam! Czy mogę zobaczyć więcej zdjęć?</p>
                    <span className="text-xs text-muted-foreground">10:30</span>
                  </div>
                </div>
                <div className="flex items-start gap-2 justify-end">
                  <div className="bg-brand/20 rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[75%]">
                    <p className="text-sm text-foreground mb-1">Oczywiście! Wysyłam</p>
                    <span className="text-xs text-muted-foreground">10:32</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-brand/20 flex-shrink-0 flex items-center justify-center text-brand">
                    <User className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Message Input */}
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 bg-muted/50 rounded-2xl px-4 py-2.5 border border-border/50">
                  <input
                    type="text"
                    placeholder="Napisz wiadomość..."
                    className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                    disabled
                  />
                </div>
                <button className="w-10 h-10 rounded-2xl bg-brand hover:bg-brand/90 flex items-center justify-center flex-shrink-0 transition-colors">
                  <Send className="w-5 h-5 text-brand-foreground" />
                </button>
              </div>
            </div>
          </div>

          <div className="hidden md:block absolute inset-0 bg-gradient-to-br from-brand/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </motion.div>

        {/* Position 4 (Bottom Right): Czat AI - TALL */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="group relative overflow-hidden md:bg-gradient-to-br md:from-card md:to-card/50 md:border md:border-border md:rounded-3xl md:p-8 md:hover:border-brand/40 md:transition-all md:duration-300 md:min-h-[500px] md:-mt-[120px]"
        >
          <div className="relative z-10 h-full flex flex-col">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              Czat AI
            </h3>
            <p className="text-muted-foreground text-base mb-6">
              Nawigatorek - inteligentny asystent, który pomoże znaleźć to czego szukasz.
            </p>

            {/* Mockup: AI Chat */}
            <div className="flex-1 flex flex-col justify-between">
              <div className="space-y-3 mb-4">
                <div className="flex items-start gap-2 justify-end">
                  <div className="flex flex-col items-end gap-1">
                    <p className="text-[10px] text-brand font-semibold">Ty:</p>
                    <div className="bg-brand/20 rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[80%]">
                      <p className="text-sm text-foreground">Szukam hydraulika w Warszawie</p>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-brand/20 flex-shrink-0 flex items-center justify-center text-brand">
                    <User className="w-4 h-4" />
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand to-brand/60 flex-shrink-0 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-[10px] text-brand font-semibold">Nawigatorek:</p>
                    <div className="bg-muted/80 rounded-2xl rounded-tl-sm px-4 py-2.5 flex-1">
                      <p className="text-sm text-foreground mb-2.5">Znalazłem 4 ogłoszenia w Twojej okolicy:</p>

                    {/* Mini Post Results - Grid */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-background/50 border border-border/50 rounded-xl p-2 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-brand/20 flex-shrink-0 flex items-center justify-center text-brand text-[10px] font-semibold">
                          JK
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-foreground truncate">Hydraulik 24/7</div>
                          <div className="text-[11px] text-muted-foreground truncate">80 PLN/h</div>
                        </div>
                      </div>
                      <div className="bg-background/50 border border-border/50 rounded-xl p-2 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-brand/20 flex-shrink-0 flex items-center justify-center text-brand text-[10px] font-semibold">
                          MP
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-foreground truncate">Instalacje</div>
                          <div className="text-[11px] text-muted-foreground truncate">70 PLN/h</div>
                        </div>
                      </div>
                      <div className="bg-background/50 border border-border/50 rounded-xl p-2 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-brand/20 flex-shrink-0 flex items-center justify-center text-brand text-[10px] font-semibold">
                          AS
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-foreground truncate">Naprawy</div>
                          <div className="text-[11px] text-muted-foreground truncate">65 PLN/h</div>
                        </div>
                      </div>
                      <div className="bg-background/50 border border-border/50 rounded-xl p-2 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-brand/20 flex-shrink-0 flex items-center justify-center text-brand text-[10px] font-semibold">
                          TW
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-foreground truncate">Serwis</div>
                          <div className="text-[11px] text-muted-foreground truncate">75 PLN/h</div>
                        </div>
                      </div>
                    </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message Input */}
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 bg-muted/50 rounded-2xl px-4 py-2.5 border border-border/50">
                  <Sparkles className="w-4 h-4 text-brand flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Zapytaj Nawigatorka..."
                    className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                    disabled
                  />
                </div>
                <button className="w-10 h-10 rounded-2xl bg-brand hover:bg-brand/90 flex items-center justify-center flex-shrink-0 transition-colors">
                  <Send className="w-5 h-5 text-brand-foreground" />
                </button>
              </div>
            </div>
          </div>

          <div className="hidden md:block absolute inset-0 bg-gradient-to-br from-brand/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </motion.div>

      </div>
    </section>
  )
}
