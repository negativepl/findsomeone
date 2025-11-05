'use client'

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LottieIcon } from '@/components/LottieIcon';

export type BadgeType = 'verified' | 'company' | 'ai_bot';

interface BadgeConfig {
  animationPath: string;
  svgPath: string;
  label: string;
  description: string;
  bgColor: string;
  bgColorHex: string;
  hoverColor: string;
  iconColor: string;
}

const BADGE_CONFIGS: Record<BadgeType, BadgeConfig> = {
  verified: {
    animationPath: '/animations/verified.json',
    svgPath: '/icons/verified.svg',
    label: 'Użytkownik zweryfikowany',
    description: 'Ten użytkownik przeszedł proces weryfikacji tożsamości. Oznacza to, że jego dane osobowe zostały potwierdzone przez nasz zespół, co zwiększa bezpieczeństwo i wiarygodność transakcji.',
    bgColor: 'bg-card',
    bgColorHex: 'oklch(var(--card))',
    hoverColor: 'hover:bg-muted',
    iconColor: 'text-amber-800',
  },
  company: {
    animationPath: '/animations/company.json',
    svgPath: '/icons/company.svg',
    label: 'Konto firmowe',
    description: 'To konto reprezentuje firmę lub przedsiębiorstwo. Konta firmowe mogą oferować usługi komercyjne i są prowadzone przez zarejestrowane podmioty gospodarcze.',
    bgColor: 'bg-card',
    bgColorHex: 'oklch(var(--card))',
    hoverColor: 'hover:bg-muted',
    iconColor: 'text-blue-800',
  },
  ai_bot: {
    animationPath: '/animations/ai-bot.json',
    svgPath: '/icons/ai-bot.svg',
    label: 'Bot AI',
    description: 'To konto jest zarządzane przez sztuczną inteligencję. Bot automatycznie publikuje i aktualizuje ogłoszenia, aby pomóc w wypełnieniu strony treścią.',
    bgColor: 'bg-card',
    bgColorHex: 'oklch(var(--card))',
    hoverColor: 'hover:bg-muted',
    iconColor: 'text-purple-800',
  },
};

interface UserBadgeProps {
  type: BadgeType;
  className?: string;
}

export function UserBadge({ type, className = '' }: UserBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const config = BADGE_CONFIGS[type];

  return (
    <>
      {/* Badge button */}
      <button
        onClick={() => setIsOpen(true)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`rounded-full p-2 cursor-pointer shadow-md transition-colors ${config.bgColor} ${config.hoverColor} ${className}`}
        aria-label={`Informacje o ${config.label.toLowerCase()}`}
      >
        <LottieIcon
          animationPath={config.animationPath}
          fallbackSvg={<img src={config.svgPath} alt={config.label} className="w-full h-full" />}
          className="w-6 h-6"
          isHovered={isHovered}
        />
      </button>

      {/* Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md bg-card rounded-3xl border border-border" showCloseButton={false}>
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className={`rounded-full p-4 ${config.bgColor}`}>
              <LottieIcon
                animationPath={config.animationPath}
                fallbackSvg={<img src={config.svgPath} alt={config.label} className="w-full h-full" />}
                className="w-12 h-12"
                isHovered={isOpen}
              />
            </div>
          </div>

          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-foreground text-center">
              {config.label}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-center leading-relaxed text-base pt-2">
              {config.description}
            </DialogDescription>
          </DialogHeader>

          {/* Close button */}
          <Button
            onClick={() => setIsOpen(false)}
            className="w-full rounded-full bg-brand hover:bg-brand/90 text-white font-semibold mt-4"
          >
            Rozumiem
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
