import { Restaurant, AdBanner, Review } from '../types';

export const INITIAL_RESTAURANTS: Restaurant[] = [
  {
    id: 'rest-1',
    name: 'Siam Chili & Lemongrass',
    localName: 'สยามพริกและตะไคร้ (สูตรชาววัง)',
    tagline: 'Preserving 3rd-Generation Royal Thai Herbal Broths & Claypot Curries',
    cuisine: 'Traditional Thai Heritage',
    rating: 4.9,
    reviewCount: 1420,
    distanceKm: 0.4,
    address: '24 Soi Siam Square 3, Pathum Wan, Bangkok',
    priceRange: '$$',
    waitMinutes: 12,
    waitStatus: 'low',
    crowdDensity: 35,
    openHours: '10:30 AM - 10:00 PM',
    isOpen: true,
    phone: '+66 2 658 1000',
    coords: { lat: 13.7462, lng: 100.5347 },
    featuredDeal: 'Support Local: Complimentary Herb Herbal Tea for Travelers',
    isSponsored: false,
    liveQueueCount: 3,
    averageDineTimeMins: 35,
    seatingCapacity: 60,
    tablesAvailable: 8,
    dietaryCertifications: ['Halal', 'Gluten-Free', 'Vegetarian'],
    isHeritageGem: true,
    establishedYear: '1976 (48 yrs old)',
    heritageStory: 'Founded by Grandma Somchit using handwritten palace recipes. They still pound curry pastes fresh daily in stone mortars without artificial seasoning or MSG.',
    specialtyHighlight: 'Hand-pounded Galangal Tom Yum & Charcoal-cooked Curries',
    images: [
      'https://images.unsplash.com/photo-1559847844-5315695dadae?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1562967914-608f82629710?w=800&auto=format&fit=crop&q=80'
    ],
    waitHistory: [
      { hour: '11 AM', waitMinutes: 5, label: 'Low' },
      { hour: '12 PM', waitMinutes: 28, label: 'Lunch Peak' },
      { hour: '1 PM', waitMinutes: 20, label: 'Busy' },
      { hour: '3 PM', waitMinutes: 5, label: 'Low' },
      { hour: '5 PM', waitMinutes: 10, label: 'Moderate' },
      { hour: '7 PM', waitMinutes: 35, label: 'Dinner Peak' },
      { hour: '9 PM', waitMinutes: 12, label: 'Low' }
    ],
    menus: [
      {
        id: 'm1',
        name: 'Signature Tom Yum River Prawn (GF)',
        localName: 'ต้มยำกุ้งแม่น้ำโบราณ',
        description: 'Aromatic lemongrass, kaffir lime, wild straw mushrooms, and giant river prawn in rich herbal broth.',
        price: 14.50,
        category: 'Popular',
        image: 'https://images.unsplash.com/photo-1548943487-a2e4e43b4853?w=600&auto=format&fit=crop&q=80',
        dietaryTags: ['Gluten-Free', 'Pescatarian'],
        calories: 380,
        spiceLevel: 3,
        isPopular: true,
        allergens: ['Crustaceans', 'Fish Sauce'],
        customizations: [
          {
            id: 'spice',
            name: 'Spice Level',
            required: true,
            options: [
              { label: 'Mild (1 Chili)' },
              { label: 'Original Spicy (3 Chilies)' },
              { label: 'Thai Extra Hot 🔥 (5 Chilies)', priceDelta: 0.5 }
            ]
          }
        ]
      },
      {
        id: 'm2',
        name: 'Pad Thai Boran with Organic Tofu & Peanuts',
        localName: 'ผัดไทยโบราณสูตรดั้งเดิม',
        description: 'Tamarind wok-fried thin rice noodles, garlic chives, pressed organic tofu, beansprouts.',
        price: 11.00,
        category: 'Main Dishes',
        image: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=600&auto=format&fit=crop&q=80',
        dietaryTags: ['Vegan', 'Gluten-Free', 'Plant-based'],
        calories: 490,
        spiceLevel: 1,
        isPopular: true,
        allergens: ['Peanuts (Can omit)', 'Soy']
      },
      {
        id: 'm3',
        name: 'Green Curry Silk with Young Coconut (Halal)',
        localName: 'แกงเขียวหวานไก่กะทิสด',
        description: 'Fresh pounded green chili paste, fresh coconut cream, Thai sweet basil, tender halal chicken fillet.',
        price: 13.50,
        category: 'Main Dishes',
        image: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=600&auto=format&fit=crop&q=80',
        dietaryTags: ['Halal', 'Gluten-Free', 'Dairy-Free'],
        calories: 520,
        spiceLevel: 2
      },
      {
        id: 'm5',
        name: 'Mango Sticky Rice with Warm Coconut Drizzle',
        localName: 'ข้าวเหนียวมะม่วงน้ำดอกไม้',
        description: 'Sweet golden Nam Dok Mai mango served over warm pandan sticky rice and roasted mung beans.',
        price: 7.50,
        category: 'Desserts',
        image: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=600&auto=format&fit=crop&q=80',
        dietaryTags: ['Vegan', 'Gluten-Free', 'Plant-based'],
        calories: 340,
        spiceLevel: 0
      }
    ]
  },
  {
    id: 'rest-2',
    name: 'Verde Botanica & Superbowls',
    localName: 'แวร์เด โบทานิกา',
    tagline: '100% Plant-Powered Organic Bowls & Farm-Direct Produce',
    cuisine: 'Healthy & Vegan Heritage',
    rating: 4.8,
    reviewCount: 980,
    distanceKm: 0.8,
    address: 'Thong Lo Soi 13, Sukhumvit Road',
    priceRange: '$$',
    waitMinutes: 5,
    waitStatus: 'low',
    crowdDensity: 20,
    openHours: '08:00 AM - 09:00 PM',
    isOpen: true,
    phone: '+66 2 712 9988',
    coords: { lat: 13.7314, lng: 100.5812 },
    featuredDeal: 'Free Cold-Pressed Green Juice with any Bowl',
    isSponsored: false,
    liveQueueCount: 1,
    averageDineTimeMins: 25,
    seatingCapacity: 40,
    tablesAvailable: 12,
    dietaryCertifications: ['Vegan', 'Vegetarian', 'Gluten-Free', 'Keto', 'Dairy-Free', 'Plant-based'],
    isHeritageGem: true,
    establishedYear: '2012',
    heritageStory: 'Supporting local Chiang Mai organic smallholder farmers by sourcing chemical-free indigenous vegetables and herbs directly.',
    specialtyHighlight: 'Fresh Chiang Mai Tempeh & Organic Acai Bowls',
    images: [
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80'
    ],
    waitHistory: [
      { hour: '9 AM', waitMinutes: 2, label: 'Low' },
      { hour: '12 PM', waitMinutes: 12, label: 'Moderate' },
      { hour: '1 PM', waitMinutes: 8, label: 'Low' },
      { hour: '6 PM', waitMinutes: 15, label: 'Moderate' },
      { hour: '8 PM', waitMinutes: 5, label: 'Low' }
    ],
    menus: [
      {
        id: 'vb1',
        name: 'Avocado Glow Keto Power Bowl',
        localName: 'โบวล์อโวคาโดเคโตพาวเวอร์',
        description: 'Charred broccolini, Haas avocado, marinated edamame, hemp seeds, almond feta, and lemon tahini.',
        price: 12.90,
        category: 'Popular',
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
        dietaryTags: ['Vegan', 'Keto', 'Gluten-Free', 'Dairy-Free', 'Low-Carb'],
        calories: 410,
        spiceLevel: 0,
        isPopular: true
      },
      {
        id: 'vb2',
        name: 'Rainbow Truffle Tempeh Poke (GF)',
        localName: 'โปเก้เทมเป้ออร์แกนิก',
        description: 'Crisp artisan tempeh cubes, pickled ginger, Japanese purple sweet potato, chia quinoa bed.',
        price: 13.50,
        category: 'Main Dishes',
        image: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=600&auto=format&fit=crop&q=80',
        dietaryTags: ['Vegan', 'Gluten-Free', 'Plant-based'],
        calories: 450,
        spiceLevel: 1
      }
    ]
  },
  {
    id: 'rest-3',
    name: 'Al-Madina Charcoal & Kebabs',
    localName: 'อัล-มาดีนะห์ ข้าวหมกและเคบับเตาถ่าน',
    tagline: '50-Year Family Recipe 100% Certified Halal Dum Biryani',
    cuisine: 'Traditional Middle Eastern & Halal',
    rating: 4.9,
    reviewCount: 2150,
    distanceKm: 1.2,
    address: 'Nana Sukhumvit Soi 3/1, Arab Street, Bangkok',
    priceRange: '$$',
    waitMinutes: 25,
    waitStatus: 'busy',
    crowdDensity: 82,
    openHours: '11:00 AM - 03:00 AM (Late Night)',
    isOpen: true,
    phone: '+66 2 255 4321',
    coords: { lat: 13.7423, lng: 100.5534 },
    featuredDeal: 'Free Falafel side for travelers showing Foodvice app',
    isSponsored: false,
    liveQueueCount: 8,
    averageDineTimeMins: 40,
    seatingCapacity: 80,
    tablesAvailable: 2,
    dietaryCertifications: ['Halal', 'Nut-Free', 'Dairy-Free', 'Keto'],
    isHeritageGem: true,
    establishedYear: '1972 (52 yrs old)',
    heritageStory: 'Established by Uncle Tariq in 1972 after emigrating with his family spice blend. The copper pots have been stewing authentic lamb shank biryani over embers for half a century.',
    specialtyHighlight: '6-Hour Slow-Cooked Lamb Shank Dum Biryani',
    images: [
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80'
    ],
    waitHistory: [
      { hour: '12 PM', waitMinutes: 15, label: 'Moderate' },
      { hour: '6 PM', waitMinutes: 20, label: 'Moderate' },
      { hour: '8 PM', waitMinutes: 38, label: 'Peak' },
      { hour: '10 PM', waitMinutes: 30, label: 'Supper Crowd' },
      { hour: '12 AM', waitMinutes: 20, label: 'Late Rush' }
    ],
    menus: [
      {
        id: 'am1',
        name: 'Royal Lamb Shank Zafaran Biryani (Halal)',
        localName: 'ข้าวหมกขาแกะแซฟฟรอน',
        description: 'Slow-braised New Zealand lamb shank falling off the bone, saffron long-grain basmati, raita dip.',
        price: 18.90,
        category: 'Popular',
        image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
        dietaryTags: ['Halal', 'Gluten-Free', 'Nut-Free'],
        calories: 780,
        spiceLevel: 1,
        isPopular: true
      },
      {
        id: 'am2',
        name: 'Smoky Charcoal Chicken Shish Tawook',
        localName: 'ไก่ย่างถ่านชิชทาวูก',
        description: 'Tender garlic-marinated halal chicken breast skewers, grilled sumac onions, house garlic toum.',
        price: 14.00,
        category: 'Main Dishes',
        image: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600&auto=format&fit=crop&q=80',
        dietaryTags: ['Halal', 'Keto', 'Dairy-Free', 'Nut-Free', 'Low-Carb'],
        calories: 510,
        spiceLevel: 1
      },
      {
        id: 'am3',
        name: 'Crispy Herbed Falafel Plate & Hummus (Vegan/Halal)',
        localName: 'ฟาลาเฟลทอดและฮุมมุส',
        description: 'Ground chickpeas, parsley, coriander, sesame tahini, warm pita bread.',
        price: 9.50,
        category: 'Starters',
        image: 'https://images.unsplash.com/photo-1593001874117-c99c800e3eb7?w=600&auto=format&fit=crop&q=80',
        dietaryTags: ['Halal', 'Vegan', 'Vegetarian', 'Dairy-Free'],
        calories: 420,
        spiceLevel: 0
      }
    ]
  },
  {
    id: 'rest-4',
    name: 'Ah Po Traditional Claypot Noodles & Satay',
    localName: 'อาโป ก๋วยเตี๋ยวหม้อดินเตาถ่าน',
    tagline: '60-Year Secret Braised Herbal Broth & Hand-Pulled Noodles',
    cuisine: 'Old-School Teochew & Street Food',
    rating: 4.95,
    reviewCount: 3420,
    distanceKm: 0.9,
    address: '88 Charoen Krung Rd, Bang Rak, Bangkok',
    priceRange: '$',
    waitMinutes: 15,
    waitStatus: 'moderate',
    crowdDensity: 70,
    openHours: '09:00 AM - 08:30 PM (Closed Mondays)',
    isOpen: true,
    phone: '+66 2 234 8871',
    coords: { lat: 13.7258, lng: 100.5144 },
    featuredDeal: 'Must-Try: Charcoal braised beef tendon claypot noodle',
    isSponsored: false,
    liveQueueCount: 6,
    averageDineTimeMins: 25,
    seatingCapacity: 35,
    tablesAvailable: 3,
    dietaryCertifications: ['Halal', 'Nut-Free', 'Dairy-Free'],
    isHeritageGem: true,
    establishedYear: '1964 (60 yrs old)',
    heritageStory: 'Grandpa Ah Po started selling noodles from a wooden pushcart in 1964. Now his grandson continues cooking over real charcoal embers to achieve unmatched smoky aroma ("Wok Hei").',
    specialtyHighlight: 'Charcoal Claypot Beef Broth & Handmade Crispy Won Tons',
    images: [
      'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80'
    ],
    waitHistory: [
      { hour: '11 AM', waitMinutes: 10, label: 'Low' },
      { hour: '12:30 PM', waitMinutes: 25, label: 'Lunch Rush' },
      { hour: '2 PM', waitMinutes: 5, label: 'Low' },
      { hour: '6 PM', waitMinutes: 20, label: 'Dinner' }
    ],
    menus: [
      {
        id: 'ap1',
        name: 'Charcoal Claypot Braised Beef Tendon Noodles',
        localName: 'ก๋วยเตี๋ยวเนื้อตุ๋นหม้อดิน',
        description: 'Tender 8-hour braised beef shanks, honeycomb tripe, melt-in-mouth tendon in aromatic star anise broth.',
        price: 6.50,
        category: 'Popular',
        image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=80',
        dietaryTags: ['Dairy-Free', 'Nut-Free'],
        calories: 520,
        spiceLevel: 1,
        isPopular: true
      },
      {
        id: 'ap2',
        name: 'Crispy Garlic Mushroom & Tofu Noodle (Vegetarian)',
        localName: 'ก๋วยเตี๋ยวเจเห็ดหอมเต้าหู้กรอบ',
        description: 'Crisp pressed bean curd, braised shiitake, water spinach, and fragrant vegetable broth.',
        price: 5.50,
        category: 'Main Dishes',
        image: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=600&auto=format&fit=crop&q=80',
        dietaryTags: ['Vegetarian', 'Vegan', 'Dairy-Free'],
        calories: 390,
        spiceLevel: 0
      }
    ]
  },
  {
    id: 'rest-6',
    name: 'Yaowarat Uncle Seng Hainanese Chicken Rice',
    localName: 'ข้าวมันไก่ไหหลำ ลุงเส็ง เยาวราช',
    tagline: 'Michelin Street Guide Poached Free-Range Chicken & Fragrant Rice',
    cuisine: 'Traditional Hainanese & Chinese',
    rating: 4.88,
    reviewCount: 2950,
    distanceKm: 1.9,
    address: '148 Yaowarat Road, Samphanthawong, Chinatown Bangkok',
    priceRange: '$',
    waitMinutes: 8,
    waitStatus: 'low',
    crowdDensity: 40,
    openHours: '06:30 AM - 02:00 PM (Until sold out!)',
    isOpen: true,
    phone: '+66 2 221 5566',
    coords: { lat: 13.7402, lng: 100.5098 },
    featuredDeal: 'Arrive early before 11:30 AM for liver & crispy skin',
    isSponsored: false,
    liveQueueCount: 2,
    averageDineTimeMins: 20,
    seatingCapacity: 50,
    tablesAvailable: 8,
    dietaryCertifications: ['Halal', 'Nut-Free', 'Dairy-Free'],
    isHeritageGem: true,
    establishedYear: '1958 (66 yrs old)',
    heritageStory: 'Uncle Seng (now 82) learned the poaching technique from his father in Hainan. Each chicken is iced immediately after poaching to create a signature natural herbal jelly under the skin.',
    specialtyHighlight: 'Silky Hainan Free-Range Poached Chicken & Ginger Garlic Chili',
    images: [
      'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80'
    ],
    waitHistory: [
      { hour: '7 AM', waitMinutes: 2, label: 'Breakfast' },
      { hour: '9 AM', waitMinutes: 8, label: 'Low' },
      { hour: '11:30 AM', waitMinutes: 20, label: 'Lunch Rush' },
      { hour: '1 PM', waitMinutes: 10, label: 'Almost Sold Out' }
    ],
    menus: [
      {
        id: 'mb1',
        name: 'Hainanese Poached Chicken Rice Set',
        localName: 'ชุดข้าวมันไก่ตอนเนื้อน่อง',
        description: 'Silky poached free-range chicken, fragrant pandan ginger rice, winter melon clear soup, fermented dark soybean dip.',
        price: 5.00,
        category: 'Popular',
        image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
        dietaryTags: ['Halal', 'Dairy-Free', 'Nut-Free'],
        calories: 550,
        spiceLevel: 1,
        isPopular: true
      },
      {
        id: 'mb2',
        name: 'Crispy Roast Chicken Rice with Sweet Soy Dip',
        localName: 'ข้าวมันไก่ทอดกรอบ',
        description: 'Golden spiced battered chicken cutlet served over aromatic jasmine rice.',
        price: 5.00,
        category: 'Main Dishes',
        image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=80',
        dietaryTags: ['Halal', 'Dairy-Free'],
        calories: 620,
        spiceLevel: 0
      }
    ]
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    restaurantId: 'rest-1',
    userName: 'Elena Rostova',
    userLocation: 'Backpacker from Germany',
    rating: 5,
    comment: 'The grandmother running the front counter is so welcoming! The Tom Yum soup was the most authentic and aromatic broth I had in all of Bangkok. You can taste the freshly crushed lemongrass and galangal.',
    date: '2 days ago',
    recommendedDish: 'Signature Tom Yum River Prawn',
    dietaryTagsMentioned: ['Gluten-Free']
  },
  {
    id: 'rev-2',
    restaurantId: 'rest-1',
    userName: 'Kenji Takahashi',
    userLocation: 'Food Traveler from Tokyo',
    rating: 5,
    comment: 'Amazing royal Thai recipes. No fancy technology or tablets, just pure traditional cooking craftsmanship. The Mango sticky rice was warm and perfectly sweetened.',
    date: '1 week ago',
    recommendedDish: 'Mango Sticky Rice',
    dietaryTagsMentioned: ['Vegan']
  },
  {
    id: 'rev-3',
    restaurantId: 'rest-3',
    userName: 'Ahmad Al-Mansoor',
    userLocation: 'Dubai, UAE',
    rating: 5,
    comment: '100% genuine Halal dining in Bangkok. The lamb shank was so tender it fell right off the bone with a fork. Uncle Tariq came over to chat with us and made us feel right at home.',
    date: '3 days ago',
    recommendedDish: 'Royal Lamb Shank Zafaran Biryani',
    dietaryTagsMentioned: ['Halal']
  },
  {
    id: 'rev-4',
    restaurantId: 'rest-4',
    userName: 'Sarah Jenkins',
    userLocation: 'Sydney, Australia',
    rating: 5,
    comment: 'A true hidden gem! We saw the elderly chef boiling broth in giant clay pots over glowing charcoal. Only $6.50 for a world-class meal. Please support this family business!',
    date: 'Yesterday',
    recommendedDish: 'Charcoal Claypot Braised Beef Tendon Noodles',
    dietaryTagsMentioned: ['Dairy-Free']
  },
  {
    id: 'rev-5',
    restaurantId: 'rest-6',
    userName: 'David Tan',
    userLocation: 'Singapore',
    rating: 5,
    comment: 'Uncle Seng has been making this for over 60 years and it shows. The rice is not greasy at all, very fragrant with fresh ginger and chicken stock. Come before 11:30 AM before they sell out!',
    date: '4 days ago',
    recommendedDish: 'Hainanese Poached Chicken Rice Set',
    dietaryTagsMentioned: ['Halal']
  }
];

export const SPONSORED_ADS: AdBanner[] = [
  {
    id: 'ad-1',
    title: 'Heritage Food Tour Pass',
    subtitle: 'Explore 20+ historic old-town food stalls with English audio guides & curated local maps',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80',
    brand: 'Bangkok Old Town Walks',
    ctaText: 'Discover Local Walks',
    promoCode: 'OLDTOWN10',
    badge: 'COMMUNITY'
  },
  {
    id: 'ad-2',
    title: 'Traditional Thai Cooking Workshop',
    subtitle: 'Learn how to pound fresh curry pastes in stone mortars at a 100-year-old teak house',
    image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=800&auto=format&fit=crop&q=80',
    brand: 'Grandma’s Kitchen Academy',
    ctaText: 'View Classes',
    promoCode: 'COOKING20',
    badge: 'LOCAL CLASS'
  }
];

export const POPULAR_LOCATIONS = [
  { name: 'Chinatown Yaowarat Food Street', area: 'Historic Heritage Quarter, Bangkok', lat: 13.7402, lng: 100.5098 },
  { name: 'Old Town Rattanakosin & Phra Nakhon', area: 'Grand Palace & Heritage Alleyways', lat: 13.7563, lng: 100.4930 },
  { name: 'Bang Rak & Charoen Krung', area: 'Historic Waterfront Food Quarter', lat: 13.7225, lng: 100.5144 },
  { name: 'Siam Square & Pathum Wan', area: 'Central Bangkok Heritage Stalls', lat: 13.7462, lng: 100.5347 },
  { name: 'Nana & Arab Street (Halal Hub)', area: 'Sukhumvit Soi 3/1, Bangkok', lat: 13.7423, lng: 100.5534 }
];
