import React from 'react';
import { Compass, Map, PlusCircle, Bookmark, MessageSquare, User, Sparkles, ShieldCheck, Navigation } from 'lucide-react';
import { UserSubscription } from '../types';

export type TabType = 'discover' | 'livemap' | 'suggest' | 'saved' | 'reviews' | 'account';

interface BottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  subscription: UserSubscription;
  savedCount: number;
  onOpenSuggestModal: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  subscription,
  savedCount,
  onOpenSuggestModal,
}) => {
  return (
    <nav 
      id="bottom-nav-container"
      className="fixed bottom-0 inset-x-0 z-40 bg-white/98 backdrop-blur-md border-t border-[#EEEEEE] shadow-lg pb-safe"
    >
      <div className="max-w-lg mx-auto flex items-center justify-around py-1 px-1.5">
        {/* Tab 1: Discover */}
        <button
          id="nav-tab-discover"
          onClick={() => onChangeTab('discover')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all ${
            activeTab === 'discover'
              ? 'text-[#00B14F] font-extrabold'
              : 'text-[#676767] hover:text-[#1C1C1C]'
          }`}
        >
          <Compass className={`w-4 h-4 ${activeTab === 'discover' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] leading-tight">Explore</span>
        </button>

        {/* Tab 2: 3D Live Map Virtual Radar */}
        <button
          id="nav-tab-livemap"
          onClick={() => onChangeTab('livemap')}
          className={`relative flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all ${
            activeTab === 'livemap'
              ? 'text-[#00B14F] font-extrabold'
              : 'text-[#676767] hover:text-[#1C1C1C]'
          }`}
        >
          <div className="relative">
            <Map className={`w-4 h-4 ${activeTab === 'livemap' ? 'stroke-[2.5]' : 'stroke-2'}`} />
            <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <span className="text-[10px] leading-tight">Live Map</span>
        </button>

        {/* Center Action: Suggest Stall */}
        <button
          id="nav-tab-suggest-center"
          onClick={onOpenSuggestModal}
          className="flex flex-col items-center gap-0.5 py-0.5 px-2.5 rounded-2xl bg-gradient-to-r from-[#00B14F] to-[#008C3E] text-white shadow-md active:scale-95 transition-transform shrink-0"
        >
          <PlusCircle className="w-4 h-4 stroke-[2.5]" />
          <span className="text-[9px] font-extrabold leading-tight">Add Stall</span>
        </button>

        {/* Tab 3: Saved / Food Itinerary */}
        <button
          id="nav-tab-saved"
          onClick={() => onChangeTab('saved')}
          className={`relative flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all ${
            activeTab === 'saved'
              ? 'text-[#00B14F] font-extrabold'
              : 'text-[#676767] hover:text-[#1C1C1C]'
          }`}
        >
          <Bookmark className={`w-4 h-4 ${activeTab === 'saved' ? 'stroke-[2.5] fill-[#00B14F]' : 'stroke-2'}`} />
          <span className="text-[10px] leading-tight">My Trip</span>
          {savedCount > 0 && (
            <span className="absolute -top-0.5 right-0.5 bg-[#00B14F] text-white text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center border-2 border-white">
              {savedCount}
            </span>
          )}
        </button>

        {/* Tab 4: Reviews & Profile */}
        <button
          id="nav-tab-reviews"
          onClick={() => onChangeTab('reviews')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all ${
            activeTab === 'reviews'
              ? 'text-[#00B14F] font-extrabold'
              : 'text-[#676767] hover:text-[#1C1C1C]'
          }`}
        >
          <MessageSquare className={`w-4 h-4 ${activeTab === 'reviews' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] leading-tight">Reviews</span>
        </button>

        {/* Tab 5: Account & Ad-Free */}
        <button
          id="nav-tab-account"
          onClick={() => onChangeTab('account')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all ${
            activeTab === 'account'
              ? 'text-[#00B14F] font-extrabold'
              : 'text-[#676767] hover:text-[#1C1C1C]'
          }`}
        >
          {subscription.isVip ? (
            <ShieldCheck className={`w-4 h-4 text-[#00B14F] ${activeTab === 'account' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          ) : (
            <User className={`w-4 h-4 ${activeTab === 'account' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          )}
          <span className="text-[10px] leading-tight">{subscription.isVip ? 'Ad-Free' : 'Profile'}</span>
        </button>
      </div>
    </nav>
  );
};

