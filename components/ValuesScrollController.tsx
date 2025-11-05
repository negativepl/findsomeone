'use client'

import { useEffect } from 'react'

export function ValuesScrollController() {
  useEffect(() => {
    const scrollContainer = document.querySelector('.scroll-snap-container') as HTMLElement
    const valuesSection = document.getElementById('values')
    const valuesSlider = document.getElementById('values-slider')

    if (!scrollContainer || !valuesSection || !valuesSlider) return

    let isInValuesSection = false
    let currentCardIndex = 0
    const totalCards = 3
    let isScrolling = false
    let scrollTimeout: NodeJS.Timeout
    let preventScroll = false

    // Better intersection detection
    const checkIfInSection = () => {
      const rect = valuesSection.getBoundingClientRect()
      const containerRect = scrollContainer.getBoundingClientRect()

      // Section is considered "active" if it's in the center 50% of viewport
      const inView = rect.top <= containerRect.height * 0.25 &&
                     rect.bottom >= containerRect.height * 0.75

      if (inView && !isInValuesSection) {
        // Entering values section
        isInValuesSection = true
        currentCardIndex = 0
        valuesSlider.scrollLeft = 0
        updateDots(0)
        preventScroll = false
      } else if (!inView && isInValuesSection) {
        // Leaving values section
        isInValuesSection = false
        preventScroll = false
      }

      return inView
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          checkIfInSection()
        })
      },
      {
        threshold: [0, 0.25, 0.5, 0.75, 1],
        root: scrollContainer
      }
    )

    observer.observe(valuesSection)

    const handleWheel = (e: WheelEvent) => {
      const inSection = checkIfInSection()

      if (!inSection) return

      const delta = e.deltaY

      if (Math.abs(delta) < 5) return // Ignore very small scrolls

      // Always prevent scroll while in section during animation
      if (isScrolling || preventScroll) {
        e.preventDefault()
        e.stopPropagation()
        return
      }

      if (delta > 0) {
        // Scrolling down
        if (currentCardIndex < totalCards - 1) {
          // Move to next card
          e.preventDefault()
          e.stopPropagation()
          preventScroll = true
          isScrolling = true
          currentCardIndex++
          scrollToCard(currentCardIndex)

          clearTimeout(scrollTimeout)
          scrollTimeout = setTimeout(() => {
            isScrolling = false
            preventScroll = false
          }, 700)
        } else {
          // On last card - allow scroll to next section
          isInValuesSection = false
        }
      } else if (delta < 0) {
        // Scrolling up
        if (currentCardIndex > 0) {
          // Move to previous card
          e.preventDefault()
          e.stopPropagation()
          preventScroll = true
          isScrolling = true
          currentCardIndex--
          scrollToCard(currentCardIndex)

          clearTimeout(scrollTimeout)
          scrollTimeout = setTimeout(() => {
            isScrolling = false
            preventScroll = false
          }, 700)
        } else {
          // On first card - allow scroll to previous section
          isInValuesSection = false
        }
      }
    }

    const scrollToCard = (index: number) => {
      const cardWidth = valuesSlider.scrollWidth / totalCards
      valuesSlider.scrollTo({
        left: cardWidth * index,
        behavior: 'smooth'
      })
      updateDots(index)
    }

    const updateDots = (index: number) => {
      for (let i = 1; i <= totalCards; i++) {
        const dot = document.getElementById(`dot-${i}`)
        if (dot) {
          if (i === index + 1) {
            dot.style.backgroundColor = 'hsl(var(--brand))'
            dot.style.width = '32px'
          } else {
            dot.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'
            dot.style.width = '32px'
          }
        }
      }
    }

    // Listen to wheel events on the scroll container
    scrollContainer.addEventListener('wheel', handleWheel, { passive: false })

    // Also handle manual horizontal scroll
    const handleSliderScroll = () => {
      if (isScrolling) return // Don't update during programmatic scroll

      const scrollLeft = valuesSlider.scrollLeft
      const cardWidth = valuesSlider.scrollWidth / totalCards
      const newIndex = Math.round(scrollLeft / cardWidth)

      if (newIndex !== currentCardIndex) {
        currentCardIndex = newIndex
        updateDots(currentCardIndex)
      }
    }

    valuesSlider.addEventListener('scroll', handleSliderScroll)

    return () => {
      observer.disconnect()
      scrollContainer.removeEventListener('wheel', handleWheel)
      valuesSlider.removeEventListener('scroll', handleSliderScroll)
      clearTimeout(scrollTimeout)
    }
  }, [])

  return null
}
