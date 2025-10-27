'use client'

import { cn } from '@/lib/utils'

interface Card {
  title: string
  description: string
  image: string
  content?: React.ReactNode
}

interface AppleCardsCarouselProps {
  cards: Card[]
  className?: string
}

export function AppleCardsCarousel({ cards, className }: AppleCardsCarouselProps) {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-3 gap-6 w-full', className)}>
      {cards.map((card, index) => (
        <div key={index}>
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl overflow-hidden shadow-xl transition-transform hover:scale-[1.02] duration-300">
            <div className="relative h-[20rem] md:h-[24rem] overflow-hidden">
              <img
                src={card.image}
                alt={card.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-transparent" />
              <div className="absolute top-0 left-0 right-0 h-48 bg-black/30 backdrop-blur-md" style={{ maskImage: 'linear-gradient(to bottom, black 0%, black 40%, transparent 100%)' }} />
              <div className="absolute top-4 left-4 right-4">
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-2">{card.title}</h3>
                <p className="text-white text-base md:text-lg">{card.description}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
