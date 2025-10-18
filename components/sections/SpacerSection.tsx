import { HomepageSection } from '@/lib/homepage-sections/types'

interface SpacerSectionProps {
  section: HomepageSection
}

export function SpacerSection({ section }: SpacerSectionProps) {
  const config = section.config as any
  const heightDesktop = config.height_desktop || 80
  const heightMobile = config.height_mobile || 40

  return (
    <div
      className="w-full"
      style={{
        height: `${heightMobile}px`
      }}
    >
      <style dangerouslySetInnerHTML={{
        __html: `
          @media (min-width: 768px) {
            #spacer-${section.id} {
              height: ${heightDesktop}px;
            }
          }
        `
      }} />
      <div id={`spacer-${section.id}`} />
    </div>
  )
}
