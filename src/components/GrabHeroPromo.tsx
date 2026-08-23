import React, { useState, useEffect } from 'react';
import { Sparkles, Award, Utensils, PlusCircle, Compass, ShieldCheck, ArrowRight, Heart } from 'lucide-react';
import { UserSubscription, DietaryTag } from '../types';

interface GrabHeroPromoProps {
  subscription: UserSubscription;
  onOpenSubscriptionModal: () => void;
  onOpenSuggestModal: () => void;
  onSelectQuickCategory: (category: string | DietaryTag) => void;
  onOpenNearbyRadar: () => void;
  onOpenLiveMap: () => void;
}

const HERO_SLIDES = [
  {
    id: 1,
    tag: '🏮 TRAVELER’S FOOD GUIDE',
    title: 'Support Traditional & Old Restaurants',
    subtitle: 'Discover authentic mom-and-pop eateries and grandmother recipes unable to use complex delivery tech.',
    gradient: 'from-emerald-950/90 via-emerald-900/80 to-teal-950/90',
    bgImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1000&auto=format&fit=crop&q=80',
    cta: 'Explore Heritage Spots',
    action: 'explore'
  },
  {
    id: 2,
    tag: '📍 COMMUNITY CROWD-MAPPING',
    title: 'Suggest a Hidden Food Gem',
    subtitle: 'Add local street stalls and family-run diners to help travelers find real artisan food.',
    gradient: 'from-amber-950/90 via-amber-900/80 to-stone-900/90',
    bgImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1000&auto=format&fit=crop&q=80',
    cta: '+ Add a Restaurant',
    action: 'suggest'
  },
  {
    id: 3,
    tag: '✨ ONE-TIME PAY FOR NO ADS',
    title: 'Cancel Ads Forever for $4.99',
    subtitle: 'Single lifetime payment — zero recurring fees. Support the offline restaurant mapping initiative.',
    gradient: 'from-teal-950/90 via-emerald-900/80 to-emerald-950/90',
    bgImage: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1000&auto=format&fit=crop&q=80',
    cta: 'Remove Ads ($4.99)',
    action: 'adfree'
  }
];

export const GrabHeroPromo: React.FC<GrabHeroPromoProps> = ({
  subscription,
  onOpenSubscriptionModal,
  onOpenSuggestModal,
  onSelectQuickCategory,
  onOpenNearbyRadar,
  onOpenLiveMap,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  const slide = HERO_SLIDES[currentSlide];

  return (
    <div className="max-w-lg mx-auto px-3.5 pt-2 pb-1 space-y-2.5">
      {/* Hero Carousel Banner */}
      <div 
        id="hero-banner-carousel"
        className="relative rounded-2xl overflow-hidden shadow-2xs aspect-21/8 min-h-[130px] text-white"
      >
        {/* Background Image */}
        <img
          src={slide.bgImage}
          alt={slide.title}
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
        />
        {/* Gradient Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient} p-3.5 flex flex-col justify-between`} />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between h-full">
          <div>
            <span className="inline-block text-[9px] font-extrabold tracking-wider bg-white/20 backdrop-blur-xs px-2 py-0.5 rounded-full uppercase mb-1">
              {slide.tag}
            </span>
            <h2 className="text-sm sm:text-base font-extrabold leading-tight drop-shadow-xs">
              {slide.title}
            </h2>
            <p className="text-[11px] text-white/90 line-clamp-1 mt-0.5">
              {slide.subtitle}
            </p>
          </div>

          <div className="flex items-center justify-between pt-1.5">
            <button
              onClick={() => {
                if (slide.action === 'adfree') onOpenSubscriptionModal();
                else if (slide.action === 'suggest') onOpenSuggestModal();
                else if (slide.action === 'explore') onOpenLiveMap();
              }}
              className="flex items-center gap-1 text-[11px] font-extrabold bg-white text-[#1C1C1C] hover:bg-[#E8F8EF] hover:text-[#00B14F] px-2.5 py-1 rounded-lg shadow-xs transition-transform active:scale-95"
            >
              <span>{slide.cta}</span>
              <ArrowRight className="w-3 h-3 text-[#00B14F]" />
            </button>

            {/* Carousel Dots */}
            <div className="flex items-center gap-1">
              {HERO_SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    i === currentSlide ? 'w-4 bg-white' : 'w-1 bg-white/40'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Service Shortcut Tiles */}
      <div className="grid grid-cols-4 gap-1.5 text-center">
        {/* 3D Live Map Virtual Radar */}
        <button
          id="btn-quick-livemap"
          onClick={onOpenLiveMap}
          className="flex flex-col items-center p-2 rounded-xl bg-gradient-to-b from-emerald-50 to-white border border-emerald-200 shadow-2xs hover:border-[#00B14F] transition-all active:scale-95 group relative"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#00B14F] to-emerald-400 text-white flex items-center justify-center mb-1 group-hover:scale-105 transition-transform shadow-sm">
            <Compass className="w-5 h-5 animate-spin-slow" />
          </div>
          <span className="text-[11px] font-extrabold text-[#1C1C1C] leading-tight">3D Live Map</span>
          <span className="text-[9px] text-emerald-700 font-bold">Virtual Radar</span>
          <span className="absolute -top-1 -right-1 bg-[#00B14F] text-white text-[8px] font-extrabold px-1 rounded-full">
            LIVE
          </span>
        </button>

        {/* Suggest a Restaurant */}
        <button
          id="btn-quick-suggest"
          onClick={onOpenSuggestModal}
          className="flex flex-col items-center p-2 rounded-xl bg-white border border-[#EEEEEE] shadow-2xs hover:border-[#00B14F] transition-all active:scale-95 group"
        >
          <div className="w-10 h-10 rounded-full bg-[#E8F8EF] text-[#00B14F] flex items-center justify-center mb-1 group-hover:bg-[#00B14F] group-hover:text-white transition-colors shadow-2xs">
            <PlusCircle className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold text-[#1C1C1C] leading-tight">Add Stall</span>
          <span className="text-[9px] text-[#00B14F] font-semibold">Community</span>
        </button>

        {/* 50+ Years Heritage Gems */}
        <button
          id="btn-quick-heritage"
          onClick={() => onSelectQuickCategory('heritage')}
          className="flex flex-col items-center p-2 rounded-xl bg-white border border-[#EEEEEE] shadow-2xs hover:border-[#00B14F] transition-all active:scale-95 group"
        >
          <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mb-1 group-hover:bg-amber-600 group-hover:text-white transition-colors shadow-2xs">
            <Award className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold text-[#1C1C1C] leading-tight">Heritage</span>
          <span className="text-[9px] text-amber-700 font-semibold">50+ Years</span>
        </button>

        {/* Dietary Matcher */}
        <button
          id="btn-quick-dietary"
          onClick={() => onSelectQuickCategory('Vegan')}
          className="flex flex-col items-center p-2 rounded-xl bg-white border border-[#EEEEEE] shadow-2xs hover:border-[#00B14F] transition-all active:scale-95 group"
        >
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-[#00B14F] flex items-center justify-center mb-1 group-hover:bg-[#00B14F] group-hover:text-white transition-colors shadow-2xs">
            <Utensils className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold text-[#1C1C1C] leading-tight">Dietary</span>
          <span className="text-[9px] text-[#00B14F] font-semibold">Halal / Vegan</span>
        </button>
      </div>
    </div>
  );
};

