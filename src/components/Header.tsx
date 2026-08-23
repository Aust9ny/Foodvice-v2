import React, { useState } from 'react';
import { MapPin, Bell, Sparkles, Search, ChevronDown, Check, Volume2, VolumeX, ShieldCheck, Plus, Heart } from 'lucide-react';
import { UserLocation, NearbyNotification, UserSubscription } from '../types';
import { POPULAR_LOCATIONS } from '../data/mockRestaurants';

interface HeaderProps {
  currentLocation: UserLocation;
  onSelectLocation: (loc: UserLocation) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  subscription: UserSubscription;
  onOpenSubscriptionModal: () => void;
  onOpenSuggestModal: () => void;
  notifications: NearbyNotification[];
  onOpenNotifications: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLocation,
  onSelectLocation,
  searchQuery,
  onSearchChange,
  subscription,
  onOpenSubscriptionModal,
  onOpenSuggestModal,
  notifications,
  onOpenNotifications,
}) => {
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header 
      id="app-main-header"
      className="sticky top-0 z-40 bg-white/98 backdrop-blur-md border-b border-[#EEEEEE] shadow-2xs transition-all"
    >
      {/* Top High Density Bar */}
      <div className="max-w-lg mx-auto px-3.5 pt-2.5 pb-2">
        <div className="flex items-center justify-between gap-2">
          {/* Location Picker */}
          <div className="relative flex-1 min-w-0">
            <button
              id="header-location-picker-btn"
              onClick={() => setShowLocationPicker(!showLocationPicker)}
              className="flex items-center gap-1.5 text-left group w-full p-1 -ml-1 rounded-xl hover:bg-[#F7F7F7] transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-[#E8F8EF] flex items-center justify-center text-[#00B14F] shrink-0">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold text-[#00B14F] uppercase tracking-wider">
                    Exploring Food Area:
                  </span>
                  <ChevronDown className="w-3 h-3 text-[#676767] group-hover:text-[#1C1C1C] transition-transform duration-200" />
                </div>
                <p className="text-xs sm:text-sm font-extrabold text-[#1C1C1C] truncate leading-tight">
                  {currentLocation.name}
                </p>
              </div>
            </button>

            {/* Location Selector Dropdown */}
            {showLocationPicker && (
              <div className="absolute left-0 top-11 w-72 bg-white rounded-2xl shadow-xl border border-[#EEEEEE] p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-1.5 border-b border-[#EEEEEE] mb-1">
                  <span className="text-[10px] font-bold text-[#676767] uppercase tracking-wider">
                    Select Historic Food District
                  </span>
                </div>
                <div className="max-h-60 overflow-y-auto space-y-0.5">
                  {POPULAR_LOCATIONS.map((loc) => {
                    const isSelected = loc.name === currentLocation.name;
                    return (
                      <button
                        key={loc.name}
                        onClick={() => {
                          onSelectLocation(loc);
                          setShowLocationPicker(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors text-xs ${
                          isSelected ? 'bg-[#E8F8EF] text-[#00B14F] font-bold' : 'hover:bg-[#F7F7F7] text-[#1C1C1C]'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <p className="truncate font-semibold">{loc.name}</p>
                          <p className="text-[10px] text-[#676767] truncate">{loc.area}</p>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#00B14F] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Action Badges */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Suggest Restaurant Button */}
            <button
              id="header-suggest-stall-btn"
              onClick={onOpenSuggestModal}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#E8F8EF] text-[#00B14F] hover:bg-emerald-100 transition-colors border border-[#00B14F]/30"
              title="Add a traditional restaurant"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Stall</span>
            </button>

            {/* One-Time Ad-Free Pass Pill */}
            <button
              id="header-adfree-pass-btn"
              onClick={onOpenSubscriptionModal}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all shadow-xs ${
                subscription.isVip
                  ? 'bg-amber-400/20 text-amber-900 border border-amber-300 ring-1 ring-amber-400/30'
                  : 'bg-[#00B14F] hover:bg-[#008C3E] text-white'
              }`}
            >
              {subscription.isVip ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>AD-FREE</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-200 animate-pulse" />
                  <span>NO ADS</span>
                </>
              )}
            </button>

            {/* Notification Bell */}
            <button
              id="header-bell-btn"
              onClick={onOpenNotifications}
              className="relative w-7 h-7 rounded-full bg-[#F2F2F2] hover:bg-gray-200 flex items-center justify-center text-[#1C1C1C] transition-colors"
            >
              <Bell className="w-3.5 h-3.5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#00B14F] text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center border-2 border-white">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-2 relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#676767]" />
          <input
            id="search-restaurants-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search traditional stalls, dishes (e.g. Tom Yum, Biryani, Halal, Vegan)..."
            className="w-full bg-[#F7F7F7] hover:bg-[#F2F2F2] focus:bg-white text-[#1C1C1C] placeholder:text-[#676767] text-xs pl-8 pr-8 py-2 rounded-xl border border-[#EEEEEE] focus:border-[#00B14F] focus:outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#676767] hover:text-[#1C1C1C] text-xs p-1"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
