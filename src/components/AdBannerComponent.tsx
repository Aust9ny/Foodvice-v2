import React, { useState } from 'react';
import { Sparkles, ExternalLink, ShieldCheck, Tag, X } from 'lucide-react';
import { AdBanner, UserSubscription } from '../types';

interface AdBannerComponentProps {
  ad: AdBanner;
  subscription: UserSubscription;
  onOpenSubscriptionModal: () => void;
  variant?: 'card' | 'inline' | 'sticky';
}

export const AdBannerComponent: React.FC<AdBannerComponentProps> = ({
  ad,
  subscription,
  onOpenSubscriptionModal,
  variant = 'card',
}) => {
  const [dismissed, setDismissed] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // If user is VIP, do NOT show ads
  if (subscription.isVip) {
    return (
      <div className="bg-amber-500/10 border border-amber-300/60 rounded-xl p-2.5 flex items-center justify-between text-xs text-amber-900">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-amber-400/30 flex items-center justify-center text-amber-800">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <div>
            <p className="font-bold text-[11px]">Foodvice Pro VIP Shield</p>
            <p className="text-[10px] text-amber-700">All sponsored banner ads and promotions are muted.</p>
          </div>
        </div>
        <span className="text-[9px] font-extrabold bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded">
          ACTIVE
        </span>
      </div>
    );
  }

  if (dismissed) return null;

  const handleCopyCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (ad.promoCode) {
      navigator.clipboard?.writeText(ad.promoCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  if (variant === 'inline') {
    return (
      <div className="bg-[#E8F8EF] border border-[#00B14F]/30 rounded-xl p-2.5 shadow-2xs relative overflow-hidden">
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <img
              src={ad.image}
              alt={ad.brand}
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-lg object-cover shrink-0 border border-[#00B14F]/20"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1 mb-0.5">
                <span className="text-[8px] font-extrabold bg-[#00B14F] text-white px-1 py-0.2 rounded">
                  {ad.badge || 'AD'}
                </span>
                <span className="text-[9px] font-bold text-[#676767] truncate">{ad.brand}</span>
              </div>
              <p className="text-[11px] font-extrabold text-[#1C1C1C] truncate">{ad.title}</p>
              <p className="text-[10px] text-[#676767] line-clamp-1">{ad.subtitle}</p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1 shrink-0">
            <button
              onClick={onOpenSubscriptionModal}
              className="text-[9px] text-amber-700 font-bold hover:underline flex items-center gap-0.5"
            >
              <Sparkles className="w-2.5 h-2.5" />
              <span>Go Ad-Free</span>
            </button>
            <button
              onClick={() => window.open(ad.url || '#', '_blank')}
              className="px-2 py-1 bg-[#00B14F] hover:bg-[#008C3E] text-white text-[10px] font-extrabold rounded-lg shadow-2xs transition-colors"
            >
              {ad.ctaText}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Default Card variant
  return (
    <div className="bg-white rounded-xl border border-[#EEEEEE] shadow-2xs overflow-hidden transition-all hover:border-[#00B14F] relative group">
      {/* Top Banner Tag */}
      <div className="flex items-center justify-between px-3 py-1 bg-[#F7F7F7] border-b border-[#EEEEEE] text-[9px] text-[#676767] font-semibold">
        <div className="flex items-center gap-1.5">
          <span className="bg-[#E8F8EF] text-[#00B14F] px-1 py-0.2 rounded font-extrabold uppercase tracking-wider text-[8px]">
            {ad.badge || 'SPONSORED'}
          </span>
          <span className="font-bold text-[#1C1C1C]">{ad.brand}</span>
        </div>
        <button
          onClick={onOpenSubscriptionModal}
          className="text-amber-800 hover:text-amber-900 font-bold flex items-center gap-1 hover:underline"
        >
          <Sparkles className="w-2.5 h-2.5 text-amber-500" />
          <span>Hide with Pro VIP</span>
        </button>
      </div>

      {/* Ad Image & Content */}
      <div className="relative h-28 w-full overflow-hidden">
        <img
          src={ad.image}
          alt={ad.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent p-2.5 flex flex-col justify-end text-white">
          <h4 className="text-xs font-extrabold leading-snug drop-shadow-xs">{ad.title}</h4>
          <p className="text-[10px] text-gray-200 line-clamp-1 mt-0.5">{ad.subtitle}</p>
        </div>
      </div>

      {/* Footer CTA & Promo Code */}
      <div className="p-2.5 bg-white flex items-center justify-between gap-2">
        {ad.promoCode ? (
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1 bg-[#E8F8EF] text-[#00B14F] border border-[#00B14F]/20 px-2 py-1 rounded-lg text-[10px] font-mono font-extrabold hover:bg-emerald-100 transition-colors"
          >
            <Tag className="w-3 h-3 text-[#00B14F]" />
            <span>{copiedCode ? 'COPIED!' : ad.promoCode}</span>
          </button>
        ) : (
          <div className="text-[10px] text-[#676767] font-medium">Foodvice Partner</div>
        )}

        <button
          onClick={() => window.open(ad.url || '#', '_blank')}
          className="flex items-center gap-1 px-2.5 py-1 bg-[#00B14F] hover:bg-[#008C3E] text-white rounded-lg text-[11px] font-extrabold transition-all active:scale-95 shadow-xs"
        >
          <span>{ad.ctaText}</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
