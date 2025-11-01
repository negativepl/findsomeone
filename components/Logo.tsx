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
      {/* Lewa sylwetka - czarna */}
      <circle cx="32" cy="28" r="11" fill="#1A1A1A" />
      <path
        d="M32 42 C24 42, 18 47, 18 60 L18 78 C18 80, 19 82, 21 82 L43 82 C45 82, 46 80, 46 78 L46 60 C46 47, 40 42, 32 42 Z"
        fill="#1A1A1A"
      />

      {/* Prawa sylwetka - pomarańczowa */}
      <circle cx="68" cy="28" r="11" fill="#C44E35" />
      <path
        d="M68 42 C60 42, 54 47, 54 60 L54 78 C54 80, 55 82, 57 82 L79 82 C81 82, 82 80, 82 78 L82 60 C82 47, 76 42, 68 42 Z"
        fill="#C44E35"
      />
    </svg>
  )
}

export function LogoWithText({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Logo className="w-9 h-9 flex-shrink-0" />
      <div className="hidden xl:flex flex-col -mt-1">
        <span className="text-xl font-bold text-black leading-none">FindSomeone</span>
        <span className="text-xs text-black/60 mt-0.5 leading-none text-left">Łączymy ludzi lokalnie</span>
      </div>
    </div>
  )
}
