import React, { useState } from 'react';
import { X, Check, Sparkles, ShieldCheck, Zap, Lock, Crown, HeartHandshake, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserSubscription } from '../types';
import { saveUserSubscription } from '../services/firebase';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: UserSubscription;
  onUpdateSubscription: (sub: UserSubscription) => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  subscription,
  onUpdateSubscription,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [successCelebration, setSuccessCelebration] = useState(false);

  if (!isOpen) return null;

  const handleBuyOneTimeAdRemoval = async () => {
    setIsProcessing(true);
    // Simulate secure one-time payment
    setTimeout(async () => {
      const newSub: UserSubscription = {
        isVip: true,
        plan: 'lifetime',
        status: 'active',
      };

      try {
        await saveUserSubscription('current_user', newSub);
      } catch {}

      onUpdateSubscription(newSub);
      setIsProcessing(false);
      setSuccessCelebration(true);

      // Trigger celebratory confetti
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#00B14F', '#F59E0B', '#10B981', '#FBBF24'],
      });

      setTimeout(() => {
        setSuccessCelebration(false);
        onClose();
      }, 2200);
    }, 1000);
  };

  const handleRestoreFree = async () => {
    const freeSub: UserSubscription = {
      isVip: false,
      status: 'free',
    };
    try {
      await saveUserSubscription('current_user', freeSub);
    } catch {}
    onUpdateSubscription(freeSub);
    onClose();
  };

  return (
    <div 
      id="subscription-modal-backdrop"
      className="fixed inset-0 z-70 bg-black/65 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
    >
      <div 
        id="subscription-modal-card"
        className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-300"
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-[#00B14F] to-[#008C3E] p-5 text-white text-center">
          <button
            id="close-subscription-modal-btn"
            onClick={onClose}
            className="absolute top-3.5 right-3.5 w-7 h-7 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          <div className="w-12 h-12 mx-auto rounded-full bg-[#E8F8EF] text-[#00B14F] flex items-center justify-center mb-2 shadow-xs">
            <Heart className="w-6 h-6 fill-[#00B14F]" />
          </div>

          <span className="text-[10px] font-extrabold tracking-widest bg-black/20 uppercase px-2.5 py-0.5 rounded-full inline-block mb-1">
            ONE-TIME PASS • NO SUBSCRIPTIONS
          </span>
          <h2 className="text-xl font-extrabold tracking-tight">Support Traditional Stalls</h2>
          <p className="text-[11px] text-white/90 mt-0.5 max-w-xs mx-auto">
            Pay once to permanently remove all ads and support local offline restaurant preservation.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-3">
          {successCelebration ? (
            <div className="py-6 text-center space-y-2 animate-in zoom-in-95">
              <div className="w-14 h-14 rounded-full bg-[#E8F8EF] text-[#00B14F] flex items-center justify-center mx-auto shadow-md">
                <Check className="w-7 h-7" />
              </div>
              <h3 className="text-base font-extrabold text-[#1C1C1C]">100% Ad-Free Forever!</h3>
              <p className="text-xs text-[#676767]">
                Thank you! All banner ads and sponsored clutter have been permanently removed from your Foodvice app.
              </p>
            </div>
          ) : (
            <>
              {/* Value Props */}
              <div className="space-y-2 bg-[#F7F7F7] p-3.5 rounded-xl border border-[#EEEEEE]">
                <div className="flex items-start gap-2.5 text-xs text-[#1C1C1C]">
                  <div className="w-4 h-4 rounded-full bg-[#E8F8EF] text-[#00B14F] flex items-center justify-center shrink-0 mt-0.5 font-bold">
                    <Check className="w-3 h-3" />
                  </div>
                  <div>
                    <span className="font-extrabold text-[#1C1C1C]">Pay Once, Ad-Free Forever</span>
                    <p className="text-[10px] text-[#676767]">No recurring monthly billing. One single payment removes 100% of ads permanently.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-xs text-[#1C1C1C]">
                  <div className="w-4 h-4 rounded-full bg-[#E8F8EF] text-[#00B14F] flex items-center justify-center shrink-0 mt-0.5 font-bold">
                    <Check className="w-3 h-3" />
                  </div>
                  <div>
                    <span className="font-extrabold text-[#1C1C1C]">Support Traditional Food Elders</span>
                    <p className="text-[10px] text-[#676767]">Helps us map and translate menus for traditional restaurants that cannot use tech.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-xs text-[#1C1C1C]">
                  <div className="w-4 h-4 rounded-full bg-[#E8F8EF] text-[#00B14F] flex items-center justify-center shrink-0 mt-0.5 font-bold">
                    <Check className="w-3 h-3" />
                  </div>
                  <div>
                    <span className="font-extrabold text-[#1C1C1C]">Offline Map & Guide Access</span>
                    <p className="text-[10px] text-[#676767]">Seamlessly browse traditional dishes even when roaming without data.</p>
                  </div>
                </div>
              </div>

              {/* One-Time Pricing Card */}
              <div className="p-3.5 rounded-xl border-2 border-[#00B14F] bg-[#E8F8EF]/40 flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-extrabold text-[#00B14F] uppercase tracking-wider bg-white px-2 py-0.5 rounded border border-[#00B14F]/30 inline-block mb-0.5">
                    LIFETIME AD-FREE PASS
                  </span>
                  <p className="text-sm font-bold text-gray-900">Single One-Time Payment</p>
                  <p className="text-[10px] text-gray-500">Never billed again</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-extrabold text-gray-900">$4.99</span>
                  <p className="text-[9px] text-gray-500 font-medium">USD one-time</p>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-1 space-y-2">
                <button
                  id="btn-buy-lifetime-pass"
                  onClick={handleBuyOneTimeAdRemoval}
                  disabled={isProcessing}
                  className="w-full py-3 rounded-xl bg-[#00B14F] hover:bg-[#008C3E] text-white font-extrabold text-xs shadow-md transition-all active:scale-98 flex items-center justify-center gap-1.5"
                >
                  {isProcessing ? (
                    <span>Processing Payment...</span>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                      <span>{subscription.isVip ? 'You have Lifetime Ad-Free Pass' : 'Remove Ads for $4.99 (One-Time Pay)'}</span>
                    </>
                  )}
                </button>

                {subscription.isVip && (
                  <button
                    onClick={handleRestoreFree}
                    className="w-full text-center text-[10px] text-gray-500 hover:text-rose-600 pt-0.5"
                  >
                    Reset to Default Free Mode (With Ads)
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
