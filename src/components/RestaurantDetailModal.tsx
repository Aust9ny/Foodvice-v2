import React, { useState, useEffect } from 'react';
import {
  X,
  Star,
  Clock,
  MapPin,
  Phone,
  Share2,
  Bookmark,
  Navigation,
  Sparkles,
  Heart,
  Check,
  Award,
  MessageSquare,
  Send,
  Calendar,
  DollarSign,
  Utensils
} from 'lucide-react';
import { Restaurant, MenuItem, DietaryTag, Review } from '../types';
import { subscribeToRestaurantReviews, addRestaurantReview } from '../services/firebase';

interface RestaurantDetailModalProps {
  restaurant: Restaurant;
  onClose: () => void;
  isBookmarked?: boolean;
  onToggleBookmark?: (restaurantId: string) => void;
}

export const RestaurantDetailModal: React.FC<RestaurantDetailModalProps> = ({
  restaurant,
  onClose,
  isBookmarked = false,
  onToggleBookmark
}) => {
  const [activeTab, setActiveTab] = useState<'menu' | 'reviews' | 'story'>('menu');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [showAddReviewForm, setShowAddReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerOrigin, setReviewerOrigin] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [recommendedDish, setRecommendedDish] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Selected item modal for travelers to view full recipe description
  const [viewingItem, setViewingItem] = useState<MenuItem | null>(null);

  // Subscribe to real-time reviews from Firestore
  useEffect(() => {
    setLoadingReviews(true);
    const unsubscribe = subscribeToRestaurantReviews(restaurant.id, (loadedReviews) => {
      setReviews(loadedReviews);
      setLoadingReviews(false);
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [restaurant.id]);

  const categories = ['All', 'Popular', 'Main Dishes', 'Dietary Specials', 'Starters', 'Desserts', 'Beverages'];

  const filteredMenus = restaurant.menus.filter((m) => {
    if (selectedCategory === 'All') return true;
    return m.category === selectedCategory;
  });

  const handleOpenGoogleMaps = () => {
    const query = encodeURIComponent(`${restaurant.name}, ${restaurant.address}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const handleCallRestaurant = () => {
    window.location.href = `tel:${restaurant.phone.replace(/[^0-9+]/g, '')}`;
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${restaurant.name} - Traditional Food Guide`,
        text: `Support this historic food gem: ${restaurant.name} (${restaurant.cuisine}). ${restaurant.address}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !reviewComment.trim()) return;

    setReviewSubmitting(true);
    try {
      await addRestaurantReview(
        {
          restaurantId: restaurant.id,
          userName: reviewerName.trim(),
          userLocation: reviewerOrigin.trim() || 'Traveler',
          rating: reviewRating,
          comment: reviewComment.trim(),
          date: 'Just now',
          recommendedDish: recommendedDish.trim() || undefined
        },
        restaurant
      );

      setReviewSuccess(true);
      setTimeout(() => {
        setReviewSuccess(false);
        setShowAddReviewForm(false);
        setReviewerName('');
        setReviewerOrigin('');
        setReviewComment('');
        setRecommendedDish('');
      }, 1500);
    } catch (err) {
      console.error('Failed to submit review:', err);
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div 
      id="restaurant-detail-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
    >
      <div 
        id="restaurant-detail-modal-card"
        className="bg-white w-full max-w-lg max-h-[92vh] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300"
      >
        {/* Hero Header with Imagery */}
        <div className="relative h-48 w-full bg-gray-900 shrink-0">
          <img
            src={restaurant.images[0]}
            alt={restaurant.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

          {/* Top Floating Buttons */}
          <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
            <button
              id="close-restaurant-detail-btn"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-md flex items-center justify-center transition-colors shadow-sm"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="flex items-center gap-2">
              {onToggleBookmark && (
                <button
                  onClick={() => onToggleBookmark(restaurant.id)}
                  className={`w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center transition-colors shadow-sm ${
                    isBookmarked ? 'bg-amber-400 text-black' : 'bg-black/50 hover:bg-black/70 text-white'
                  }`}
                  title={isBookmarked ? 'Saved to Trip' : 'Save to Trip'}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-black' : ''}`} />
                </button>
              )}
              <button
                onClick={handleShare}
                className="w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-md flex items-center justify-center transition-colors shadow-sm"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Bottom Title & Badges */}
          <div className="absolute bottom-2.5 inset-x-3 text-white">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="bg-[#00B14F] text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase">
                {restaurant.cuisine}
              </span>
              {restaurant.establishedYear && (
                <span className="bg-amber-500/90 text-black text-[9px] font-extrabold px-1.5 py-0.5 rounded">
                  {restaurant.establishedYear}
                </span>
              )}
              <span className="text-[11px] text-gray-200 font-semibold">{restaurant.priceRange}</span>
              
              <div className="flex items-center gap-1 bg-amber-400 text-[#1C1C1C] px-1.5 py-0.5 rounded font-extrabold text-[11px] ml-auto">
                <Star className="w-3 h-3 fill-[#1C1C1C]" />
                <span>{restaurant.rating}</span>
                <span className="text-[9px] font-semibold text-gray-800">({restaurant.reviewCount})</span>
              </div>
            </div>
            
            <h2 className="text-lg font-extrabold leading-tight text-white">{restaurant.name}</h2>
            {restaurant.localName && (
              <p className="text-xs text-amber-200 font-medium">{restaurant.localName}</p>
            )}
            <p className="text-[11px] text-gray-200 line-clamp-1">{restaurant.tagline}</p>
          </div>
        </div>

        {/* Action Bar for Travelers (Maps, Call, Save) */}
        <div className="px-3.5 py-2.5 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
          <button
            onClick={handleOpenGoogleMaps}
            className="flex-1 py-2 px-2.5 rounded-xl bg-[#00B14F] hover:bg-[#00913f] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Open in Google Maps</span>
          </button>
          
          <button
            onClick={handleCallRestaurant}
            className="py-2 px-3 rounded-xl bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 font-bold text-xs flex items-center justify-center gap-1 transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-gray-600" />
            <span>Call</span>
          </button>
        </div>

        {/* Tab Navigation (Menu, Heritage Story, Traveler Reviews) */}
        <div className="flex border-b border-gray-200 bg-white">
          <button
            onClick={() => setActiveTab('menu')}
            className={`flex-1 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'menu'
                ? 'border-[#00B14F] text-[#00B14F]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Food Menu ({restaurant.menus.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('story')}
            className={`flex-1 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'story'
                ? 'border-[#00B14F] text-[#00B14F]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Heritage & Story</span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`flex-1 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'reviews'
                ? 'border-[#00B14F] text-[#00B14F]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Reviews ({restaurant.reviewCount})</span>
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-3.5">
          
          {/* TAB 1: MENU */}
          {activeTab === 'menu' && (
            <div className="space-y-3">
              {/* Dietary Tags List */}
              {restaurant.dietaryCertifications && restaurant.dietaryCertifications.length > 0 && (
                <div className="flex flex-wrap gap-1.5 items-center">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Dietary:</span>
                  {restaurant.dietaryCertifications.map((diet) => (
                    <span
                      key={diet}
                      className="px-2 py-0.5 bg-emerald-50 text-[#00B14F] border border-emerald-200 rounded-lg text-[10px] font-bold flex items-center gap-1"
                    >
                      <Check className="w-2.5 h-2.5" />
                      {diet}
                    </span>
                  ))}
                </div>
              )}

              {/* Scrolling Category Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold whitespace-nowrap transition-all ${
                      selectedCategory === cat
                        ? 'bg-[#00B14F] text-white shadow-2xs'
                        : 'bg-[#F2F2F2] text-[#676767] hover:bg-gray-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Menu Items List */}
              <div className="space-y-2.5">
                {filteredMenus.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setViewingItem(item)}
                    className="p-3 rounded-xl border border-gray-200 bg-white hover:border-[#00B14F] transition-all cursor-pointer flex gap-3 shadow-2xs hover:shadow-sm"
                  >
                    {/* Item Image */}
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      {item.isPopular && (
                        <div className="absolute top-1 left-1 bg-amber-400 text-[#1C1C1C] text-[7px] font-extrabold px-1 py-0.2 rounded shadow-2xs">
                          POPULAR
                        </div>
                      )}
                    </div>

                    {/* Item Info */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="text-xs font-bold text-gray-900 leading-tight">
                            {item.name}
                          </h4>
                          <span className="text-xs font-extrabold text-[#00B14F] shrink-0">
                            ${item.price.toFixed(2)}
                          </span>
                        </div>
                        {item.localName && (
                          <p className="text-[10px] text-amber-800 font-semibold">{item.localName}</p>
                        )}
                        <p className="text-[11px] text-gray-500 line-clamp-2 mt-0.5">
                          {item.description}
                        </p>
                      </div>

                      {/* Dietary Badges */}
                      <div className="flex items-center justify-between gap-2 pt-1">
                        <div className="flex flex-wrap items-center gap-1">
                          {item.dietaryTags.map((t) => (
                            <span
                              key={t}
                              className="text-[8px] font-bold bg-[#E8F8EF] text-[#00B14F] px-1 py-0.2 rounded"
                            >
                              {t}
                            </span>
                          ))}
                          {item.calories && (
                            <span className="text-[8px] text-gray-500 font-medium">
                              {item.calories} kcal
                            </span>
                          )}
                          {item.spiceLevel !== undefined && item.spiceLevel > 0 && (
                            <span className="text-[9px]" title={`Spice Level ${item.spiceLevel}`}>
                              {'🌶️'.repeat(item.spiceLevel)}
                            </span>
                          )}
                        </div>

                        <span className="text-[10px] text-gray-400 font-medium">Tap details</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: HERITAGE & STORY */}
          {activeTab === 'story' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Heritage Gem Highlight Card */}
              <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center gap-2 text-amber-900">
                  <Award className="w-5 h-5 text-amber-600 shrink-0" />
                  <h4 className="font-bold text-sm">Preserving Traditional Cooking Heritage</h4>
                </div>
                <p className="text-xs text-amber-950 leading-relaxed">
                  {restaurant.heritageStory ||
                    'This eatery preserves old-world culinary techniques passed down through generations. They rely on traditional craftsmanship without modern ordering tablets or algorithmic delivery apps.'}
                </p>
              </div>

              {/* Specialty & Details */}
              <div className="space-y-2.5">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                    Signature Specialty Highlight
                  </span>
                  <p className="text-xs font-bold text-gray-900">
                    {restaurant.specialtyHighlight || 'Charcoal-cooked artisan recipes & hand-ground fresh pastes'}
                  </p>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 font-medium">Established:</span>
                    <span className="font-bold text-gray-900">{restaurant.establishedYear || 'Historic Old-Town'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 font-medium">Typical Dining Time:</span>
                    <span className="font-bold text-gray-900">~{restaurant.averageDineTimeMins} minutes</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 font-medium">Seating Capacity:</span>
                    <span className="font-bold text-gray-900">~{restaurant.seatingCapacity} seats (Walk-in friendly)</span>
                  </div>
                  {restaurant.submittedBy && (
                    <div className="flex items-center justify-between pt-1 border-t border-gray-200 text-[11px]">
                      <span className="text-gray-500">Suggested by traveler:</span>
                      <span className="font-semibold text-[#00B14F]">{restaurant.submittedBy}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Location & Contact */}
              <div className="text-[11px] text-gray-600 space-y-1.5 bg-gray-50 p-3 rounded-xl border border-gray-200">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                  <span className="font-medium">{restaurant.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                  <span className="font-medium">Hours: {restaurant.openHours}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                  <span className="font-medium">{restaurant.phone}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: REVIEWS & RATINGS */}
          {activeTab === 'reviews' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Rating Summary Bar */}
              <div className="bg-emerald-50/60 border border-emerald-200/60 rounded-xl p-3.5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-2xl font-extrabold text-gray-900">{restaurant.rating}</span>
                    <div className="flex text-amber-400">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 font-medium">
                    Based on {restaurant.reviewCount} traveler & local reviews
                  </p>
                </div>

                <button
                  onClick={() => setShowAddReviewForm(!showAddReviewForm)}
                  className="px-3 py-2 rounded-xl bg-[#00B14F] text-white text-xs font-bold hover:bg-emerald-600 transition-colors shadow-2xs"
                >
                  {showAddReviewForm ? 'Close Form' : '+ Write Review'}
                </button>
              </div>

              {/* Write Review Form */}
              {showAddReviewForm && (
                <form
                  onSubmit={handleSubmitReview}
                  className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-3 animate-fadeIn"
                >
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Rate Your Experience
                  </h4>

                  {/* Star Selector */}
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="p-1 text-amber-400 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-xs font-bold text-gray-700">{reviewRating} Stars</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Your Name (e.g. Maya)"
                      value={reviewerName}
                      onChange={(e) => setReviewerName(e.target.value)}
                      className="px-3 py-2 bg-white rounded-lg border border-gray-300 text-xs focus:outline-none focus:ring-1 focus:ring-[#00B14F]"
                    />
                    <input
                      type="text"
                      placeholder="Where from? (e.g. London)"
                      value={reviewerOrigin}
                      onChange={(e) => setReviewerOrigin(e.target.value)}
                      className="px-3 py-2 bg-white rounded-lg border border-gray-300 text-xs focus:outline-none focus:ring-1 focus:ring-[#00B14F]"
                    />
                  </div>

                  <input
                    type="text"
                    placeholder="Must-try dish you recommend? (Optional)"
                    value={recommendedDish}
                    onChange={(e) => setRecommendedDish(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-lg border border-gray-300 text-xs focus:outline-none focus:ring-1 focus:ring-[#00B14F]"
                  />

                  <textarea
                    required
                    rows={3}
                    placeholder="Share your dining experience, the flavors, or tips for other travelers..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-lg border border-gray-300 text-xs focus:outline-none focus:ring-1 focus:ring-[#00B14F]"
                  />

                  {reviewSuccess ? (
                    <div className="p-2 bg-emerald-100 text-[#00B14F] text-xs font-bold rounded-lg text-center">
                      ✓ Thank you! Review saved to Foodvice Guide.
                    </div>
                  ) : (
                    <button
                      type="submit"
                      disabled={reviewSubmitting}
                      className="w-full py-2 bg-[#00B14F] text-white text-xs font-bold rounded-lg hover:bg-emerald-600 transition-colors shadow-2xs flex items-center justify-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{reviewSubmitting ? 'Posting...' : 'Post Community Review'}</span>
                    </button>
                  )}
                </form>
              )}

              {/* Reviews List */}
              <div className="space-y-3">
                {reviews.map((rev) => (
                  <div key={rev.id} className="p-3 bg-white rounded-xl border border-gray-200 space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-100 text-[#00B14F] font-bold text-xs flex items-center justify-center">
                          {rev.userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-gray-900">{rev.userName}</h5>
                          {rev.userLocation && (
                            <p className="text-[10px] text-gray-500">{rev.userLocation}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <div className="flex text-amber-400">
                          {Array.from({ length: rev.rating }).map((_, idx) => (
                            <Star key={idx} className="w-3 h-3 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                        <span className="text-[10px] text-gray-400 ml-1">{rev.date}</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-700 leading-relaxed">{rev.comment}</p>

                    {rev.recommendedDish && (
                      <div className="inline-flex items-center gap-1 text-[10px] font-semibold bg-amber-50 text-amber-900 px-2 py-0.5 rounded-md border border-amber-200/60">
                        <span>✨ Recommends:</span>
                        <span className="font-bold">{rev.recommendedDish}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Note */}
        <div className="p-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-600 shrink-0">
          <div className="flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span className="text-[11px] font-medium">Offline Restaurant Support Initiative</span>
          </div>
          <button
            onClick={handleOpenGoogleMaps}
            className="text-[11px] font-bold text-[#00B14F] hover:underline flex items-center gap-1"
          >
            <span>Get Directions</span>
            <span>→</span>
          </button>
        </div>
      </div>

      {/* Dish Details Preview Modal */}
      {viewingItem && (
        <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-4 space-y-3 shadow-2xl animate-in zoom-in-95">
            <div className="relative h-40 rounded-xl overflow-hidden bg-gray-100">
              <img
                src={viewingItem.image}
                alt={viewingItem.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setViewingItem(null)}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-gray-900">{viewingItem.name}</h3>
                <span className="text-sm font-extrabold text-[#00B14F]">
                  ${viewingItem.price.toFixed(2)}
                </span>
              </div>
              {viewingItem.localName && (
                <p className="text-xs text-amber-800 font-semibold">{viewingItem.localName}</p>
              )}
              <p className="text-xs text-gray-600 leading-relaxed">{viewingItem.description}</p>
            </div>

            <div className="flex flex-wrap gap-1 pt-1">
              {viewingItem.dietaryTags.map((tag) => (
                <span key={tag} className="px-2 py-0.5 bg-emerald-50 text-[#00B14F] text-[10px] font-bold rounded-md">
                  {tag}
                </span>
              ))}
            </div>

            <button
              onClick={() => setViewingItem(null)}
              className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
