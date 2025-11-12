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

export type BadgeType = 'verified' | 'company' | 'ai_bot';

interface BadgeConfig {
  icon: React.ReactNode;
  label: string;
  description: string;
  bgColor: string;
  hoverColor: string;
}

const BADGE_CONFIGS: Record<BadgeType, BadgeConfig> = {
  verified: {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 430 430" className="w-6 h-6">
        <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12">
          <path d="m145 222.22 45.14 45.14S252.8 204.49 297.15 160"/>
          <path d="M214.999 395c187.993-90.473 169.188-227.796 169.188-310.678C329.964 76.515 214.999 35 214.999 35S100.035 76.515 45.812 84.312c0 82.892-18.806 220.215 169.187 310.688"/>
        </g>
      </svg>
    ),
    label: 'Użytkownik zweryfikowany',
    description: 'Ten użytkownik przeszedł proces weryfikacji tożsamości. Oznacza to, że jego dane osobowe zostały potwierdzone przez nasz zespół, co zwiększa bezpieczeństwo i wiarygodność transakcji.',
    bgColor: 'bg-amber-300/70 dark:bg-amber-700/6 border-2 border-amber-200 dark:border-amber-800/60 backdrop-blur-sm',
    hoverColor: 'hover:bg-amber-300/80 dark:hover:bg-amber-700/12',
  },
  company: {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 430 430" className="w-6 h-6">
        <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12">
          <path d="m196.3 374.9-69.1.1v-90.6h69.1zm-34.4-90.4V375"/>
          <path d="m246.5 374.9-168.5.2V55.2l168.5-.2z"/>
          <path d="M134.5 82.3v24.8m26.8-24.8v24.8M188 82.3v24.8m-53.5 24.8v24.8m26.8-24.8v24.8m26.7-24.8v24.8m-53.5 24.8v24.8m26.8-24.8v24.8m26.7-24.8v24.8M134.5 231v24.8m26.8-24.8v24.8M188 231v24.8m26.8-173.5v24.8m0 24.8v24.8m0 24.8v24.8m0 24.7v24.8m-107-173.5v24.8m0 24.8v24.8m0 24.8v24.8m0 24.7v24.8"/>
          <path d="m246.5 374.9 106.1.2V147.4H246.5"/>
          <path d="M270.5 181.4h57.2m-57.2 26.7h57.2m-57.2 26.6h57.2m-57.2 26.7h57.2m-57.2 26.7h57.2m-57.2 26.7h57.2m-57.2 26.6h57.2"/>
        </g>
      </svg>
    ),
    label: 'Konto firmowe',
    description: 'To konto reprezentuje firmę lub przedsiębiorstwo. Konta firmowe mogą oferować usługi komercyjne i są prowadzone przez zarejestrowane podmioty gospodarcze.',
    bgColor: 'bg-blue-300/70 dark:bg-blue-700/6 border-2 border-blue-200 dark:border-blue-800/60 backdrop-blur-sm',
    hoverColor: 'hover:bg-blue-300/80 dark:hover:bg-blue-700/12',
  },
  ai_bot: {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 430 430" className="w-6 h-6">
        <g strokeWidth="12">
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M330 245h50v35"/>
          <circle cx="15" cy="15" r="15" stroke="currentColor" transform="matrix(0 1 1 0 365 280)"/>
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M330 185h50v-35"/>
          <circle cx="15" cy="15" r="15" stroke="currentColor" transform="matrix(0 1 1 0 365 120)"/>
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M100 245H50v35"/>
          <circle cx="50" cy="295" r="15" stroke="currentColor" transform="rotate(90 50 295)"/>
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M100 185H50v-35"/>
          <circle cx="50" cy="135" r="15" stroke="currentColor" transform="rotate(90 50 135)"/>
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M185 100V50h-35"/>
          <circle cx="135" cy="49.9998" r="15" stroke="currentColor" transform="rotate(-180 135 50)"/>
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M245 100V50h35"/>
          <circle cx="295" cy="49.9998" r="15" stroke="currentColor" transform="rotate(-180 295 50)"/>
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M245 330v50h35"/>
          <circle cx="295" cy="380" r="15" stroke="currentColor"/>
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M185 330v50h-35"/>
          <circle cx="135" cy="380" r="15" stroke="currentColor"/>
          <path stroke="currentColor" strokeLinejoin="round" d="M310 100c11.046 0 20 8.954 20 20v190c0 11.046-8.954 20-20 20H120c-11.046 0-20-8.954-20-20V120c0-11.046 8.954-20 20-20z"/>
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="m230 255-8.185-19.784M155 255l8.182-19.784m0 0L188.085 175h8.816l24.914 60.216m-58.633 0h58.633M262 255v-80"/>
        </g>
      </svg>
    ),
    label: 'Bot AI',
    description: 'To konto jest zarządzane przez sztuczną inteligencją. Bot automatycznie publikuje i aktualizuje ogłoszenia, aby pomóc w wypełnieniu strony treścią.',
    bgColor: 'bg-purple-300/70 dark:bg-purple-700/6 border-2 border-purple-200 dark:border-purple-800/60 backdrop-blur-sm',
    hoverColor: 'hover:bg-purple-300/80 dark:hover:bg-purple-700/12',
  },
};

interface UserBadgeProps {
  type: BadgeType;
  className?: string;
}

export function UserBadge({ type, className = '' }: UserBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const config = BADGE_CONFIGS[type];

  return (
    <>
      {/* Badge button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`rounded-full p-2 cursor-pointer shadow-md transition-colors text-foreground ${config.bgColor} ${config.hoverColor} ${className}`}
        aria-label={`Informacje o ${config.label.toLowerCase()}`}
      >
        {config.icon}
      </button>

      {/* Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md bg-card rounded-3xl border border-border" showCloseButton={false}>
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className={`rounded-full p-4 text-foreground ${config.bgColor}`}>
              <div className="w-12 h-12 flex items-center justify-center">
                {React.cloneElement(config.icon as React.ReactElement<any>, {
                  className: 'w-12 h-12'
                })}
              </div>
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
            className="w-full rounded-full bg-brand hover:bg-brand/90 text-brand-foreground font-semibold mt-4"
          >
            Rozumiem
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
