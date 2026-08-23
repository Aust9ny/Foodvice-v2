import React from 'react';
import { DietaryTag } from '../types';
import { SlidersHorizontal, Sparkles, Clock, Star, Flame, ShieldAlert } from 'lucide-react';

interface DietaryFilterBarProps {
  selectedDietary: DietaryTag[];
  onToggleDietary: (tag: DietaryTag) => void;
  maxWaitMinutes: number | null;
  onSetMaxWaitMinutes: (mins: number | null) => void;
  minRating: number | null;
  onSetMinRating: (rating: number | null) => void;
  onClearFilters: () => void;
  activeFilterCount: number;
}

const DIETARY_OPTIONS: { tag: DietaryTag; icon: string; label: string; bg: string }[] = [
  { tag: 'Halal', icon: '🥩', label: 'Halal Certified', bg: 'hover:border-emerald-400' },
  { tag: 'Vegan', icon: '🌿', label: 'Vegan', bg: 'hover:border-green-400' },
  { tag: 'Gluten-Free', icon: '🌾', label: 'Gluten-Free (Celiac)', bg: 'hover:border-amber-400' },
  { tag: 'Vegetarian', icon: '🥗', label: 'Vegetarian', bg: 'hover:border-lime-400' },
  { tag: 'Nut-Free', icon: '🥜', label: 'Nut-Allergy Safe', bg: 'hover:border-orange-400' },
  { tag: 'Dairy-Free', icon: '🥛', label: 'Dairy-Free', bg: 'hover:border-blue-400' },
  { tag: 'Keto', icon: '🥑', label: 'Keto / Low-Carb', bg: 'hover:border-teal-400' },
  { tag: 'Pescatarian', icon: '🐟', label: 'Pescatarian', bg: 'hover:border-cyan-400' },
];

export const DietaryFilterBar: React.FC<DietaryFilterBarProps> = ({
  selectedDietary,
  onToggleDietary,
  maxWaitMinutes,
  onSetMaxWaitMinutes,
  minRating,
  onSetMinRating,
  onClearFilters,
  activeFilterCount,
}) => {
  return (
    <div className="w-full bg-white border-b border-[#EEEEEE] py-2 shadow-2xs">
      <div className="max-w-lg mx-auto px-3.5">
        {/* High Density Scrollable Pills Container */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {/* Quick Clear or Filter Indicator */}
          {activeFilterCount > 0 ? (
            <button
              onClick={onClearFilters}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 text-[11px] font-bold shrink-0 border border-rose-200 hover:bg-rose-100 transition-colors"
            >
              <span>Clear ({activeFilterCount})</span>
              <span className="text-[10px]">✕</span>
            </button>
          ) : (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#F2F2F2] text-[#676767] text-[11px] font-bold shrink-0">
              <SlidersHorizontal className="w-3 h-3 text-[#676767]" />
              <span>Filters:</span>
            </div>
          )}

          {/* Quick Wait Time Filter: < 15 Mins */}
          <button
            onClick={() => onSetMaxWaitMinutes(maxWaitMinutes === 15 ? null : 15)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold shrink-0 border transition-all ${
              maxWaitMinutes === 15
                ? 'bg-[#00B14F] text-white border-[#00B14F] font-bold shadow-xs'
                : 'bg-[#FFF4E5] text-[#D48D3B] border-amber-200 hover:border-[#00B14F]'
            }`}
          >
            <Clock className="w-3 h-3 text-[#D48D3B]" />
            <span>Fast Seating (&lt;15m)</span>
          </button>

          {/* Quick Rating Filter: 4.8+ */}
          <button
            onClick={() => onSetMinRating(minRating === 4.8 ? null : 4.8)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold shrink-0 border transition-all ${
              minRating === 4.8
                ? 'bg-[#00B14F] text-white border-[#00B14F] font-bold shadow-xs'
                : 'bg-white text-[#1C1C1C] border-[#DDD] hover:border-[#00B14F]'
            }`}
          >
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>Top Rated (4.8+)</span>
          </button>

          {/* Dietary Tag Pills in High Density Tag Style */}
          {DIETARY_OPTIONS.map((opt) => {
            const isSelected = selectedDietary.includes(opt.tag);
            return (
              <button
                key={opt.tag}
                onClick={() => onToggleDietary(opt.tag)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] whitespace-nowrap shrink-0 border transition-all ${
                  isSelected
                    ? 'bg-[#00B14F] text-white border-[#00B14F] font-bold shadow-xs'
                    : 'bg-white text-[#1C1C1C] border-[#DDD] hover:border-[#00B14F]'
                }`}
              >
                <span className="text-[11px]">{opt.icon}</span>
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
