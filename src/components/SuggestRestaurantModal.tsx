import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  MapPin, 
  Sparkles, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Phone, 
  DollarSign, 
  BookOpen, 
  Heart, 
  Utensils, 
  Check, 
  Navigation,
  Image as ImageIcon
} from 'lucide-react';
import { Restaurant, DietaryTag, MenuItem } from '../types';

interface SuggestRestaurantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddRestaurant: (restaurant: Restaurant) => Promise<void>;
}

const PRESET_PHOTOS = [
  { label: 'Traditional Wok / Stir Fry', url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80' },
  { label: 'Claypot Broth & Noodles', url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=80' },
  { label: 'Royal Curry & Herbal Soup', url: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=800&auto=format&fit=crop&q=80' },
  { label: 'Hainanese Poached Chicken', url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80' },
  { label: 'Authentic Charcoal Kebabs', url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop&q=80' },
  { label: 'Organic Plant & Fresh Bowls', url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80' }
];

const DIETARY_OPTIONS: DietaryTag[] = [
  'Halal',
  'Vegan',
  'Vegetarian',
  'Gluten-Free',
  'Dairy-Free',
  'Nut-Free',
  'Plant-based',
  'Pescatarian',
  'Keto'
];

export const SuggestRestaurantModal: React.FC<SuggestRestaurantModalProps> = ({
  isOpen,
  onClose,
  onAddRestaurant
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [localName, setLocalName] = useState('');
  const [cuisine, setCuisine] = useState('Traditional Heritage Cuisine');
  const [establishedYear, setEstablishedYear] = useState('1980s');
  const [heritageStory, setHeritageStory] = useState('');
  const [specialtyHighlight, setSpecialtyHighlight] = useState('');
  
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [openHours, setOpenHours] = useState('09:00 AM - 08:30 PM');
  const [priceRange, setPriceRange] = useState<'$' | '$$' | '$$$' | '$$$$'>('$');
  const [selectedDietary, setSelectedDietary] = useState<DietaryTag[]>([]);

  const [selectedPhoto, setSelectedPhoto] = useState(PRESET_PHOTOS[0].url);
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');
  const [submitterName, setSubmitterName] = useState('Traveler Contributor');

  // Signature dishes
  const [dishName, setDishName] = useState('');
  const [dishPrice, setDishPrice] = useState('6.00');
  const [dishDescription, setDishDescription] = useState('');
  const [dishes, setDishes] = useState<MenuItem[]>([
    {
      id: 'd-sample-1',
      name: "Grandma's Charcoal Braised Specialty",
      description: 'Slow-simmered according to multi-generational family recipe with natural herbs.',
      price: 6.50,
      category: 'Popular',
      image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=80',
      dietaryTags: ['Dairy-Free']
    }
  ]);

  const handleAddDish = () => {
    if (!dishName.trim()) return;
    const newDish: MenuItem = {
      id: 'dish_' + Date.now(),
      name: dishName.trim(),
      description: dishDescription.trim() || 'Traditional secret recipe made fresh on order.',
      price: parseFloat(dishPrice) || 5.00,
      category: 'Popular',
      image: selectedPhoto,
      dietaryTags: selectedDietary.slice(0, 2)
    };
    setDishes([...dishes, newDish]);
    setDishName('');
    setDishPrice('6.00');
    setDishDescription('');
  };

  const handleRemoveDish = (id: string) => {
    setDishes(dishes.filter((d) => d.id !== id));
  };

  const toggleDietary = (tag: DietaryTag) => {
    if (selectedDietary.includes(tag)) {
      setSelectedDietary(selectedDietary.filter((t) => t !== tag));
    } else {
      setSelectedDietary([...selectedDietary, tag]);
    }
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setAddress(`Near Lat ${pos.coords.latitude.toFixed(4)}, Lng ${pos.coords.longitude.toFixed(4)} (GPS Verified)`);
        },
        () => {
          setAddress('Historic Old Town District (Street Stalls)');
        }
      );
    } else {
      setAddress('Historic Old Town District (Street Stalls)');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim()) return;

    setSubmitting(true);
    const photoUrl = customPhotoUrl.trim() || selectedPhoto;

    const newRestaurant: Restaurant = {
      id: 'user_rest_' + Date.now(),
      name: name.trim(),
      localName: localName.trim() || undefined,
      tagline: heritageStory ? `${establishedYear}: ${heritageStory.slice(0, 75)}...` : 'Authentic traditional old-school family recipes.',
      cuisine: cuisine.trim() || 'Traditional Heritage Food',
      rating: 5.0,
      reviewCount: 1,
      distanceKm: 0.5,
      address: address.trim(),
      priceRange: priceRange,
      waitMinutes: 10,
      waitStatus: 'low',
      crowdDensity: 30,
      openHours: openHours || '08:00 AM - 08:00 PM',
      isOpen: true,
      phone: phone.trim() || '+66 (Direct Walk-in)',
      coords: { lat: 13.7460, lng: 100.5340 },
      dietaryCertifications: selectedDietary,
      isHeritageGem: true,
      establishedYear: establishedYear.trim() || 'Established over 40 years',
      heritageStory: heritageStory.trim() || 'A cherished local mom-and-pop gem that continues cooking traditional recipes with love and no modern tech.',
      specialtyHighlight: specialtyHighlight.trim() || (dishes[0] ? dishes[0].name : 'Traditional Daily Specials'),
      submittedBy: submitterName.trim() || 'Traveler Community',
      isCommunityAdded: true,
      images: [photoUrl],
      liveQueueCount: 0,
      averageDineTimeMins: 25,
      seatingCapacity: 30,
      waitHistory: [
        { hour: '11 AM', waitMinutes: 5, label: 'Low' },
        { hour: '1 PM', waitMinutes: 15, label: 'Lunch' },
        { hour: '6 PM', waitMinutes: 15, label: 'Dinner' }
      ],
      menus: dishes.length > 0 ? dishes : [
        {
          id: 'dish_default',
          name: 'House Signature Heritage Plate',
          description: 'Authentic recipe passed down through generations.',
          price: 5.50,
          category: 'Popular',
          image: photoUrl,
          dietaryTags: selectedDietary
        }
      ]
    };

    try {
      await onAddRestaurant(newRestaurant);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setStep(1);
        setName('');
        setLocalName('');
        setHeritageStory('');
        setAddress('');
        onClose();
      }, 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        id="suggest-restaurant-modal-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs"
        onClick={onClose}
      >
        <motion.div
          id="suggest-restaurant-card"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#00B14F] to-[#00913f] p-4 sm:p-5 text-white flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-xs text-white">
                <Heart className="w-5 h-5 fill-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold leading-tight">Suggest an Old-School Eatery</h2>
                <p className="text-xs text-emerald-100">Help travelers discover & support offline mom-and-pop shops</p>
              </div>
            </div>
            <button
              id="close-suggest-modal-btn"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Step Progress Indicators */}
          <div className="px-5 pt-3 pb-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between text-xs font-semibold">
            <button
              onClick={() => setStep(1)}
              className={`flex items-center space-x-1.5 pb-1 border-b-2 transition-all ${
                step === 1 ? 'border-[#00B14F] text-[#00B14F]' : 'border-transparent text-gray-500'
              }`}
            >
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] bg-gray-200 text-gray-700 font-bold">1</span>
              <span>The Story</span>
            </button>
            <button
              onClick={() => setStep(2)}
              className={`flex items-center space-x-1.5 pb-1 border-b-2 transition-all ${
                step === 2 ? 'border-[#00B14F] text-[#00B14F]' : 'border-transparent text-gray-500'
              }`}
            >
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] bg-gray-200 text-gray-700 font-bold">2</span>
              <span>Location & Info</span>
            </button>
            <button
              onClick={() => setStep(3)}
              className={`flex items-center space-x-1.5 pb-1 border-b-2 transition-all ${
                step === 3 ? 'border-[#00B14F] text-[#00B14F]' : 'border-transparent text-gray-500'
              }`}
            >
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] bg-gray-200 text-gray-700 font-bold">3</span>
              <span>Menu & Photo</span>
            </button>
          </div>

          {/* Form Content */}
          {success ? (
            <div className="p-8 text-center flex flex-col items-center justify-center space-y-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-[#00B14F]"
              >
                <CheckCircle2 className="w-10 h-10" />
              </motion.div>
              <h3 className="text-xl font-bold text-gray-900">Added to Traveler's Guide!</h3>
              <p className="text-sm text-gray-600 max-w-xs">
                Thank you for supporting traditional restaurant elders. Your recommendation is now live in the guide for all travelers.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
              {/* STEP 1: Story & Heritage */}
              {step === 1 && (
                <div className="space-y-3.5 animate-fadeIn">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Restaurant / Stall Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="input-restaurant-name"
                      type="text"
                      required
                      placeholder="e.g. Uncle Som's Braised Duck & Noodle"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B14F]/40 focus:border-[#00B14F]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Native / Local Language Name (Optional)
                    </label>
                    <input
                      id="input-local-name"
                      type="text"
                      placeholder="e.g. ก๋วยเตี๋ยวเป็ดโบราณลุงสม (helps travelers show taxi drivers)"
                      value={localName}
                      onChange={(e) => setLocalName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B14F]/40 focus:border-[#00B14F]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                        Cuisine / Specialty
                      </label>
                      <input
                        id="input-cuisine"
                        type="text"
                        placeholder="e.g. Traditional Teochew / Thai Street Food"
                        value={cuisine}
                        onChange={(e) => setCuisine(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B14F]/40 focus:border-[#00B14F]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                        Years in Business
                      </label>
                      <input
                        id="input-established-year"
                        type="text"
                        placeholder="e.g. 1968 (56 yrs old)"
                        value={establishedYear}
                        onChange={(e) => setEstablishedYear(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B14F]/40 focus:border-[#00B14F]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Heritage Story / What makes them special?
                    </label>
                    <textarea
                      id="input-heritage-story"
                      rows={3}
                      placeholder="e.g. 82-year-old Grandma still pounds herbs in stone mortar and boils broth over real wood embers every morning at 5 AM without using artificial MSG..."
                      value={heritageStory}
                      onChange={(e) => setHeritageStory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B14F]/40 focus:border-[#00B14F]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Must-Try Specialty Highlight
                    </label>
                    <input
                      id="input-specialty-highlight"
                      type="text"
                      placeholder="e.g. 8-Hour Charcoal Braised Beef Tendon Soup"
                      value={specialtyHighlight}
                      onChange={(e) => setSpecialtyHighlight(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B14F]/40 focus:border-[#00B14F]"
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: Location, Hours, Dietary */}
              {step === 2 && (
                <div className="space-y-3.5 animate-fadeIn">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Address / Street Location <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleUseCurrentLocation}
                        className="text-xs text-[#00B14F] hover:underline flex items-center font-semibold"
                      >
                        <Navigation className="w-3 h-3 mr-1" /> Use GPS Location
                      </button>
                    </div>
                    <input
                      id="input-address"
                      type="text"
                      required
                      placeholder="e.g. 42 Soi Yaowarat 11, Chinatown, Bangkok"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B14F]/40 focus:border-[#00B14F]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                        Open Hours
                      </label>
                      <input
                        id="input-open-hours"
                        type="text"
                        placeholder="e.g. 07:00 AM - 02:00 PM"
                        value={openHours}
                        onChange={(e) => setOpenHours(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B14F]/40 focus:border-[#00B14F]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                        Phone (or Walk-in)
                      </label>
                      <input
                        id="input-phone"
                        type="text"
                        placeholder="e.g. +66 2 221 4455"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B14F]/40 focus:border-[#00B14F]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Price Range
                    </label>
                    <div className="flex space-x-2">
                      {(['$', '$$', '$$$', '$$$$'] as const).map((tier) => (
                        <button
                          key={tier}
                          type="button"
                          onClick={() => setPriceRange(tier)}
                          className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-all ${
                            priceRange === tier
                              ? 'bg-[#00B14F] text-white border-[#00B14F]'
                              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {tier}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Dietary Options Available for Travelers
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {DIETARY_OPTIONS.map((tag) => {
                        const active = selectedDietary.includes(tag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => toggleDietary(tag)}
                            className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-all ${
                              active
                                ? 'bg-emerald-50 text-[#00B14F] border-[#00B14F] font-bold'
                                : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {active ? '✓ ' : '+ '}{tag}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Your Contributor Nickname
                    </label>
                    <input
                      id="input-submitter-name"
                      type="text"
                      placeholder="e.g. Backpacker Sarah / Local Foodie Ken"
                      value={submitterName}
                      onChange={(e) => setSubmitterName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B14F]/40 focus:border-[#00B14F]"
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: Dishes & Photo Selection */}
              {step === 3 && (
                <div className="space-y-4 animate-fadeIn">
                  {/* Photo Selection */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Select Cover Photo (or enter custom image link)
                    </label>
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      {PRESET_PHOTOS.map((p, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setSelectedPhoto(p.url);
                            setCustomPhotoUrl('');
                          }}
                          className={`relative rounded-xl overflow-hidden h-20 cursor-pointer border-2 transition-all ${
                            selectedPhoto === p.url && !customPhotoUrl
                              ? 'border-[#00B14F] scale-[1.02] shadow-md'
                              : 'border-transparent opacity-75 hover:opacity-100'
                          }`}
                        >
                          <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-1">
                            <span className="text-[10px] text-white font-medium truncate">{p.label}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <input
                      type="url"
                      placeholder="Or paste direct image URL (https://...)"
                      value={customPhotoUrl}
                      onChange={(e) => setCustomPhotoUrl(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#00B14F]/40"
                    />
                  </div>

                  {/* Menu Dishes */}
                  <div className="border-t border-gray-200 pt-3">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Add Menu Dishes (for travelers to see before visiting)
                    </label>

                    {/* Dish list */}
                    <div className="space-y-2 mb-3">
                      {dishes.map((dish, i) => (
                        <div key={dish.id} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl border border-gray-200 text-xs">
                          <div>
                            <span className="font-bold text-gray-900">{dish.name}</span>
                            <span className="ml-2 text-[#00B14F] font-semibold">${dish.price.toFixed(2)}</span>
                            <p className="text-gray-500 text-[11px] truncate max-w-[200px]">{dish.description}</p>
                          </div>
                          {dishes.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveDish(dish.id)}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Add Dish Input Card */}
                    <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200/60 space-y-2 text-xs">
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="text"
                          placeholder="Dish name (e.g. Wok Hei Noodles)"
                          value={dishName}
                          onChange={(e) => setDishName(e.target.value)}
                          className="col-span-2 px-2.5 py-1.5 bg-white rounded-lg border border-gray-300"
                        />
                        <input
                          type="number"
                          step="0.5"
                          placeholder="Price ($)"
                          value={dishPrice}
                          onChange={(e) => setDishPrice(e.target.value)}
                          className="px-2 py-1.5 bg-white rounded-lg border border-gray-300"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Short description / ingredients"
                        value={dishDescription}
                        onChange={(e) => setDishDescription(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={handleAddDish}
                        className="w-full py-1.5 bg-[#00B14F] text-white font-bold rounded-lg hover:bg-emerald-600 transition-colors flex items-center justify-center space-x-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Dish to Menu</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
                    className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-xs font-bold hover:bg-gray-50"
                  >
                    Back
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-xs font-bold hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                )}

                {step < 3 ? (
                  <button
                    type="button"
                    onClick={() => setStep((s) => (s + 1) as 1 | 2 | 3)}
                    className="px-6 py-2.5 rounded-xl bg-[#00B14F] text-white text-xs font-bold hover:bg-emerald-600 shadow-sm"
                  >
                    Next Step →
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={submitting || !name.trim() || !address.trim()}
                    className="px-6 py-2.5 rounded-xl bg-[#00B14F] text-white text-xs font-bold hover:bg-emerald-600 shadow-md flex items-center space-x-1.5 disabled:opacity-50"
                  >
                    {submitting ? (
                      <span>Publishing...</span>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Publish to Foodvice Guide</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
