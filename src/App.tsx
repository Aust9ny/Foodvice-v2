/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  subscribeToRestaurants,
  subscribeToUserSubscription,
  saveUserSubscription
} from './services/firebase';
import {
  Restaurant,
  MenuItem,
  DietaryTag,
  UserSubscription,
  UserLocation,
  NearbyNotification,
  Review
} from './types';
import { INITIAL_RESTAURANTS, SPONSORED_ADS, POPULAR_LOCATIONS } from './data/mockRestaurants';
import { notificationService } from './services/notifications';

// Components
import { Header } from './components/Header';
import { DietaryFilterBar } from './components/DietaryFilterBar';
import { GrabHeroPromo } from './components/GrabHeroPromo';
import { RestaurantCard } from './components/RestaurantCard';
import { RestaurantDetailModal } from './components/RestaurantDetailModal';
import { SuggestRestaurantModal } from './components/SuggestRestaurantModal';
import { AdBannerComponent } from './components/AdBannerComponent';
import { SubscriptionModal } from './components/SubscriptionModal';
import { NearbyNotificationTray } from './components/NearbyNotificationTray';
import { BottomNav, TabType } from './components/BottomNav';
import { OfflineBanner } from './components/OfflineBanner';
import { LiveFoodMap } from './components/LiveFoodMap';

import {
  Star,
  Sparkles,
  ShieldCheck,
  Search,
  Bookmark,
  MapPin,
  Heart,
  Award,
  Navigation,
  Utensils,
  MessageSquare,
  PlusCircle,
  Phone,
  Compass,
  Check,
  Info,
  BookOpen
} from 'lucide-react';

export default function App() {
  // State
  const [restaurants, setRestaurants] = useState<Restaurant[]>(INITIAL_RESTAURANTS);
  const [selectedLocation, setSelectedLocation] = useState<UserLocation>(POPULAR_LOCATIONS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('discover');

  // Bookmarked / Saved Restaurants (Trip Itinerary)
  const [savedRestaurantIds, setSavedRestaurantIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('foodvice_saved_restaurants');
      return saved ? JSON.parse(saved) : ['rest_1', 'rest_3'];
    } catch {
      return ['rest_1', 'rest_3'];
    }
  });

  // Dietary & Heritage Filters
  const [selectedDietary, setSelectedDietary] = useState<DietaryTag[]>([]);
  const [onlyHeritageGems, setOnlyHeritageGems] = useState(false);
  const [minRating, setMinRating] = useState<number | null>(null);

  // VIP / Lifetime Ad-Free Subscription State
  const [subscription, setSubscription] = useState<UserSubscription>({
    isVip: false,
    status: 'free',
  });
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  // Modals & Sheets
  const [activeRestaurantModal, setActiveRestaurantModal] = useState<Restaurant | null>(null);
  const [showSuggestModal, setShowSuggestModal] = useState(false);

  // Notifications & Radar
  const [notifications, setNotifications] = useState<NearbyNotification[]>([]);
  const [showNotificationTray, setShowNotificationTray] = useState(false);

  // Register PWA Service Worker on load
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.info('Service Worker registration skipped:', err);
      });
    }
  }, []);

  // Save Bookmarks to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('foodvice_saved_restaurants', JSON.stringify(savedRestaurantIds));
    } catch {}
  }, [savedRestaurantIds]);

  // Firebase Firestore Real-Time Subscriptions
  useEffect(() => {
    // 1. Subscribe to Restaurants & Community additions
    const unsubRestaurants = subscribeToRestaurants((data) => {
      if (data && data.length > 0) {
        setRestaurants(data);
      }
    });

    // 2. Subscribe to VIP / Lifetime Ad-Free State
    const unsubSub = subscribeToUserSubscription('current_user', (sub) => {
      if (sub) {
        setSubscription(sub);
      }
    });

    return () => {
      unsubRestaurants();
      unsubSub();
    };
  }, []);

  // Periodic Geofencing Radar check for nearby heritage stalls
  useEffect(() => {
    const checkRadar = () => {
      const alerts = notificationService.checkNearbyAlerts(
        restaurants,
        selectedLocation.lat,
        selectedLocation.lng
      );
      if (alerts.length > 0) {
        setNotifications((prev) => {
          const existingIds = new Set(prev.map((n) => n.id));
          const newAlerts = alerts.filter((a) => !existingIds.has(a.id));
          if (newAlerts.length > 0) {
            newAlerts.forEach((a) => notificationService.sendPushAlert(a));
            return [...newAlerts, ...prev].slice(0, 15);
          }
          return prev;
        });
      }
    };

    checkRadar();
    const interval = setInterval(checkRadar, 30000);
    return () => clearInterval(interval);
  }, [restaurants, selectedLocation]);

  // Toggle Bookmark
  const handleToggleBookmark = (restaurantId: string) => {
    setSavedRestaurantIds((prev) =>
      prev.includes(restaurantId)
        ? prev.filter((id) => id !== restaurantId)
        : [...prev, restaurantId]
    );
  };

  // Dietary Filter Handlers
  const handleToggleDietary = (tag: DietaryTag) => {
    setSelectedDietary((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleClearFilters = () => {
    setSelectedDietary([]);
    setOnlyHeritageGems(false);
    setMinRating(null);
  };

  const activeFilterCount =
    selectedDietary.length + (onlyHeritageGems ? 1 : 0) + (minRating ? 1 : 0);

  // Filtered Restaurants
  const filteredRestaurants = restaurants.filter((rest) => {
    // Search Query Match (Name, local name, cuisine, dish names, dietary, address)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = rest.name.toLowerCase().includes(q);
      const matchLocalName = rest.localName ? rest.localName.toLowerCase().includes(q) : false;
      const matchCuisine = rest.cuisine.toLowerCase().includes(q);
      const matchTagline = rest.tagline ? rest.tagline.toLowerCase().includes(q) : false;
      const matchStory = rest.heritageStory ? rest.heritageStory.toLowerCase().includes(q) : false;
      const matchMenu = rest.menus.some((m) =>
        m.name.toLowerCase().includes(q) ||
        (m.localName && m.localName.toLowerCase().includes(q)) ||
        m.description.toLowerCase().includes(q)
      );
      const matchDietTag = rest.dietaryCertifications.some((d) =>
        d.toLowerCase().includes(q)
      );
      if (!matchName && !matchLocalName && !matchCuisine && !matchTagline && !matchStory && !matchMenu && !matchDietTag) {
        return false;
      }
    }

    // Dietary Filter Match
    if (selectedDietary.length > 0) {
      const hasAllCertifications = selectedDietary.every((diet) =>
        rest.dietaryCertifications.includes(diet) ||
        rest.menus.some((m) => m.dietaryTags.includes(diet))
      );
      if (!hasAllCertifications) return false;
    }

    // Heritage Gem Filter (50+ years old)
    if (onlyHeritageGems && !rest.isHeritageGem) {
      return false;
    }

    // Rating Filter
    if (minRating !== null && rest.rating < minRating) {
      return false;
    }

    return true;
  });

  // Saved Restaurants List
  const savedRestaurants = restaurants.filter((r) => savedRestaurantIds.includes(r.id));

  // Quick Action category selector
  const handleSelectQuickCategory = (cat: string | DietaryTag) => {
    if (cat === 'heritage') {
      setOnlyHeritageGems((prev) => !prev);
    } else if (typeof cat === 'string') {
      handleToggleDietary(cat as DietaryTag);
    }
  };

  // Simulate Walk Proximity Trigger
  const handleSimulateNearbyWalk = (rest: Restaurant) => {
    setSelectedLocation({
      name: `${rest.name} Area`,
      area: rest.address,
      lat: rest.coords.lat,
      lng: rest.coords.lng,
    });

    const alert: NearbyNotification = {
      id: `walk_alert_${rest.id}_${Date.now()}`,
      restaurantId: rest.id,
      restaurantName: rest.name,
      message: `🏮 Traditional Food Radar: You are near ${rest.name}! Famous for ${rest.specialtyHighlight || rest.cuisine}.`,
      type: 'table_open',
      distanceMeters: 30,
      timestamp: Date.now(),
      read: false,
    };

    setNotifications((prev) => [alert, ...prev]);
    notificationService.sendPushAlert(alert);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center selection:bg-emerald-500 selection:text-white">
      {/* Mobile-First Frame */}
      <div 
        id="foodvice-app-root"
        className="w-full max-w-lg bg-gray-50 min-h-screen flex flex-col shadow-2xl relative pb-20"
      >
        {/* PWA Offline Banner */}
        <OfflineBanner />

        {/* Header */}
        <Header
          currentLocation={selectedLocation}
          onSelectLocation={setSelectedLocation}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          subscription={subscription}
          onOpenSubscriptionModal={() => setShowSubscriptionModal(true)}
          onOpenSuggestModal={() => setShowSuggestModal(true)}
          notifications={notifications}
          onOpenNotifications={() => setShowNotificationTray(true)}
        />

        {/* TAB 1: DISCOVER / EXPLORE */}
        {activeTab === 'discover' && (
          <main className="flex-1 space-y-3 animate-in fade-in duration-200">
            {/* Dietary & Heritage Filter Bar */}
            <DietaryFilterBar
              selectedDietary={selectedDietary}
              onToggleDietary={handleToggleDietary}
              maxWaitMinutes={null}
              onSetMaxWaitMinutes={() => {}}
              minRating={minRating}
              onSetMinRating={setMinRating}
              onClearFilters={handleClearFilters}
              activeFilterCount={activeFilterCount}
            />

            {/* Traveler Guide Hero Carousel & Quick Shortcuts */}
            <GrabHeroPromo
              subscription={subscription}
              onOpenSubscriptionModal={() => setShowSubscriptionModal(true)}
              onOpenSuggestModal={() => setShowSuggestModal(true)}
              onSelectQuickCategory={handleSelectQuickCategory}
              onOpenNearbyRadar={() => setShowNotificationTray(true)}
              onOpenLiveMap={() => setActiveTab('livemap')}
            />

            {/* Quick Filter Pill: 50+ Years Heritage Gems */}
            <div className="px-3 flex items-center justify-between gap-2">
              <button
                id="btn-filter-heritage-gems"
                onClick={() => setOnlyHeritageGems(!onlyHeritageGems)}
                className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  onlyHeritageGems
                    ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                    : 'bg-white text-gray-800 border-gray-200 hover:border-amber-400'
                }`}
              >
                <Award className={`w-3.5 h-3.5 ${onlyHeritageGems ? 'text-white' : 'text-amber-600'}`} />
                <span>50+ Years Heritage Stalls Only</span>
                {onlyHeritageGems && <Check className="w-3.5 h-3.5 ml-1" />}
              </button>

              <button
                id="btn-open-suggest-inline"
                onClick={() => setShowSuggestModal(true)}
                className="py-2 px-3 rounded-xl bg-[#E8F8EF] hover:bg-emerald-100 text-[#00B14F] border border-[#00B14F]/30 text-xs font-bold flex items-center gap-1 shadow-2xs transition-colors shrink-0"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add Stall</span>
              </button>
            </div>

            {/* Traditional Eateries List */}
            <div className="px-3 pt-1 space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-extrabold text-gray-900">
                    {onlyHeritageGems
                      ? 'Historic Heritage Gems (50+ Years)'
                      : selectedDietary.length > 0
                      ? `${selectedDietary.join(' & ')} Certified Stalls`
                      : 'Traditional Stalls & Hidden Gems'}
                  </h2>
                  <p className="text-[10px] text-gray-500">
                    {filteredRestaurants.length} authentic eateries near {selectedLocation.name}
                  </p>
                </div>

                {activeFilterCount > 0 && (
                  <button
                    onClick={handleClearFilters}
                    className="text-[11px] text-[#00B14F] font-bold hover:underline"
                  >
                    Reset filters
                  </button>
                )}
              </div>

              {/* Restaurant Cards */}
              {filteredRestaurants.length === 0 ? (
                <div className="bg-white rounded-2xl p-6 text-center space-y-2.5 border border-gray-200">
                  <Search className="w-8 h-8 mx-auto text-gray-300 stroke-1" />
                  <h3 className="font-bold text-xs text-gray-900">No restaurants match your search</h3>
                  <p className="text-[11px] text-gray-500 max-w-xs mx-auto">
                    Know a great local eatery here? Be the first to add it to the traveler's guide!
                  </p>
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <button
                      onClick={handleClearFilters}
                      className="px-3 py-1.5 bg-gray-100 text-gray-800 rounded-lg text-xs font-bold"
                    >
                      Clear Filters
                    </button>
                    <button
                      onClick={() => setShowSuggestModal(true)}
                      className="px-3 py-1.5 bg-[#00B14F] text-white rounded-lg text-xs font-bold"
                    >
                      + Add This Restaurant
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredRestaurants.map((restaurant, idx) => (
                    <React.Fragment key={restaurant.id}>
                      <RestaurantCard
                        restaurant={restaurant}
                        onOpenDetails={setActiveRestaurantModal}
                        selectedDietary={selectedDietary}
                        isBookmarked={savedRestaurantIds.includes(restaurant.id)}
                        onToggleBookmark={handleToggleBookmark}
                      />

                      {/* Native Non-intrusive Ad Banner (Muted if User Paid Once for No-Ads) */}
                      {idx === 1 && (
                        <AdBannerComponent
                          ad={SPONSORED_ADS[0]}
                          subscription={subscription}
                          onOpenSubscriptionModal={() => setShowSubscriptionModal(true)}
                          variant="card"
                        />
                      )}

                      {idx === 3 && (
                        <AdBannerComponent
                          ad={SPONSORED_ADS[1]}
                          subscription={subscription}
                          onOpenSubscriptionModal={() => setShowSubscriptionModal(true)}
                          variant="inline"
                        />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
          </main>
        )}

        {/* TAB: 3D LIVE MAP VIRTUAL RADAR */}
        {activeTab === 'livemap' && (
          <main className="flex-1 flex flex-col relative h-[calc(100vh-140px)] min-h-[550px] animate-in fade-in duration-200">
            <LiveFoodMap
              restaurants={restaurants}
              currentLocation={selectedLocation}
              onSelectLocation={setSelectedLocation}
              onOpenRestaurantDetail={setActiveRestaurantModal}
              savedRestaurantIds={savedRestaurantIds}
              onToggleBookmark={handleToggleBookmark}
              onOpenSuggestModal={() => setShowSuggestModal(true)}
            />
          </main>
        )}


        {/* TAB 2: SAVED / FOOD TRIP ITINERARY */}
        {activeTab === 'saved' && (
          <main className="flex-1 p-3.5 space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-gray-900">My Food Trip Itinerary</h2>
                <p className="text-xs text-gray-500">Bookmarked traditional stalls for your culinary route</p>
              </div>
              <span className="text-xs font-bold bg-[#E8F8EF] text-[#00B14F] px-2.5 py-1 rounded-full border border-[#00B14F]/30">
                {savedRestaurants.length} Saved
              </span>
            </div>

            {savedRestaurants.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center space-y-3 border border-gray-200">
                <Bookmark className="w-10 h-10 text-gray-300 mx-auto stroke-1" />
                <h3 className="font-bold text-sm text-gray-900">Your Food Trip is Empty</h3>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  Browse traditional stalls on the explore tab and tap the bookmark icon to plan your food itinerary.
                </p>
                <button
                  onClick={() => setActiveTab('discover')}
                  className="px-4 py-2 bg-[#00B14F] text-white font-bold text-xs rounded-xl shadow-2xs"
                >
                  Explore Stalls
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Trip Route Actions */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-[#00B14F]" />
                    <span className="text-xs font-bold text-emerald-950">
                      {savedRestaurants.length} historic spots on your food tour
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      const allNames = savedRestaurants.map((r) => r.name).join(' & ');
                      if (navigator.share) {
                        navigator.share({
                          title: 'My Bangkok Food Tour Itinerary',
                          text: `Check out my food tour route on Foodvice: ${allNames}`,
                          url: window.location.href,
                        }).catch(() => {});
                      } else {
                        alert('Itinerary route ready!');
                      }
                    }}
                    className="text-[11px] font-bold text-[#00B14F] hover:underline"
                  >
                    Share Trip Route
                  </button>
                </div>

                {/* Saved Cards */}
                {savedRestaurants.map((restaurant) => (
                  <RestaurantCard
                    key={restaurant.id}
                    restaurant={restaurant}
                    onOpenDetails={setActiveRestaurantModal}
                    selectedDietary={selectedDietary}
                    isBookmarked={true}
                    onToggleBookmark={handleToggleBookmark}
                  />
                ))}
              </div>
            )}
          </main>
        )}

        {/* TAB 3: COMMUNITY REVIEWS FEED */}
        {activeTab === 'reviews' && (
          <main className="flex-1 p-3.5 space-y-3.5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-gray-900">Traveler Reviews & Tips</h2>
                <p className="text-xs text-gray-500">Real feedback & dish recommendations from fellow foodies</p>
              </div>
              <button
                onClick={() => {
                  if (restaurants.length > 0) {
                    setActiveRestaurantModal(restaurants[0]);
                  }
                }}
                className="px-3 py-1.5 bg-[#00B14F] text-white text-xs font-bold rounded-xl shadow-2xs"
              >
                + Write Review
              </button>
            </div>

            {/* Highlighted Reviews */}
            <div className="space-y-3">
              {restaurants.flatMap((r) =>
                (r.menus.flatMap((m) => []).length >= 0 ? [
                  {
                    restaurant: r,
                    review: {
                      id: `feed_${r.id}_1`,
                      restaurantId: r.id,
                      userName: r.id === 'rest_1' ? 'Sophie & Marc' : r.id === 'rest_2' ? 'Kenji T.' : 'David L.',
                      userLocation: r.id === 'rest_1' ? 'Paris, France' : r.id === 'rest_2' ? 'Tokyo, Japan' : 'Sydney, Australia',
                      rating: 5,
                      comment: r.heritageStory ? `${r.tagline} Incredible old-world flavor you simply cannot find on delivery apps!` : 'Unforgettable authentic tastes.',
                      date: 'Recently',
                      recommendedDish: r.menus[0]?.name || 'Signature Specialty'
                    }
                  }
                ] : [])
              ).map(({ restaurant, review }) => (
                <div
                  key={review.id}
                  onClick={() => setActiveRestaurantModal(restaurant)}
                  className="p-3.5 bg-white rounded-2xl border border-gray-200 space-y-2 hover:border-[#00B14F] transition-colors cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#00B14F] font-bold text-xs flex items-center justify-center">
                        {review.userName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-900">{review.userName}</h4>
                        <p className="text-[10px] text-gray-500">{review.userLocation} • visited {restaurant.name}</p>
                      </div>
                    </div>

                    <div className="flex text-amber-400">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-gray-700 leading-relaxed">{review.comment}</p>

                  <div className="flex items-center justify-between pt-1 border-t border-gray-100 text-[11px]">
                    <span className="font-semibold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
                      ✨ Must Try: {review.recommendedDish}
                    </span>
                    <span className="text-[#00B14F] font-bold">View Stall →</span>
                  </div>
                </div>
              ))}
            </div>
          </main>
        )}

        {/* TAB 4: ACCOUNT / AD-FREE PASS / TRAVEL GUIDE CHEATSHEET */}
        {activeTab === 'account' && (
          <main className="flex-1 p-3.5 space-y-3.5 animate-in fade-in duration-200">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00B14F] to-[#008C3E] text-white flex items-center justify-center font-black text-lg shadow-sm">
                TG
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-sm text-gray-900 truncate">Traveler Guide Member</h3>
                  {subscription.isVip && (
                    <span className="bg-amber-400 text-black text-[9px] font-extrabold px-1.5 py-0.5 rounded">
                      AD-FREE
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">Supporting Traditional Food Heritage</p>
                <p className="text-[11px] text-[#00B14F] font-bold mt-0.5">
                  {savedRestaurants.length} bookmarked stalls in itinerary
                </p>
              </div>
            </div>

            {/* One-Time Ad-Free Status Banner */}
            <div className="bg-[#E8F8EF] border border-[#00B14F]/30 rounded-2xl p-4 space-y-2.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-gray-900 font-extrabold text-xs">
                  <ShieldCheck className="w-4 h-4 text-[#00B14F]" />
                  <span>One-Time Ad Removal Pass</span>
                </div>
                <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                  subscription.isVip ? 'bg-[#00B14F] text-white' : 'bg-gray-200 text-gray-700'
                }`}>
                  {subscription.isVip ? '100% AD-FREE ACTIVE' : 'FREE TIER (ADS ON)'}
                </span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                {subscription.isVip
                  ? 'All banner advertisements and sponsored promotions have been permanently removed from your app.'
                  : 'Pay once ($4.99) to cancel all ads permanently and fund our volunteer food mapping initiative.'}
              </p>
              <button
                id="btn-account-adfree-upgrade"
                onClick={() => setShowSubscriptionModal(true)}
                className="w-full py-2.5 rounded-xl bg-[#00B14F] hover:bg-[#008C3E] text-white font-extrabold text-xs shadow-2xs transition-colors"
              >
                {subscription.isVip ? 'Lifetime Pass Details' : 'Cancel Ads for $4.99 (One-Time Pay)'}
              </button>
            </div>

            {/* Traditional Food Ordering Phrase Cheatsheet for Travelers */}
            <div className="bg-white rounded-2xl p-4 border border-gray-200 space-y-2.5 shadow-2xs">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#00B14F]" />
                <h4 className="font-bold text-xs text-gray-900 uppercase tracking-wider">
                  Elder Stall Ordering Cheatsheet
                </h4>
              </div>
              <p className="text-[11px] text-gray-500">
                Show these phrases on your phone screen to grandma/grandpa cooks at traditional street stalls:
              </p>

              <div className="space-y-1.5 pt-1 text-xs">
                <div className="p-2 bg-gray-50 rounded-xl flex items-center justify-between border border-gray-100">
                  <div>
                    <p className="font-bold text-gray-900">"Mai Sai Nam-Tarn" (ไม่ใส่น้ำตาล)</p>
                    <p className="text-[10px] text-gray-500">No added sugar / less sweet</p>
                  </div>
                  <span className="text-[10px] font-bold text-[#00B14F] bg-white px-2 py-0.5 rounded border border-gray-200">Sugar-Free</span>
                </div>

                <div className="p-2 bg-gray-50 rounded-xl flex items-center justify-between border border-gray-100">
                  <div>
                    <p className="font-bold text-gray-900">"A-Harn Jae" (อาหารเจ)</p>
                    <p className="text-[10px] text-gray-500">Strict vegetarian / Buddhist vegan</p>
                  </div>
                  <span className="text-[10px] font-bold text-[#00B14F] bg-white px-2 py-0.5 rounded border border-gray-200">Vegan</span>
                </div>

                <div className="p-2 bg-gray-50 rounded-xl flex items-center justify-between border border-gray-100">
                  <div>
                    <p className="font-bold text-gray-900">"Mai Sai Phong-Chu-Rot" (ไม่ใส่ผงชูรส)</p>
                    <p className="text-[10px] text-gray-500">No MSG added</p>
                  </div>
                  <span className="text-[10px] font-bold text-[#00B14F] bg-white px-2 py-0.5 rounded border border-gray-200">No MSG</span>
                </div>

                <div className="p-2 bg-gray-50 rounded-xl flex items-center justify-between border border-gray-100">
                  <div>
                    <p className="font-bold text-gray-900">"Mai Phet" (ไม่เผ็ด)</p>
                    <p className="text-[10px] text-gray-500">Not spicy / mild</p>
                  </div>
                  <span className="text-[10px] font-bold text-[#00B14F] bg-white px-2 py-0.5 rounded border border-gray-200">Mild</span>
                </div>
              </div>
            </div>
          </main>
        )}

        {/* Bottom Navigation */}
        <BottomNav
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          subscription={subscription}
          savedCount={savedRestaurants.length}
          onOpenSuggestModal={() => setShowSuggestModal(true)}
        />

        {/* Suggest Restaurant Modal (Add to List like Google Maps) */}
        <SuggestRestaurantModal
          isOpen={showSuggestModal}
          onClose={() => setShowSuggestModal(false)}
          currentLocation={selectedLocation}
          onRestaurantAdded={(newRest) => {
            setRestaurants((prev) => [newRest, ...prev]);
            setActiveRestaurantModal(newRest);
          }}
        />

        {/* Restaurant Detail Modal (Menu, Story, Reviews, Maps Navigation) */}
        {activeRestaurantModal && (
          <RestaurantDetailModal
            restaurant={activeRestaurantModal}
            onClose={() => setActiveRestaurantModal(null)}
            isBookmarked={savedRestaurantIds.includes(activeRestaurantModal.id)}
            onToggleBookmark={handleToggleBookmark}
          />
        )}

        {/* One-Time Ad Removal Modal */}
        <SubscriptionModal
          isOpen={showSubscriptionModal}
          onClose={() => setShowSubscriptionModal(false)}
          subscription={subscription}
          onUpdateSubscription={setSubscription}
        />

        {/* Proximity Push Notification Radar Sheet */}
        <NearbyNotificationTray
          isOpen={showNotificationTray}
          onClose={() => setShowNotificationTray(false)}
          notifications={notifications}
          onMarkAsRead={(id) =>
            setNotifications((prev) =>
              prev.map((n) => (n.id === id ? { ...n, read: true } : n))
            )
          }
          onClearAll={() => setNotifications([])}
          restaurants={restaurants}
          currentLocation={selectedLocation}
          onSimulateNearbyWalk={handleSimulateNearbyWalk}
        />
      </div>
    </div>
  );
}
