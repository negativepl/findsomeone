'use client'

interface MyListingsTabsProps {
  activeTab: 'all' | 'active' | 'rejected' | 'completed'
  allCount: number
  activeCount: number
  rejectedCount: number
  completedCount: number
  onTabChange: (tab: 'all' | 'active' | 'rejected' | 'completed') => void
}

export function MyListingsTabs({
  activeTab,
  allCount,
  activeCount,
  rejectedCount,
  completedCount,
  onTabChange,
}: MyListingsTabsProps) {
  return (
    <div className="flex gap-0.5 md:gap-2 border-b-2 border-black/10 overflow-x-auto scrollbar-hide">
      <button
        onClick={() => onTabChange('all')}
        className={`flex items-center gap-1 md:gap-3 px-2 md:px-6 py-3 md:py-4 font-semibold transition-all relative text-xs md:text-base whitespace-nowrap ${
          activeTab === 'all'
            ? 'text-[#C44E35]'
            : 'text-black/60 hover:text-black'
        }`}
      >
        <span>Wszystkie</span>
        <span className={`px-1.5 md:px-2.5 py-0.5 md:py-1 rounded-full text-xs font-bold ${
          activeTab === 'all'
            ? 'bg-[#C44E35] text-white'
            : 'bg-black/10 text-black/60'
        }`}>
          {allCount}
        </span>
        {activeTab === 'all' && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C44E35]" />
        )}
      </button>

      <button
        onClick={() => onTabChange('active')}
        className={`flex items-center gap-1 md:gap-3 px-2 md:px-6 py-3 md:py-4 font-semibold transition-all relative text-xs md:text-base whitespace-nowrap ${
          activeTab === 'active'
            ? 'text-[#C44E35]'
            : 'text-black/60 hover:text-black'
        }`}
      >
        <span>Aktywne</span>
        <span className={`px-1.5 md:px-2.5 py-0.5 md:py-1 rounded-full text-xs font-bold ${
          activeTab === 'active'
            ? 'bg-[#C44E35] text-white'
            : 'bg-black/10 text-black/60'
        }`}>
          {activeCount}
        </span>
        {activeTab === 'active' && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C44E35]" />
        )}
      </button>

      <button
        onClick={() => onTabChange('rejected')}
        className={`flex items-center gap-1 md:gap-3 px-2 md:px-6 py-3 md:py-4 font-semibold transition-all relative text-xs md:text-base whitespace-nowrap ${
          activeTab === 'rejected'
            ? 'text-[#C44E35]'
            : 'text-black/60 hover:text-black'
        }`}
      >
        <span>Odrzucone</span>
        <span className={`px-1.5 md:px-2.5 py-0.5 md:py-1 rounded-full text-xs font-bold ${
          activeTab === 'rejected'
            ? 'bg-[#C44E35] text-white'
            : 'bg-black/10 text-black/60'
        }`}>
          {rejectedCount}
        </span>
        {activeTab === 'rejected' && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C44E35]" />
        )}
      </button>

      <button
        onClick={() => onTabChange('completed')}
        className={`flex items-center gap-1 md:gap-3 px-2 md:px-6 py-3 md:py-4 font-semibold transition-all relative text-xs md:text-base whitespace-nowrap ${
          activeTab === 'completed'
            ? 'text-[#C44E35]'
            : 'text-black/60 hover:text-black'
        }`}
      >
        <span>Zakończone</span>
        <span className={`px-1.5 md:px-2.5 py-0.5 md:py-1 rounded-full text-xs font-bold ${
          activeTab === 'completed'
            ? 'bg-[#C44E35] text-white'
            : 'bg-black/10 text-black/60'
        }`}>
          {completedCount}
        </span>
        {activeTab === 'completed' && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C44E35]" />
        )}
      </button>
    </div>
  )
}
