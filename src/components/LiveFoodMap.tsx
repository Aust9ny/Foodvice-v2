import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Compass,
  Navigation,
  MapPin,
  Star,
  Utensils,
  ChevronDown,
  X,
  Volume2,
  VolumeX,
  Layers,
  RotateCw,
  Locate,
  Bookmark,
  Sun,
  Moon,
  Sunset,
  Radio,
  ExternalLink,
  Info
} from 'lucide-react';
import { Restaurant, DietaryTag, UserLocation } from '../types';
import { POPULAR_LOCATIONS } from '../data/mockRestaurants';

interface LiveFoodMapProps {
  restaurants: Restaurant[];
  currentLocation: UserLocation;
  onSelectLocation: (loc: UserLocation) => void;
  onOpenRestaurantDetail: (restaurant: Restaurant) => void;
  savedRestaurantIds: string[];
  onToggleBookmark: (restaurantId: string) => void;
  onOpenSuggestModal: () => void;
}

// Simple Web Audio Sound Synthesizer for live radar pings & proximity cues
const playRadarAudio = (type: 'ping' | 'select') => {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === 'ping') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(784, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(392, ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } else if (type === 'select') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    }
  } catch {
    // Audio context may be restricted before user gesture
  }
};

export const LiveFoodMap: React.FC<LiveFoodMapProps> = ({
  restaurants,
  currentLocation,
  onSelectLocation,
  onOpenRestaurantDetail,
  savedRestaurantIds,
  onToggleBookmark,
  onOpenSuggestModal
}) => {
  // Live GPS Coordinates & Accuracy
  const [liveGpsCoords, setLiveGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [gpsStatus, setGpsStatus] = useState<'locating' | 'active' | 'denied' | 'fallback'>('locating');

  // Camera Center Offset in meters (relative to reference anchor location)
  // When cameraOffset matches playerOffset, camera is locked to traveler GPS
  const [cameraOffset, setCameraOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [playerOffset, setPlayerOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [playerHeading, setPlayerHeading] = useState<number>(0); // Heading in degrees (0 = North)
  const [isCameraFollowLocked, setIsCameraFollowLocked] = useState<boolean>(true);

  // Map Controls (3D Isometric Pitch, Rotation, Theme)
  const [mapRotation, setMapRotation] = useState<number>(0);
  const [mapPitch, setMapPitch] = useState<number>(55); // 55deg = 3D Perspective, 0deg = 2D Top-down
  const [timeOfDay, setTimeOfDay] = useState<'day' | 'sunset' | 'night'>('day');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Dietary / Heritage Filters
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'heritage' | DietaryTag>('all');

  // Selected Restaurant Card Popup
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

  // Pan interaction refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const cameraStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const triggerSound = useCallback((type: 'ping' | 'select') => {
    if (soundEnabled) {
      playRadarAudio(type);
    }
  }, [soundEnabled]);

  // 1. Live Device GPS Tracking via navigator.geolocation.watchPosition
  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsStatus('fallback');
      return;
    }

    setGpsStatus('locating');

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy, heading } = pos.coords;
        setLiveGpsCoords({ lat: latitude, lng: longitude });
        setGpsAccuracy(Math.round(accuracy));
        setGpsStatus('active');

        // Calculate metric offset relative to current district anchor
        const dLat = latitude - currentLocation.lat;
        const dLng = longitude - currentLocation.lng;
        const metersY = -dLat * 110540; // North is -Y
        const metersX = dLng * (111320 * Math.cos((currentLocation.lat * Math.PI) / 180));

        setPlayerOffset({ x: metersX, y: metersY });

        // Update heading if device provides it
        if (heading !== null && !isNaN(heading)) {
          setPlayerHeading(heading);
        }
      },
      (err) => {
        console.warn('Live GPS watch error or permission denied:', err.message);
        setGpsStatus('fallback');
      },
      {
        enableHighAccuracy: true,
        maximumAge: 2000,
        timeout: 10000
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [currentLocation]);

  // 2. Real-time Device Orientation / Compass Heading Sensor
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      // webkitCompassHeading for iOS Safari, e.alpha for Android Chrome
      let compassHeading: number | null = null;
      if ('webkitCompassHeading' in e && typeof (e as unknown as { webkitCompassHeading: number }).webkitCompassHeading === 'number') {
        compassHeading = (e as unknown as { webkitCompassHeading: number }).webkitCompassHeading;
      } else if (e.alpha !== null) {
        compassHeading = 360 - e.alpha;
      }

      if (compassHeading !== null && !isNaN(compassHeading)) {
        setPlayerHeading(compassHeading);
      }
    };

    window.addEventListener('deviceorientation', handleOrientation, true);
    return () => window.removeEventListener('deviceorientation', handleOrientation, true);
  }, []);

  // 3. Keep Camera locked to Live GPS position when isCameraFollowLocked is true
  useEffect(() => {
    if (isCameraFollowLocked) {
      setCameraOffset(playerOffset);
    }
  }, [playerOffset, isCameraFollowLocked]);

  // Map Restaurants to Relative Coordinate Offsets (in meters)
  const restaurantMarkers = useMemo(() => {
    return restaurants.map((rest, index) => {
      const dLat = rest.coords.lat - currentLocation.lat;
      const dLng = rest.coords.lng - currentLocation.lng;
      
      let x = dLng * (111320 * Math.cos((currentLocation.lat * Math.PI) / 180));
      let y = -dLat * 110540;

      // Disperse markers cleanly if mock coordinates overlap
      if (Math.abs(x) < 5 && Math.abs(y) < 5) {
        const angle = (index * (2 * Math.PI)) / Math.max(restaurants.length, 1);
        const radius = 70 + (index % 4) * 45;
        x = Math.cos(angle) * radius;
        y = Math.sin(angle) * radius;
      }

      // Distance from live GPS traveler in meters
      const distFromPlayer = Math.round(
        Math.hypot(x - playerOffset.x, y - playerOffset.y)
      );

      const isHeritage = rest.isHeritageGem || !!rest.establishedYear;

      return {
        ...rest,
        mapX: x,
        mapY: y,
        distanceMeters: distFromPlayer,
        isHeritage
      };
    });
  }, [restaurants, currentLocation, playerOffset]);

  // Filtered Markers
  const filteredMarkers = useMemo(() => {
    return restaurantMarkers.filter((m) => {
      if (selectedFilter === 'all') return true;
      if (selectedFilter === 'heritage') return m.isHeritage;
      return (
        m.dietaryCertifications.includes(selectedFilter) ||
        m.menus.some((dish) => dish.dietaryTags.includes(selectedFilter))
      );
    });
  }, [restaurantMarkers, selectedFilter]);

  // Recenter Camera onto Live GPS location
  const handleRecenterGps = () => {
    setIsCameraFollowLocked(true);
    setCameraOffset(playerOffset);
    triggerSound('ping');
  };

  // Touch/Mouse Drag to Pan the 3D Map to explore surrounding blocks
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    isDraggingRef.current = true;
    dragStartRef.current = { x: clientX, y: clientY };
    cameraStartRef.current = { ...cameraOffset };
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDraggingRef.current) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const dx = clientX - dragStartRef.current.x;
    const dy = clientY - dragStartRef.current.y;

    if (Math.hypot(dx, dy) > 8) {
      setIsCameraFollowLocked(false);
    }

    const rad = (-mapRotation * Math.PI) / 180;
    const rotatedDx = dx * Math.cos(rad) - dy * Math.sin(rad);
    const rotatedDy = dx * Math.sin(rad) + dy * Math.cos(rad);

    setCameraOffset({
      x: cameraStartRef.current.x - rotatedDx * 0.85,
      y: cameraStartRef.current.y - rotatedDy * 0.85
    });
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Open Google Maps Directions
  const handleOpenMaps = (restaurant: Restaurant) => {
    const query = encodeURIComponent(`${restaurant.name}, ${restaurant.address}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  // Map theme styles
  const themeBackground =
    timeOfDay === 'day'
      ? 'bg-radial from-emerald-100 via-emerald-200 to-green-300'
      : timeOfDay === 'sunset'
      ? 'bg-gradient-to-b from-amber-200 via-rose-200 to-indigo-900'
      : 'bg-radial from-slate-900 via-indigo-950 to-black';

  const gridLineColor =
    timeOfDay === 'night'
      ? 'rgba(0, 240, 150, 0.12)'
      : timeOfDay === 'sunset'
      ? 'rgba(255, 180, 50, 0.2)'
      : 'rgba(0, 177, 79, 0.15)';

  const roadColor =
    timeOfDay === 'night'
      ? 'bg-slate-800/80 border-slate-700/60'
      : timeOfDay === 'sunset'
      ? 'bg-amber-100/70 border-amber-300/60'
      : 'bg-white/85 border-emerald-300/50';

  const isOffsetFromPlayer = Math.hypot(cameraOffset.x - playerOffset.x, cameraOffset.y - playerOffset.y) > 20;

  return (
    <div 
      id="live-food-map-container"
      className="relative w-full h-[calc(100vh-68px)] max-w-lg mx-auto overflow-hidden select-none bg-slate-900 flex flex-col font-sans"
    >
      {/* 1. TOP FLOATING HUD (District Selector, GPS Status, Filters, Sound, Add Button) */}
      <div className="absolute top-2 inset-x-2.5 z-30 flex flex-col gap-1.5 pointer-events-none">
        <div className="flex items-center justify-between gap-1.5 pointer-events-auto">
          {/* District Selector Pill */}
          <div className="relative flex-1 min-w-0">
            <button
              id="livemap-district-selector"
              onClick={() => {
                const currentIndex = POPULAR_LOCATIONS.findIndex((l) => l.name === currentLocation.name);
                const nextLoc = POPULAR_LOCATIONS[(currentIndex + 1) % POPULAR_LOCATIONS.length];
                onSelectLocation(nextLoc);
                setPlayerOffset({ x: 0, y: 0 });
                setCameraOffset({ x: 0, y: 0 });
                setIsCameraFollowLocked(true);
                triggerSound('ping');
              }}
              className="w-full bg-white/95 hover:bg-white text-gray-900 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-lg border border-gray-200/80 flex items-center justify-between gap-1.5 transition-transform active:scale-98"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="w-5 h-5 rounded-full bg-[#00B14F] text-white flex items-center justify-center text-[10px] font-black shrink-0 shadow-xs">
                  📍
                </div>
                <div className="text-left min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] font-extrabold text-[#00B14F] uppercase tracking-wider block">
                      DISTRICT
                    </span>
                    {gpsStatus === 'active' && (
                      <span className="inline-flex items-center gap-0.5 bg-emerald-100 text-emerald-800 text-[8px] font-black px-1 rounded">
                        <Radio className="w-2 h-2 text-emerald-600 animate-pulse" />
                        GPS LIVE {gpsAccuracy ? `(±${gpsAccuracy}m)` : ''}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-black truncate leading-tight text-gray-900">
                    {currentLocation.name}
                  </p>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-gray-500 shrink-0" />
            </button>
          </div>

          {/* Add Stall Button */}
          <button
            onClick={onOpenSuggestModal}
            className="px-2.5 py-1.5 rounded-2xl bg-[#00B14F] text-white font-extrabold text-xs shadow-lg flex items-center gap-1 active:scale-95 transition-transform border border-emerald-300/40 shrink-0"
          >
            <span>+ Add Stall</span>
          </button>

          {/* Radar Audio Toggle */}
          <button
            id="livemap-sound-btn"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="w-8 h-8 rounded-2xl bg-white/90 backdrop-blur-md shadow-lg border border-gray-200 flex items-center justify-center text-gray-700 active:scale-90 transition-transform shrink-0"
            title={soundEnabled ? 'Mute Radar Audio' : 'Enable Radar Audio'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-[#00B14F]" /> : <VolumeX className="w-4 h-4 text-gray-400" />}
          </button>
        </div>

        {/* Quick Filter Chips */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 pointer-events-auto">
          {[
            { id: 'all', label: 'All Stalls', icon: '🏮' },
            { id: 'heritage', label: '50+ Yr Heritage', icon: '👑' },
            { id: 'Halal', label: 'Halal Certified', icon: '🟢' },
            { id: 'Vegan', label: 'Vegan / Jae', icon: '🌱' },
            { id: 'Gluten-Free', label: 'Gluten-Free', icon: '🌾' }
          ].map((f) => {
            const isActive = selectedFilter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => {
                  setSelectedFilter(f.id as typeof selectedFilter);
                  triggerSound('ping');
                }}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold whitespace-nowrap shadow-md transition-all active:scale-95 flex items-center gap-1 backdrop-blur-md ${
                  isActive
                    ? 'bg-[#00B14F] text-white border-2 border-emerald-300 ring-2 ring-emerald-400/30'
                    : 'bg-white/90 text-gray-800 border border-gray-200/80 hover:bg-white'
                }`}
              >
                <span>{f.icon}</span>
                <span>{f.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. THE 3D LIVE MAP PERSPECTIVE CANVAS */}
      <div
        ref={mapContainerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
        className={`flex-1 relative w-full h-full cursor-grab active:cursor-grabbing overflow-hidden ${themeBackground} transition-colors duration-500`}
        style={{
          perspective: '1000px'
        }}
      >
        {/* Sky / Horizon Glow */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            background:
              timeOfDay === 'night'
                ? 'radial-gradient(circle at 50% 10%, rgba(56, 189, 248, 0.25), transparent 70%)'
                : 'radial-gradient(circle at 50% 15%, rgba(255, 255, 255, 0.4), transparent 65%)'
          }}
        />

        {/* 3D Rotated & Tilted World Plane */}
        <div
          id="livemap-world-plane"
          className="absolute inset-0 flex items-center justify-center transition-transform duration-75 ease-out"
          style={{
            transform: `rotateX(${mapPitch}deg) rotateZ(${mapRotation}deg)`,
            transformStyle: 'preserve-3d'
          }}
        >
          {/* Ground Terrain Grid (1600px x 1600px) */}
          <div
            className="absolute w-[1600px] h-[1600px] rounded-full shadow-inner pointer-events-none"
            style={{
              transform: `translate(${-cameraOffset.x}px, ${-cameraOffset.y}px)`,
              backgroundImage: `
                linear-gradient(to right, ${gridLineColor} 1px, transparent 1px),
                linear-gradient(to bottom, ${gridLineColor} 1px, transparent 1px)
              `,
              backgroundSize: '80px 80px',
              backgroundColor: timeOfDay === 'night' ? '#0f172a' : timeOfDay === 'sunset' ? '#fde68a' : '#86efac'
            }}
          >
            {/* Walking Pathways & Main Streets */}
            <div className={`absolute top-0 bottom-0 left-[760px] w-20 ${roadColor} shadow-md border-x`} />
            <div className={`absolute left-0 right-0 top-[760px] h-20 ${roadColor} shadow-md border-y`} />
            <div className={`absolute top-0 bottom-0 left-[350px] w-14 ${roadColor} shadow-sm border-x`} />
            <div className={`absolute left-0 right-0 top-[350px] h-14 ${roadColor} shadow-sm border-y`} />
            <div className={`absolute top-0 bottom-0 left-[1180px] w-14 ${roadColor} shadow-sm border-x`} />
            <div className={`absolute left-0 right-0 top-[1180px] h-14 ${roadColor} shadow-sm border-y`} />

            {/* Canal / River */}
            <div className="absolute left-0 right-0 top-[1380px] h-28 bg-cyan-500/50 backdrop-blur-xs border-y-2 border-cyan-400/60 shadow-inner" />

            {/* Shrub / Tree landmarks */}
            {[
              { x: 620, y: 640 },
              { x: 920, y: 620 },
              { x: 640, y: 920 },
              { x: 940, y: 940 },
              { x: 220, y: 480 },
              { x: 1340, y: 520 },
              { x: 500, y: 1240 },
              { x: 1100, y: 1280 }
            ].map((tree, idx) => (
              <div
                key={idx}
                className="absolute w-8 h-8 rounded-full bg-emerald-700/80 border-2 border-emerald-500 flex items-center justify-center text-xs shadow-md"
                style={{ left: `${tree.x}px`, top: `${tree.y}px` }}
              >
                🌳
              </div>
            ))}
          </div>

          {/* 3. SURROUNDING RESTAURANT BEACONS */}
          {filteredMarkers.map((marker) => {
            const relX = marker.mapX - cameraOffset.x;
            const relY = marker.mapY - cameraOffset.y;
            const isNear = marker.distanceMeters <= 80;

            return (
              <div
                key={marker.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedRestaurant(marker);
                  triggerSound('select');
                }}
                className="absolute cursor-pointer transition-transform duration-100 group"
                style={{
                  transform: `translate3d(${relX}px, ${relY}px, 0px)`,
                  transformStyle: 'preserve-3d'
                }}
              >
                {/* Ground Shadow & Glowing Pedestal Base */}
                <div
                  className={`w-24 h-12 -ml-12 -mt-6 rounded-full blur-xs transition-all duration-300 ${
                    isNear
                      ? 'bg-amber-400/80 animate-ping'
                      : marker.isHeritage
                      ? 'bg-amber-500/40'
                      : 'bg-emerald-500/40'
                  }`}
                />

                {/* Ground Ring Marker */}
                <div
                  className={`absolute -left-8 -top-8 w-16 h-16 rounded-full border-2 border-dashed flex items-center justify-center transition-all ${
                    isNear
                      ? 'border-amber-400 bg-amber-400/20 scale-125 animate-pulse'
                      : marker.isHeritage
                      ? 'border-amber-500/60 bg-amber-500/10'
                      : 'border-[#00B14F]/60 bg-emerald-500/10'
                  }`}
                >
                  <span className="text-[9px] font-black text-gray-900 bg-white/90 px-1 rounded shadow-xs">
                    {marker.distanceMeters}m
                  </span>
                </div>

                {/* Vertical 3D Floating Restaurant Beacon Card */}
                <div
                  className="absolute -top-16 -left-10 w-20 flex flex-col items-center pointer-events-auto"
                  style={{
                    transform: `rotateZ(${-mapRotation}deg) rotateX(${-mapPitch}deg)`,
                    transformStyle: 'preserve-3d'
                  }}
                >
                  {/* Floating Nearby Indicator Badge */}
                  {isNear && (
                    <div className="bg-gradient-to-r from-amber-500 to-emerald-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-lg animate-bounce uppercase mb-0.5 whitespace-nowrap">
                      ✨ NEARBY STALL
                    </div>
                  )}

                  {/* Circular Restaurant Image Marker */}
                  <div
                    className={`relative w-14 h-14 rounded-full p-1 shadow-2xl transition-all duration-300 group-hover:scale-115 ${
                      isNear
                        ? 'ring-4 ring-amber-400 bg-amber-100 shadow-amber-400/50'
                        : marker.isHeritage
                        ? 'ring-3 ring-amber-500 bg-amber-50 shadow-amber-500/30'
                        : 'ring-3 ring-[#00B14F] bg-emerald-50 shadow-emerald-500/30'
                    }`}
                  >
                    <img
                      src={marker.images[0]}
                      alt={marker.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover rounded-full"
                    />

                    {/* Heritage Crown Badge */}
                    {marker.isHeritage && (
                      <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[9px] shadow-md border border-white font-bold">
                        👑
                      </div>
                    )}
                  </div>

                  {/* Stall Name Tag */}
                  <div className="mt-1 bg-white/95 backdrop-blur-md px-2 py-0.5 rounded-lg shadow-md border border-gray-200/80 text-center max-w-[110px]">
                    <p className="text-[10px] font-black text-gray-900 truncate leading-tight">
                      {marker.name}
                    </p>
                    <div className="flex items-center justify-center gap-1 text-[9px] font-bold text-[#00B14F]">
                      <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                      <span>{marker.rating}</span>
                      <span className="text-gray-400">({marker.distanceMeters}m)</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* 4. LIVE GPS TRAVELER LOCATION IN 3D WORLD */}
          {(() => {
            const playerRelX = playerOffset.x - cameraOffset.x;
            const playerRelY = playerOffset.y - cameraOffset.y;

            return (
              <div
                id="livemap-user-avatar"
                className="absolute left-0 top-0 w-0 h-0 flex items-center justify-center pointer-events-none"
                style={{
                  transform: `translate3d(${playerRelX}px, ${playerRelY}px, 0px)`,
                  transformStyle: 'preserve-3d'
                }}
              >
                {/* Sonar Live GPS Pulse Rings */}
                <div className="absolute w-24 h-24 rounded-full border-2 border-emerald-400/80 bg-emerald-400/15 animate-ping" />
                <div className="absolute w-44 h-44 rounded-full border border-dashed border-emerald-500/50 bg-emerald-500/5 animate-pulse" />
                {gpsAccuracy && gpsAccuracy < 100 && (
                  <div
                    className="absolute rounded-full border border-emerald-400/30 bg-emerald-500/10 pointer-events-none"
                    style={{
                      width: `${Math.max(gpsAccuracy * 2, 40)}px`,
                      height: `${Math.max(gpsAccuracy * 2, 40)}px`
                    }}
                  />
                )}

                {/* Glowing Ground Base */}
                <div className="w-14 h-14 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 opacity-60 blur-xs shadow-lg" />

                {/* Real-time Compass Heading Cone Light Beam */}
                <div
                  className="absolute w-32 h-32 origin-center pointer-events-none transition-transform duration-200 ease-out"
                  style={{
                    transform: `rotateZ(${playerHeading}deg)`,
                    clipPath: 'polygon(50% 50%, 15% 0%, 85% 0%)',
                    background: 'linear-gradient(to top, rgba(0, 177, 79, 0.7), transparent)'
                  }}
                />

                {/* 3D Traveler Avatar */}
                <div
                  className="absolute -top-12 flex flex-col items-center"
                  style={{
                    transform: `rotateZ(${-mapRotation}deg) rotateX(${-mapPitch}deg)`,
                    transformStyle: 'preserve-3d'
                  }}
                >
                  <div className="relative">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#00B14F] to-emerald-400 text-white flex items-center justify-center text-xl shadow-2xl border-2 border-white ring-4 ring-emerald-400/40">
                      🤠
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[8px] font-black border border-white">
                      📍
                    </div>
                  </div>

                  <div className="mt-1 bg-gray-900/90 text-white text-[9px] font-black px-2 py-0.5 rounded-full backdrop-blur-md shadow-md border border-white/20 whitespace-nowrap flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>YOU (GPS Live)</span>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* 3. RECENTER GPS FLOATING ACTION BUTTON (Appears when traveler pans map) */}
      {isOffsetFromPlayer && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-30 pointer-events-auto animate-in fade-in slide-in-from-bottom-2 duration-200">
          <button
            id="btn-recenter-gps"
            onClick={handleRecenterGps}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-gray-900/95 text-white font-extrabold text-xs shadow-2xl border border-emerald-400/50 backdrop-blur-md active:scale-95 transition-all hover:bg-black"
          >
            <Locate className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>Recenter on My GPS Location</span>
          </button>
        </div>
      )}

      {/* 4. BOTTOM FLOATING CONTROLS (Live GPS Status, Camera Rotation, 3D Tilt, Theme) */}
      <div className="absolute bottom-2.5 inset-x-3 z-30 flex items-end justify-between pointer-events-none">
        {/* Left: GPS Status Info Badge */}
        <div className="pointer-events-auto flex items-center gap-1.5 bg-white/90 backdrop-blur-md py-1.5 px-3 rounded-2xl shadow-xl border border-gray-200">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
          <div className="text-left">
            <span className="text-[10px] font-black text-gray-800 block leading-tight">
              LIVE GPS TRACKING
            </span>
            <span className="text-[9px] text-gray-500 font-semibold block leading-tight">
              {gpsAccuracy ? `Accuracy: ±${gpsAccuracy}m` : 'Listening to device GPS...'}
            </span>
          </div>
        </div>

        {/* Right: Camera Rotation, 3D Tilt, Day/Night Theme */}
        <div className="pointer-events-auto flex gap-1.5">
          {/* Recenter / Follow GPS Button */}
          <button
            onClick={handleRecenterGps}
            className={`w-9 h-9 rounded-2xl backdrop-blur-md shadow-lg border flex items-center justify-center active:scale-90 transition-transform ${
              isCameraFollowLocked
                ? 'bg-[#00B14F] text-white border-emerald-300 shadow-emerald-500/30'
                : 'bg-white/90 text-gray-700 border-gray-200 hover:bg-white'
            }`}
            title="Lock Camera to My Live GPS"
          >
            <Locate className="w-4 h-4" />
          </button>

          {/* Rotate Map (Compass) */}
          <button
            onClick={() => {
              setMapRotation((prev) => (prev + 45) % 360);
              triggerSound('ping');
            }}
            className="w-9 h-9 rounded-2xl bg-white/90 backdrop-blur-md shadow-lg border border-gray-200 flex items-center justify-center text-gray-800 active:scale-90 transition-transform font-bold text-xs"
            title="Rotate Live Map (Compass)"
          >
            <RotateCw className="w-4 h-4 text-[#00B14F]" />
          </button>

          {/* 3D Perspective vs 2D Bird's Eye Toggle */}
          <button
            onClick={() => {
              setMapPitch((prev) => (prev === 55 ? 0 : 55));
              triggerSound('ping');
            }}
            className="w-9 h-9 rounded-2xl bg-white/90 backdrop-blur-md shadow-lg border border-gray-200 flex items-center justify-center text-gray-800 active:scale-90 transition-transform font-bold text-[10px]"
            title="Toggle 3D Live Perspective vs 2D Bird's Eye"
          >
            <Layers className="w-4 h-4 text-amber-600" />
          </button>

          {/* Day / Night Theme */}
          <button
            onClick={() => {
              setTimeOfDay((prev) => (prev === 'day' ? 'sunset' : prev === 'sunset' ? 'night' : 'day'));
              triggerSound('ping');
            }}
            className="w-9 h-9 rounded-2xl bg-white/90 backdrop-blur-md shadow-lg border border-gray-200 flex items-center justify-center text-gray-800 active:scale-90 transition-transform"
            title="Switch Map Theme (Day / Sunset / Night)"
          >
            {timeOfDay === 'day' ? (
              <Sun className="w-4 h-4 text-amber-500" />
            ) : timeOfDay === 'sunset' ? (
              <Sunset className="w-4 h-4 text-rose-500" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-500" />
            )}
          </button>
        </div>
      </div>

      {/* 5. SELECTED RESTAURANT DETAIL MODAL */}
      {selectedRestaurant && (
        <div 
          id="livemap-restaurant-modal-backdrop"
          className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
        >
          <div 
            id="livemap-restaurant-modal-card"
            className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-300 border border-gray-100"
          >
            {/* Header Photo */}
            <div className="relative h-44 bg-gradient-to-b from-gray-900 to-gray-800 p-4 flex flex-col justify-between text-white">
              <img
                src={selectedRestaurant.images[0]}
                alt={selectedRestaurant.name}
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

              {/* Close Button */}
              <div className="relative z-10 flex items-center justify-between">
                <span className="bg-[#00B14F] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-md uppercase tracking-wider">
                  📍 LIVE RADAR SPOT
                </span>

                <button
                  onClick={() => setSelectedRestaurant(null)}
                  className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Restaurant Info */}
              <div className="relative z-10">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="bg-white/20 backdrop-blur-xs text-white text-[9px] font-extrabold px-2 py-0.5 rounded">
                    {selectedRestaurant.cuisine}
                  </span>
                  {selectedRestaurant.establishedYear && (
                    <span className="bg-amber-500 text-black text-[9px] font-extrabold px-2 py-0.5 rounded">
                      Est. {selectedRestaurant.establishedYear}
                    </span>
                  )}
                  <span className="text-xs text-gray-300 font-semibold">{selectedRestaurant.priceRange}</span>

                  <div className="flex items-center gap-1 bg-amber-400 text-black px-2 py-0.5 rounded font-black text-xs ml-auto">
                    <Star className="w-3 h-3 fill-black" />
                    <span>{selectedRestaurant.rating}</span>
                  </div>
                </div>

                <h3 className="text-base font-black text-white leading-tight">
                  {selectedRestaurant.name}
                </h3>
                {selectedRestaurant.localName && (
                  <p className="text-xs text-amber-200 font-bold">{selectedRestaurant.localName}</p>
                )}
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-3">
              {/* Signature Dish Highlight */}
              <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-1">
                <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider block">
                  ✨ SIGNATURE SPECIALTY:
                </span>
                <p className="text-xs font-bold text-gray-900">
                  {selectedRestaurant.menus[0]?.name || selectedRestaurant.specialtyHighlight || 'Traditional Family Recipe'}
                </p>
                <p className="text-[11px] text-gray-600 line-clamp-2">
                  {selectedRestaurant.menus[0]?.description || selectedRestaurant.heritageStory}
                </p>
              </div>

              {/* Distance, Walk time & Address */}
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-2 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-[9px] font-bold text-gray-400 block uppercase">Radar Distance</span>
                  <span className="font-extrabold text-[#00B14F] text-sm">
                    {selectedRestaurant.distanceMeters || Math.round(selectedRestaurant.distanceKm * 1000)}m
                  </span>
                </div>
                <div className="p-2 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-[9px] font-bold text-gray-400 block uppercase">Walk Time</span>
                  <span className="font-extrabold text-gray-800 text-sm">
                    ~{Math.max(1, Math.round((selectedRestaurant.distanceMeters || 100) / 75))} mins
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                {/* Open in Google Maps */}
                <button
                  onClick={() => handleOpenMaps(selectedRestaurant)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-[#00B14F] hover:bg-[#00913f] text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Open in Google Maps</span>
                </button>

                {/* View Full Menu */}
                <button
                  onClick={() => {
                    onOpenRestaurantDetail(selectedRestaurant);
                    setSelectedRestaurant(null);
                  }}
                  className="py-2.5 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-900 font-extrabold text-xs flex items-center justify-center gap-1 transition-colors"
                >
                  <Utensils className="w-3.5 h-3.5 text-gray-600" />
                  <span>Full Menu</span>
                </button>

                {/* Bookmark */}
                <button
                  onClick={() => onToggleBookmark(selectedRestaurant.id)}
                  className={`p-2.5 rounded-xl border transition-colors ${
                    savedRestaurantIds.includes(selectedRestaurant.id)
                      ? 'bg-amber-400 border-amber-500 text-black'
                      : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'
                  }`}
                  title="Bookmark to Trip"
                >
                  <Bookmark className={`w-4 h-4 ${savedRestaurantIds.includes(selectedRestaurant.id) ? 'fill-black' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
