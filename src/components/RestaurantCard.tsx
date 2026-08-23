import React from 'react';
import { Star, MapPin, Bookmark, Utensils, Navigation, Clock, Award, Check } from 'lucide-react';
import { Restaurant, DietaryTag } from '../types';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onOpenDetails: (restaurant: Restaurant) => void;
  selectedDietary: DietaryTag[];
  isBookmarked?: boolean;
  onToggleBookmark?: (restaurantId: string) => void;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({
  restaurant,
  onOpenDetails,
  selectedDietary,
  isBookmarked = false,
  onToggleBookmark,
}) => {
  const handleOpenMaps = (e: React.MouseEvent) => {
    e.stopPropagation();
    const query = encodeURIComponent(`${restaurant.name}, ${restaurant.address}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleBookmark) {
      onToggleBookmark(restaurant.id);
    }
  };

  return (
    <div
      id={`restaurant-card-${restaurant.id}`}
      onClick={() => onOpenDetails(restaurant)}
      className="bg-white rounded-2xl border border-[#EEEEEE] shadow-2xs hover:border-[#00B14F] hover:shadow-md transition-all overflow-hidden cursor-pointer group active:scale-[0.99] flex flex-col"
    >
      {/* Cover Photo */}
      <div className="relative h-44 w-full overflow-hidden bg-gray-100">
        <img
          src={restaurant.images[0]}
          alt={restaurant.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
        />

        {/* Top Badges (Heritage & Bookmark) */}
        <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between z-10">
          <div className="flex items-center gap-1.5">
            {restaurant.establishedYear && (
              <span className="bg-black/75 backdrop-blur-xs text-amber-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                <Award className="w-3 h-3 text-amber-400" />
                <span>{restaurant.establishedYear}</span>
              </span>
            )}
            {restaurant.isCommunityAdded && (
              <span className="bg-[#00B14F] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full shadow-xs">
                COMMUNITY SUGGESTED
              </span>
            )}
          </div>

          {onToggleBookmark && (
            <button
              onClick={handleBookmarkClick}
              className={`w-7 h-7 rounded-full backdrop-blur-md flex items-center justify-center transition-transform active:scale-90 shadow-sm ${
                isBookmarked ? 'bg-amber-400 text-black' : 'bg-black/50 hover:bg-black/70 text-white'
              }`}
              title={isBookmarked ? 'Remove Bookmark' : 'Save to Trip'}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-black' : ''}`} />
            </button>
          )}
        </div>

        {/* Bottom Overlay: Distance, Rating, Price */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-2.5 flex items-end justify-between text-white text-xs">
          <div className="flex items-center gap-1.5">
            <span className="flex items-center gap-1 bg-black/50 backdrop-blur-xs px-2 py-0.5 rounded-md text-[10px] font-bold">
              <MapPin className="w-3 h-3 text-[#00B14F]" />
              <span>{restaurant.distanceKm} km away</span>
            </span>
            <span className="text-[11px] font-semibold text-gray-200">{restaurant.priceRange}</span>
          </div>

          <div className="flex items-center gap-1 bg-amber-400 text-[#1C1C1C] px-2 py-0.5 rounded-md font-extrabold text-[11px] shadow-xs">
            <Star className="w-3 h-3 fill-[#1C1C1C]" />
            <span>{restaurant.rating}</span>
            <span className="text-[9px] font-normal text-gray-800">({restaurant.reviewCount})</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2.5">
        <div>
          <div className="flex items-start justify-between gap-1">
            <h3 className="text-sm font-bold text-gray-900 group-hover:text-[#00B14F] transition-colors leading-snug">
              {restaurant.name}
            </h3>
            <span className="text-[10px] font-bold text-gray-500 shrink-0 bg-gray-100 px-1.5 py-0.5 rounded">
              {restaurant.cuisine}
            </span>
          </div>

          {restaurant.localName && (
            <p className="text-[11px] text-amber-800 font-medium line-clamp-1 mt-0.5">
              {restaurant.localName}
            </p>
          )}

          <p className="text-xs text-gray-600 line-clamp-2 mt-1 leading-relaxed">
            {restaurant.tagline || restaurant.heritageStory}
          </p>
        </div>

        {/* Dietary Certification Tags */}
        {restaurant.dietaryCertifications && restaurant.dietaryCertifications.length > 0 && (
          <div className="flex flex-wrap items-center gap-1">
            {restaurant.dietaryCertifications.map((diet) => {
              const isHighlighted = selectedDietary.includes(diet);
              return (
                <span
                  key={diet}
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 transition-all ${
                    isHighlighted
                      ? 'bg-[#00B14F] text-white'
                      : 'bg-[#E8F8EF] text-[#00B14F] border border-[#00B14F]/20'
                  }`}
                >
                  <Check className="w-2.5 h-2.5" />
                  <span>{diet}</span>
                </span>
              );
            })}
          </div>
        )}

        {/* Open Hours / Specialty Tag */}
        <div className="flex items-center justify-between text-[11px] text-gray-500 pt-0.5 border-t border-gray-100">
          <div className="flex items-center gap-1 truncate max-w-[200px]">
            <Clock className="w-3 h-3 text-gray-400 shrink-0" />
            <span className="truncate">{restaurant.openHours}</span>
          </div>
          <span className="text-[10px] text-[#00B14F] font-bold shrink-0">
            {restaurant.menus.length} dishes
          </span>
        </div>

        {/* Action Buttons: View Menu & Directions */}
        <div className="pt-1 flex items-center gap-2">
          <button
            onClick={() => onOpenDetails(restaurant)}
            className="flex-1 py-2 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Utensils className="w-3.5 h-3.5 text-gray-600" />
            <span>Menu & Reviews</span>
          </button>

          <button
            onClick={handleOpenMaps}
            className="py-2 px-3.5 rounded-xl bg-[#00B14F] hover:bg-[#00913f] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Map</span>
          </button>
        </div>
      </div>
    </div>
  );
};
