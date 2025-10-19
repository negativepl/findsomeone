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
import { Cpu, ShieldCheck, Building2 } from 'lucide-react';

export type BadgeType = 'verified' | 'company' | 'ai_bot';

interface BadgeConfig {
  icon: React.ReactNode;
  largeIcon: React.ReactNode;
  label: string;
  description: string;
  bgColor: string;
  bgColorHex: string;
  hoverColor: string;
  iconColor: string;
}

const BADGE_CONFIGS: Record<BadgeType, BadgeConfig> = {
  verified: {
    icon: <ShieldCheck className="w-6 h-6" strokeWidth={2} />,
    largeIcon: <ShieldCheck className="w-12 h-12" strokeWidth={2} />,
    label: 'Użytkownik zweryfikowany',
    description: 'Ten użytkownik przeszedł proces weryfikacji tożsamości. Oznacza to, że jego dane osobowe zostały potwierdzone przez nasz zespół, co zwiększa bezpieczeństwo i wiarygodność transakcji.',
    bgColor: 'bg-amber-100',
    bgColorHex: '#fef3c7',
    hoverColor: 'hover:bg-amber-200',
    iconColor: 'text-amber-800',
  },
  company: {
    icon: <Building2 className="w-6 h-6" strokeWidth={2} />,
    largeIcon: <Building2 className="w-12 h-12" strokeWidth={2} />,
    label: 'Konto firmowe',
    description: 'To konto reprezentuje firmę lub przedsiębiorstwo. Konta firmowe mogą oferować usługi komercyjne i są prowadzone przez zarejestrowane podmioty gospodarcze.',
    bgColor: 'bg-blue-100',
    bgColorHex: '#dbeafe',
    hoverColor: 'hover:bg-blue-200',
    iconColor: 'text-blue-800',
  },
  ai_bot: {
    icon: <Cpu className="w-6 h-6" strokeWidth={2} />,
    largeIcon: <Cpu className="w-12 h-12" strokeWidth={2} />,
    label: 'Bot AI',
    description: 'To konto jest zarządzane przez sztuczną inteligencję. Bot automatycznie publikuje i aktualizuje ogłoszenia, aby pomóc w wypełnieniu strony treścią.',
    bgColor: 'bg-purple-100',
    bgColorHex: '#f3e8ff',
    hoverColor: 'hover:bg-purple-200',
    iconColor: 'text-purple-800',
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
        style={{ backgroundColor: config.bgColorHex }}
        className={`rounded-full p-2 cursor-pointer shadow-md transition-colors ${className}`}
        aria-label={`Informacje o ${config.label.toLowerCase()}`}
      >
        <span className={config.iconColor}>{config.icon}</span>
      </button>

      {/* Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md bg-white rounded-3xl border-0" showCloseButton={false}>
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="rounded-full p-4" style={{ backgroundColor: config.bgColorHex }}>
              <span className={config.iconColor}>{config.largeIcon}</span>
            </div>
          </div>

          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-black text-center">
              {config.label}
            </DialogTitle>
            <DialogDescription className="text-black/70 text-center leading-relaxed text-base pt-2">
              {config.description}
            </DialogDescription>
          </DialogHeader>

          {/* Close button */}
          <Button
            onClick={() => setIsOpen(false)}
            className="w-full rounded-full bg-[#C44E35] hover:bg-[#B33D2A] text-white font-semibold mt-4"
          >
            Rozumiem
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
