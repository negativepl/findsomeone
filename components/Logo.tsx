'use client'

export function Logo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="FindSomeone logo"
    >
      {/* Lewa sylwetka - jaśniejszy pomarańczowy */}
      <circle cx="32" cy="28" r="11" fill="#E87B5C" />
      <path
        d="M32 42 C24 42, 18 47, 18 60 L18 78 C18 80, 19 82, 21 82 L43 82 C45 82, 46 80, 46 78 L46 60 C46 47, 40 42, 32 42 Z"
        fill="#E87B5C"
      />

      {/* Prawa sylwetka - ciemniejszy pomarańczowy */}
      <circle cx="68" cy="28" r="11" className="fill-brand" />
      <path
        d="M68 42 C60 42, 54 47, 54 60 L54 78 C54 80, 55 82, 57 82 L79 82 C81 82, 82 80, 82 78 L82 60 C82 47, 76 42, 68 42 Z"
        className="fill-brand"
      />
    </svg>
  )
}

export function LogoWithText({ className = "", showTextOnMobile = false }: { className?: string, showTextOnMobile?: boolean }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Logo className="w-9 h-9 flex-shrink-0" />
      <div className={`${showTextOnMobile ? 'flex' : 'hidden xl:flex'} flex-col`}>
        <span className="text-xl font-bold text-foreground leading-none font-[family-name:var(--font-lora)]">FindSomeone</span>
      </div>
    </div>
  )
}
