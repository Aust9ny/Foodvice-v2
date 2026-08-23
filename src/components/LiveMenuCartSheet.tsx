import React, { useState } from 'react';
import { ShoppingBag, X, Trash2, Plus, Minus, Check, ArrowRight, Sparkles, Utensils } from 'lucide-react';
import { OrderCartItem, UserSubscription } from '../types';

interface LiveMenuCartSheetProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: OrderCartItem[];
  onUpdateQuantity: (cartItemId: string, newQty: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onClearCart: () => void;
  subscription: UserSubscription;
  onOpenSubscriptionModal: () => void;
}

export const LiveMenuCartSheet: React.FC<LiveMenuCartSheetProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  subscription,
  onOpenSubscriptionModal,
}) => {
  const [tableNumber, setTableNumber] = useState('Table 7');
  const [orderPlaced, setOrderPlaced] = useState(false);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + item.menuItem.price * item.quantity, 0);
  const vipDiscount = subscription.isVip ? subtotal * 0.1 : 0; // 10% VIP discount
  const serviceCharge = (subtotal - vipDiscount) * 0.05;
  const finalTotal = subtotal - vipDiscount + serviceCharge;

  const handlePlaceOrder = () => {
    setOrderPlaced(true);
    setTimeout(() => {
      onClearCart();
      setOrderPlaced(false);
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="p-3.5 border-b border-[#EEEEEE] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#E8F8EF] text-[#00B14F] flex items-center justify-center font-bold">
              <ShoppingBag className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-[#1C1C1C]">Table Order & Live Menu</h3>
              <p className="text-[10px] text-[#676767]">{cartItems.length} dish types selected</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#F2F2F2] flex items-center justify-center text-[#676767]"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-3.5 overflow-y-auto space-y-3 flex-1">
          {orderPlaced ? (
            <div className="py-10 text-center space-y-2.5 animate-in zoom-in-95">
              <div className="w-14 h-14 bg-[#E8F8EF] text-[#00B14F] rounded-full flex items-center justify-center mx-auto shadow-sm">
                <Check className="w-7 h-7" />
              </div>
              <h3 className="text-base font-black text-[#1C1C1C]">Order Sent to Kitchen!</h3>
              <p className="text-xs text-[#676767] max-w-xs mx-auto">
                Your dishes are being freshly prepared with your custom dietary modifications for {tableNumber}.
              </p>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="py-10 text-center text-[#676767] space-y-2">
              <Utensils className="w-9 h-9 mx-auto text-gray-300 stroke-1" />
              <p className="text-xs font-semibold">Your table basket is currently empty.</p>
              <p className="text-[11px] text-[#676767]">
                Browse any restaurant's live menu to add dishes and customized dietary requests!
              </p>
            </div>
          ) : (
            <>
              {/* Table / Dining Mode selection */}
              <div className="flex items-center justify-between bg-[#F9FAF8] p-2 rounded-xl border border-[#EEEEEE] text-xs">
                <span className="font-extrabold text-[#1C1C1C]">Dine-in Table:</span>
                <input
                  type="text"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="bg-white border border-[#EEEEEE] font-extrabold px-2.5 py-1 rounded-lg text-center text-[#00B14F] w-24 focus:outline-none focus:border-[#00B14F]"
                />
              </div>

              {/* Items List */}
              <div className="space-y-2">
                {cartItems.map((item) => (
                  <div
                    key={item.cartItemId}
                    className="p-2.5 bg-white rounded-xl border border-[#EEEEEE] flex items-center justify-between gap-2.5 shadow-2xs"
                  >
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-extrabold text-[#1C1C1C] truncate">
                        {item.menuItem.name}
                      </h4>
                      <p className="text-xs font-extrabold text-[#00B14F]">
                        ${(item.menuItem.price * item.quantity).toFixed(2)}
                      </p>

                      {/* Selected Customizations */}
                      {Object.entries(item.selectedOptions).length > 0 && (
                        <p className="text-[9px] text-[#676767] truncate">
                          {Object.values(item.selectedOptions).join(', ')}
                        </p>
                      )}
                      {item.specialInstructions && (
                        <p className="text-[9px] text-amber-700 italic truncate">
                          Note: "{item.specialInstructions}"
                        </p>
                      )}
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-1.5 bg-[#F2F2F2] p-1 rounded-lg shrink-0">
                      <button
                        onClick={() => {
                          if (item.quantity > 1) {
                            onUpdateQuantity(item.cartItemId, item.quantity - 1);
                          } else {
                            onRemoveItem(item.cartItemId);
                          }
                        }}
                        className="w-5 h-5 rounded-md bg-white flex items-center justify-center text-[#1C1C1C] shadow-2xs"
                      >
                        {item.quantity === 1 ? <Trash2 className="w-3 h-3 text-rose-500" /> : <Minus className="w-3 h-3" />}
                      </button>
                      <span className="text-xs font-extrabold w-4 text-center text-[#1C1C1C]">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.cartItemId, item.quantity + 1)}
                        className="w-5 h-5 rounded-md bg-white flex items-center justify-center text-[#1C1C1C] shadow-2xs"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* VIP Perks Highlight */}
              {subscription.isVip ? (
                <div className="bg-[#FFF8EE] border border-amber-200 rounded-xl p-2 flex items-center justify-between text-xs text-amber-900">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Foodvice Plus VIP: 10% Savings</span>
                  </div>
                  <span className="font-mono font-extrabold text-amber-700">-${vipDiscount.toFixed(2)}</span>
                </div>
              ) : (
                <div
                  onClick={onOpenSubscriptionModal}
                  className="bg-[#FFF8EE] border border-amber-200 rounded-xl p-2 flex items-center justify-between text-[11px] text-amber-900 cursor-pointer hover:bg-amber-100 transition-colors"
                >
                  <span>Get 10% off dine-in bills with VIP</span>
                  <span className="font-extrabold text-[#00B14F]">Unlock</span>
                </div>
              )}

              {/* Cost Summary */}
              <div className="space-y-1 pt-1.5 border-t border-[#EEEEEE] text-xs text-[#676767]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-[#1C1C1C] font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                {subscription.isVip && (
                  <div className="flex justify-between text-amber-700 font-semibold">
                    <span>VIP Member 10% Off</span>
                    <span>-${vipDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Kitchen Service Fee (5%)</span>
                  <span className="text-[#1C1C1C] font-semibold">${serviceCharge.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-[#1C1C1C] pt-1 border-t border-[#EEEEEE]">
                  <span>Total Payable</span>
                  <span className="text-[#00B14F] font-black">${finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Order Button */}
        {cartItems.length > 0 && !orderPlaced && (
          <div className="p-3 bg-white border-t border-[#EEEEEE] shrink-0">
            <button
              onClick={handlePlaceOrder}
              className="w-full py-2.5 rounded-xl bg-[#00B14F] hover:bg-[#008C3E] text-white font-extrabold text-xs shadow-md transition-all active:scale-98 flex items-center justify-center gap-1.5"
            >
              <span>Submit Table Order • ${finalTotal.toFixed(2)}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
