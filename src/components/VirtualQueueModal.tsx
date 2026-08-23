import React, { useState } from 'react';
import { Clock, Users, X, CheckCircle, Bell, AlertTriangle, ShieldCheck, Sparkles, QrCode } from 'lucide-react';
import { QueueTicket, UserSubscription } from '../types';

interface VirtualQueueModalProps {
  queue: QueueTicket | null;
  onClose: () => void;
  onCancelQueue: (ticketId: string) => void;
  subscription: UserSubscription;
  onOpenSubscriptionModal: () => void;
}

export const VirtualQueueModal: React.FC<VirtualQueueModalProps> = ({
  queue,
  onClose,
  onCancelQueue,
  subscription,
  onOpenSubscriptionModal,
}) => {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  if (!queue) return null;

  const isTableReady = queue.status === 'called' || queue.positionInLine <= 1;

  return (
    <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl p-4 space-y-3 animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#EEEEEE] pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#E8F8EF] text-[#00B14F] flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-[#1C1C1C] leading-tight">
                Live Virtual Queue Ticket
              </h3>
              <p className="text-[11px] text-[#676767]">{queue.restaurantName}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#F2F2F2] hover:bg-gray-200 flex items-center justify-center text-[#676767] transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Live Table Buzzer Alert when Ready */}
        {isTableReady ? (
          <div className="bg-[#00B14F] text-white rounded-xl p-3.5 text-center space-y-1.5 shadow-md animate-pulse">
            <div className="flex items-center justify-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-200 animate-spin" />
              <h4 className="text-sm font-extrabold tracking-wide uppercase">Your Table Is Ready!</h4>
            </div>
            <p className="text-[11px] text-emerald-50">
              Please proceed to the host counter at {queue.restaurantName} and present this ticket.
            </p>
          </div>
        ) : (
          <div className="bg-[#F9FAF8] border border-[#EEEEEE] rounded-2xl p-4 text-center space-y-2.5 relative overflow-hidden">
            {/* VIP Priority Badge if applicable */}
            {subscription.isVip && (
              <div className="inline-flex items-center gap-1 bg-amber-400 text-[#1C1C1C] px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-wider uppercase mb-1 shadow-xs">
                <ShieldCheck className="w-3 h-3" />
                <span>VIP PRIORITY QUEUE ACTIVE</span>
              </div>
            )}

            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-[#676767] uppercase tracking-widest">
                Ticket Number
              </span>
              <h1 className="text-3xl font-extrabold text-[#1C1C1C] tracking-tight font-mono">
                {queue.ticketNumber}
              </h1>
            </div>

            {/* Position In Line & Estimated Wait */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="bg-white rounded-xl p-2.5 border border-[#EEEEEE] shadow-2xs">
                <div className="flex items-center justify-center gap-1 text-[#00B14F] mb-0.5">
                  <Users className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-extrabold uppercase">Ahead of You</span>
                </div>
                <p className="text-lg font-extrabold text-[#1C1C1C]">
                  {queue.positionInLine <= 1 ? 'Next up!' : `${queue.positionInLine} groups`}
                </p>
              </div>

              <div className="bg-white rounded-xl p-2.5 border border-[#EEEEEE] shadow-2xs">
                <div className="flex items-center justify-center gap-1 text-[#D48D3B] mb-0.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-extrabold uppercase">Est. Wait</span>
                </div>
                <p className="text-lg font-extrabold text-[#1C1C1C]">
                  ~{queue.estimatedMinutes} mins
                </p>
              </div>
            </div>

            {/* Ticket Info Details */}
            <div className="pt-2 text-[11px] text-[#676767] flex items-center justify-between border-t border-[#EEEEEE] px-1">
              <span>Party Size: <b className="text-[#1C1C1C]">{queue.partySize} guests</b></span>
              <span>Name: <b className="text-[#1C1C1C]">{queue.userName}</b></span>
            </div>
          </div>
        )}

        {/* VIP Upsell if not VIP */}
        {!subscription.isVip && (
          <div
            onClick={onOpenSubscriptionModal}
            className="bg-[#FFF8EE] border border-amber-200/80 rounded-xl p-2.5 flex items-center justify-between cursor-pointer hover:bg-amber-100/70 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <div>
                <p className="text-[11px] font-extrabold text-[#1C1C1C]">Fast-Track Your Queue with VIP</p>
                <p className="text-[10px] text-[#676767]">VIP members skip up to 50% of the line.</p>
              </div>
            </div>
            <span className="text-[10px] font-extrabold text-[#00B14F] underline">Upgrade</span>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex items-center gap-2 pt-0.5">
          {showCancelConfirm ? (
            <div className="w-full flex items-center gap-2 animate-in fade-in">
              <button
                onClick={() => onCancelQueue(queue.id)}
                className="flex-1 py-2 rounded-xl bg-rose-600 text-white font-extrabold text-xs"
              >
                Yes, Leave Queue
              </button>
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 py-2 rounded-xl bg-[#F2F2F2] text-[#1C1C1C] font-extrabold text-xs"
              >
                Keep Spot
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="py-2 px-3.5 rounded-xl border border-[#EEEEEE] hover:bg-gray-50 text-[#676767] text-xs font-bold"
              >
                Leave Queue
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2 rounded-xl bg-[#00B14F] hover:bg-[#008C3E] text-white font-extrabold text-xs shadow-xs"
              >
                Keep in Background
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
