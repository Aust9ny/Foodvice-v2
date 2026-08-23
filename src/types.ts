export type DietaryTag =
  | 'Halal'
  | 'Vegan'
  | 'Vegetarian'
  | 'Gluten-Free'
  | 'Nut-Free'
  | 'Dairy-Free'
  | 'Keto'
  | 'Low-Carb'
  | 'Kosher'
  | 'Plant-based'
  | 'Pescatarian';

export type WaitStatus = 'low' | 'moderate' | 'busy' | 'peak';

export interface MenuCustomization {
  id: string;
  name: string;
  options: { label: string; priceDelta?: number }[];
  required?: boolean;
}

export interface MenuItem {
  id: string;
  name: string;
  localName?: string; // Native name for travelers (e.g., Thai / Chinese script)
  description: string;
  price: number;
  category: 'Popular' | 'Starters' | 'Main Dishes' | 'Dietary Specials' | 'Beverages' | 'Desserts';
  image: string;
  dietaryTags: DietaryTag[];
  calories?: number;
  spiceLevel?: number; // 0 to 3
  isPopular?: boolean;
  isSecretVipMenu?: boolean;
  customizations?: MenuCustomization[];
  allergens?: string[];
}

export interface WaitTimeDataPoint {
  hour: string;
  waitMinutes: number;
  label: string;
}

export interface Restaurant {
  id: string;
  name: string;
  localName?: string;
  tagline: string;
  cuisine: string;
  rating: number;
  reviewCount: number;
  distanceKm: number;
  address: string;
  priceRange: '$' | '$$' | '$$$' | '$$$$';
  waitMinutes: number;
  waitStatus: WaitStatus;
  crowdDensity: number; // percentage 0-100
  waitHistory: WaitTimeDataPoint[];
  images: string[];
  dietaryCertifications: DietaryTag[];
  openHours: string;
  isOpen: boolean;
  phone: string;
  coords: { lat: number; lng: number };
  featuredDeal?: string;
  isSponsored?: boolean;
  sponsorTag?: string;
  liveQueueCount: number;
  averageDineTimeMins: number;
  menus: MenuItem[];
  seatingCapacity: number;
  tablesAvailable?: number;
  // Heritage & Traveler Guide fields
  heritageStory?: string;
  establishedYear?: string;
  isHeritageGem?: boolean;
  submittedBy?: string;
  specialtyHighlight?: string;
  isCommunityAdded?: boolean;
}

export interface QueueTicket {
  id: string;
  restaurantId: string;
  restaurantName: string;
  restaurantImage: string;
  partySize: number;
  ticketNumber: string;
  userPhone: string;
  userName: string;
  positionInLine: number;
  estimatedMinutes: number;
  status: 'waiting' | 'called' | 'seated' | 'cancelled';
  createdAt: number;
  isVipPriority?: boolean;
}

export interface UserSubscription {
  isVip: boolean;
  plan?: 'lifetime' | 'monthly' | 'annual';
  expiresAt?: string;
  status: 'active' | 'free';
}

export interface OrderCartItem {
  cartItemId: string;
  menuItem: MenuItem;
  quantity: number;
  selectedOptions: Record<string, string>;
  specialInstructions?: string;
}

export interface Review {
  id: string;
  restaurantId: string;
  userName: string;
  userAvatar?: string;
  userLocation?: string;
  rating: number;
  comment: string;
  date: string;
  recommendedDish?: string;
  dietaryTagsMentioned?: DietaryTag[];
}

export interface AdBanner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  brand: string;
  ctaText: string;
  promoCode?: string;
  badge?: string;
  url?: string;
}

export interface NearbyNotification {
  id: string;
  restaurantId: string;
  restaurantName: string;
  message: string;
  type: 'wait_drop' | 'promo' | 'table_open' | 'dietary_match';
  distanceMeters: number;
  timestamp: number;
  read: boolean;
}


export interface UserLocation {
  name: string;
  area: string;
  lat: number;
  lng: number;
}
