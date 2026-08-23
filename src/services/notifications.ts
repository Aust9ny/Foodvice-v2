import { NearbyNotification, Restaurant } from '../types';

class NotificationService {
  private permission: NotificationPermission = 'default';
  private soundEnabled: boolean = true;
  private audioCtx: AudioContext | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  public async requestPushPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }

    try {
      const perm = await Notification.requestPermission();
      this.permission = perm;
      if (perm === 'granted') {
        this.sendPushAlert({
          id: 'welcome_alert',
          restaurantId: 'rest-1',
          restaurantName: 'Foodvice Live Alerts Active',
          message: '🔔 You will now receive real-time wait-time drops and exclusive dietary perks near you!',
          type: 'promo',
          distanceMeters: 50,
          timestamp: Date.now(),
          read: false
        });
        return true;
      }
      return false;
    } catch (e) {
      console.warn('Notification permission request error:', e);
      return false;
    }
  }

  public getPermissionStatus(): NotificationPermission {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  }

  public toggleSound(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  public playNotificationChime() {
    if (!this.soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      if (!this.audioCtx) {
        this.audioCtx = new AudioContextClass();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5
      osc.frequency.exponentialRampToValueAtTime(1174.66, now + 0.25); // D6

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.5);
    } catch {}
  }

  public sendPushAlert(alert: NearbyNotification) {
    this.playNotificationChime();

    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'PUSH_NOTIFICATION',
            data: alert
          });
        } else {
          new Notification(alert.restaurantName, {
            body: alert.message,
            icon: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=192&auto=format&fit=crop&q=80',
            tag: alert.id
          });
        }
      } catch (e) {
        console.info('Native browser notification trigger skipped:', e);
      }
    }
  }

  /**
   * Geofencing calculation to detect nearby restaurants and trigger proximity notifications
   */
  public checkNearbyAlerts(restaurants: Restaurant[], userLat: number, userLng: number): NearbyNotification[] {
    const alerts: NearbyNotification[] = [];

    restaurants.forEach((rest) => {
      // Approximate Haversine distance in meters
      const latDiff = (rest.coords.lat - userLat) * 111320;
      const lngDiff = (rest.coords.lng - userLng) * 110574;
      const distanceMeters = Math.round(Math.sqrt(latDiff * latDiff + lngDiff * lngDiff));

      if (distanceMeters <= 500) {
        let msg = `📍 You are ${distanceMeters}m away from ${rest.name}. Current wait time is only ${rest.waitMinutes} mins!`;
        let type: NearbyNotification['type'] = 'wait_drop';

        if (rest.waitMinutes <= 10) {
          msg = `⚡ Fast Table Alert: ${rest.name} (${distanceMeters}m away) has almost NO wait line (~${rest.waitMinutes}m)!`;
          type = 'table_open';
        } else if (rest.featuredDeal) {
          msg = `🎁 Nearby Deal at ${rest.name}: ${rest.featuredDeal}!`;
          type = 'promo';
        }

        alerts.push({
          id: `alert_${rest.id}_${Math.floor(Date.now() / 60000)}`,
          restaurantId: rest.id,
          restaurantName: rest.name,
          message: msg,
          type,
          distanceMeters,
          timestamp: Date.now(),
          read: false
        });
      }
    });

    return alerts;
  }
}

export const notificationService = new NotificationService();
