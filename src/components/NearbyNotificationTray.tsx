import React, { useState } from 'react';
import { Bell, Compass, MapPin, X, Check, Volume2, ShieldCheck, Flame, Zap, Navigation } from 'lucide-react';
import { NearbyNotification, Restaurant, UserLocation } from '../types';
import { notificationService } from '../services/notifications';

interface NearbyNotificationTrayProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NearbyNotification[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
  restaurants: Restaurant[];
  currentLocation: UserLocation;
  onSimulateNearbyWalk: (rest: Restaurant) => void;
}

export const NearbyNotificationTray: React.FC<NearbyNotificationTrayProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onClearAll,
  restaurants,
  currentLocation,
  onSimulateNearbyWalk,
}) => {
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>(
    notificationService.getPermissionStatus()
  );

  if (!isOpen) return null;

  const handleRequestPush = async () => {
    const granted = await notificationService.requestPushPermission();
    setPermissionStatus(granted ? 'granted' : 'denied');
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="p-3.5 bg-[#1C1C1C] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#00B14F]/20 text-[#00B14F] flex items-center justify-center">
              <Compass className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">Nearby Foodvice Radar</h3>
              <p className="text-[10px] text-gray-300">Proximity Wait Drops & Dietary Deals</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-3.5 overflow-y-auto space-y-3 flex-1">
          {/* Web Push Notification Enable Banner */}
          {permissionStatus !== 'granted' ? (
            <div className="bg-[#E8F8EF] border border-[#00B14F]/30 rounded-xl p-3 space-y-1.5">
              <div className="flex items-center gap-1.5 text-[#1C1C1C] font-extrabold text-xs">
                <Bell className="w-3.5 h-3.5 text-[#00B14F] animate-bounce" />
                <span>Enable Real-Time Push Alerts</span>
              </div>
              <p className="text-[11px] text-[#676767] leading-relaxed">
                Get notified when you walk within 500m of restaurants with low wait times or table openings!
              </p>
              <button
                onClick={handleRequestPush}
                className="w-full py-2 bg-[#00B14F] hover:bg-[#008C3E] text-white font-extrabold text-xs rounded-xl shadow-2xs transition-colors"
              >
                Allow Push Notifications
              </button>
            </div>
          ) : (
            <div className="bg-[#E8F8EF] border border-[#00B14F]/30 rounded-xl p-2.5 flex items-center justify-between text-xs text-[#00B14F]">
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#00B14F]" />
                <span className="font-extrabold text-[#1C1C1C]">Push Notifications Active</span>
              </div>
              <span className="text-[9px] bg-[#00B14F] text-white font-extrabold px-1.5 py-0.2 rounded">
                LIVE
              </span>
            </div>
          )}

          {/* Walking GPS Radar Simulator */}
          <div className="bg-[#F9FAF8] border border-[#EEEEEE] rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-[11px] font-extrabold text-[#1C1C1C] uppercase tracking-wider">
                <Navigation className="w-3 h-3 text-[#00B14F]" />
                <span>Simulate Walking Nearby</span>
              </div>
              <span className="text-[9px] text-[#676767]">GPS Proximity Demo</span>
            </div>
            <p className="text-[10px] text-[#676767]">
              Tap a restaurant below to simulate walking within 100 meters and trigger radar alerts:
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {restaurants.slice(0, 4).map((rest) => (
                <button
                  key={rest.id}
                  onClick={() => onSimulateNearbyWalk(rest)}
                  className="p-2 rounded-xl bg-white border border-[#EEEEEE] hover:border-[#00B14F] text-left transition-all text-xs font-semibold text-[#1C1C1C] shadow-2xs group"
                >
                  <p className="truncate group-hover:text-[#00B14F] font-extrabold text-xs">{rest.name}</p>
                  <p className="text-[10px] text-[#00B14F] font-bold">{rest.waitMinutes}m wait • Walk here</p>
                </button>
              ))}
            </div>
          </div>

          {/* List of Recent Proximity Alerts */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold text-[#1C1C1C] uppercase tracking-wider">
                Recent Alerts ({notifications.length})
              </span>
              {notifications.length > 0 && (
                <button
                  onClick={onClearAll}
                  className="text-[11px] text-[#676767] hover:text-rose-600 font-bold"
                >
                  Clear all
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="text-center py-5 text-xs text-[#676767]">
                No new radar alerts. Walk near dining spots to receive live perks!
              </div>
            ) : (
              <div className="space-y-1.5">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => onMarkAsRead(notif.id)}
                    className={`p-2.5 rounded-xl border transition-all text-xs space-y-0.5 ${
                      notif.read
                        ? 'bg-white border-[#EEEEEE] text-[#676767]'
                        : 'bg-[#E8F8EF] border-[#00B14F]/40 text-[#1C1C1C] font-semibold'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-[#00B14F]">{notif.restaurantName}</span>
                      <span className="text-[9px] text-[#676767]">
                        {Math.round((Date.now() - notif.timestamp) / 1000)}s ago
                      </span>
                    </div>
                    <p className="text-xs leading-snug">{notif.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
