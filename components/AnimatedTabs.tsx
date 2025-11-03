'use client'

import { useRef, useEffect, useState, ReactNode } from 'react'

interface TabItem {
  id: string
  label: string
  count?: number
  icon?: ReactNode
}

interface AnimatedTabsProps {
  tabs: TabItem[]
  activeTab: string
  onTabChange: (tabId: string) => void
  className?: string
  showLoader?: boolean // Whether to show TopLoader on tab change
}

export function AnimatedTabs({ tabs, activeTab, onTabChange, className = '', showLoader = false }: AnimatedTabsProps) {
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })
  const tabsRef = useRef<{ [key: string]: HTMLButtonElement | null }>({})

  useEffect(() => {
    const currentTab = tabsRef.current[activeTab]
    if (currentTab) {
      setIndicatorStyle({
        left: currentTab.offsetLeft,
        width: currentTab.offsetWidth,
      })
    }
  }, [activeTab])

  return (
    <div className={`relative flex gap-1 md:gap-2 border-b-2 border-border ${className}`}>
      {/* Animated indicator bar */}
      <div
        className="absolute bottom-0 h-0.5 bg-[#C44E35] transition-all duration-300 ease-out"
        style={{
          left: `${indicatorStyle.left}px`,
          width: `${indicatorStyle.width}px`,
        }}
      />

      {tabs.map((tab) => (
        <button
          key={tab.id}
          ref={(el) => (tabsRef.current[tab.id] = el)}
          onClick={() => onTabChange(tab.id)}
          data-navigate={showLoader ? "true" : undefined}
          data-no-loader={!showLoader ? "true" : undefined}
          className={`flex items-center gap-1.5 md:gap-3 px-3 md:px-6 py-3 md:py-4 font-semibold transition-colors duration-200 relative text-sm md:text-base whitespace-nowrap ${
            activeTab === tab.id
              ? 'text-[#B33D2A]'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
          <span className="transition-colors duration-200">{tab.label}</span>
          {tab.count !== undefined && (
            <span
              className={`px-1.5 md:px-2.5 py-0.5 md:py-1 rounded-full text-xs font-bold transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-[#C44E35] text-white'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
