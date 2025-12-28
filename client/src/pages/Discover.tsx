import { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { api } from '../utils/api';
import { logger } from '../utils/logger';
import { SwipeUser, Match } from '../types';
import { X, Heart, MapPin, Info } from 'lucide-react';
import MatchModal from '../components/MatchModal';
import ProfileDetailModal from '../components/ProfileDetailModal';
export default function Discover() {
  const [users, setUsers] = useState<SwipeUser[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [match, setMatch] = useState<Match | null>(null);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [showProfileDetail, setShowProfileDetail] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await api.getDiscoverUsers();
      setUsers(data);
      setCurrentIndex(0);
    } catch (error) {
      logger.error('Failed to load discover users', error as Error);
    } finally {
      setLoading(false);
    }
  };

  const currentUser = users[currentIndex];

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (!currentUser) return;

    try {
      const result = await api.swipe(currentUser.id, direction);
      
      if (result.match) {
        setMatch(result.match);
        setShowMatchModal(true);
      }

      setCurrentIndex((prev) => prev + 1);

      // Load more users if running low
      if (currentIndex >= users.length - 3) {
        loadUsers();
      }
    } catch (error) {
      logger.error('Swipe error', error as Error, { swipedId: currentUser.id, direction });
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Finding matches...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-screen px-4">
        <div className="text-center max-w-md">
          <Heart className="w-12 h-12 mx-auto mb-4 text-primary" />
          <h2 className="text-2xl font-bold text-dark mb-2">Complete Your Compatibility Profile</h2>
          <p className="text-gray-600 mb-6">
            Answer 25 core compatibility questions to start discovering meaningful matches. The chat interface makes it easy and thoughtful.
          </p>
          <button
            onClick={() => window.location.href = '/compatibility'}
            className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition"
          >
            Start Compatibility Questions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-icy-100 via-white to-icy-200 p-4 page-with-nav relative">
      <div className="max-w-lg mx-auto relative z-10">
        <SwipeCard
          user={currentUser}
          onSwipe={handleSwipe}
          onShowDetail={() => setShowProfileDetail(true)}
        />
      </div>

      {showMatchModal && match && (
        <MatchModal
          match={match}
          onClose={() => setShowMatchModal(false)}
        />
      )}

      {showProfileDetail && currentUser && (
        <ProfileDetailModal
          user={currentUser}
          onClose={() => setShowProfileDetail(false)}
        />
      )}
    </div>
  );
}

interface SwipeCardProps {
  user: SwipeUser;
  onSwipe: (direction: 'left' | 'right') => void;
  onShowDetail: () => void;
}

function SwipeCard({ user, onSwipe, onShowDetail }: SwipeCardProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  const [canDrag, setCanDrag] = useState(true);

  const handleDragStart = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const scrollContainer = scrollContainerRef.current;
    
    // Only allow horizontal drag if scroll is at top and initial movement is horizontal
    if (scrollContainer) {
      const isAtTop = scrollContainer.scrollTop === 0;
      const isHorizontal = Math.abs(info.offset.x) > Math.abs(info.offset.y) * 1.2;
      
      // If not at top or not clearly horizontal, disable drag
      if (!isAtTop || !isHorizontal) {
        setCanDrag(false);
        return;
      }
      setCanDrag(true);
    }
  };

  const handleDrag = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const scrollContainer = scrollContainerRef.current;
    
    // If user is scrolling vertically, prevent horizontal drag
    if (scrollContainer && Math.abs(info.offset.y) > Math.abs(info.offset.x) * 0.7) {
      x.set(0);
    }
  };

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // Only trigger swipe if it was clearly a horizontal drag
    if (Math.abs(info.offset.x) > 100 && Math.abs(info.offset.x) > Math.abs(info.offset.y) * 1.2) {
      onSwipe(info.offset.x > 0 ? 'right' : 'left');
    } else {
      // Reset position if not swiping
      x.set(0);
    }
  };

  const photos = user.photos.length > 0 ? user.photos : ['https://via.placeholder.com/400x600?text=No+Photo'];
  const photo = photos[currentPhotoIndex];

  const handlePhotoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    
    if (x > width / 2) {
      // Clicked right half - next photo
      setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
    } else {
      // Clicked left half - previous photo
      setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
    }
  };


  return (
    <motion.div
      style={{ x: canDrag ? x : 0, rotate: canDrag ? rotate : 0, opacity }}
      drag={canDrag ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      className="relative w-full h-[calc(100vh-12rem)] bg-white rounded-2xl shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing flex flex-col"
    >
      {/* Scrollable Content Container */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto overscroll-contain min-h-0" 
        style={{ 
          touchAction: 'pan-y pan-x',
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
          scrollBehavior: 'smooth'
        }}
        onScroll={() => {
          // Re-enable drag when scrolled back to top
          const scrollContainer = scrollContainerRef.current;
          if (scrollContainer && scrollContainer.scrollTop === 0) {
            setCanDrag(true);
          }
        }}
      >
        {/* Photo Section */}
        {photos.length > 0 && (
          <div className="relative w-full aspect-[3/4] bg-gray-200 flex-shrink-0">
            <img
              src={photo}
              alt={user.name}
              className="w-full h-full object-cover cursor-pointer"
              onClick={handlePhotoClick}
            />
            
            {/* Photo indicators */}
            {photos.length > 1 && (
              <div className="absolute top-4 left-0 right-0 flex gap-1 px-4">
                {photos.map((_, index) => (
                  <div
                    key={index}
                    className={`flex-1 h-1 rounded-full transition-all ${
                      index === currentPhotoIndex ? 'bg-white' : 'bg-white/40'
                    }`}
                  />
                ))}
              </div>
            )}
            
            {/* Gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />
            
            {/* Name and Location over photo */}
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h2 className="text-3xl font-bold mb-2">
                {user.name}, {user.age}
              </h2>
              {(user.location || user.distance) && (
                <div className="flex items-center text-white/90">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span className="text-sm">
                    {user.distance !== null && user.distance !== undefined 
                      ? `${user.distance} miles away` 
                      : user.location}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* If no photos, show gradient header */}
        {photos.length === 0 && (
          <div className="bg-gradient-to-br from-orange-500 via-red-500 to-red-800 p-6 text-white flex-shrink-0">
            <h2 className="text-3xl font-bold mb-2">
              {user.name}, {user.age}
            </h2>
            {(user.location || user.distance) && (
              <div className="flex items-center text-white/90">
                <MapPin className="w-4 h-4 mr-1" />
                <span className="text-sm">
                  {user.distance !== null && user.distance !== undefined 
                    ? `${user.distance} miles away` 
                    : user.location}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Scrollable Profile Details */}
        <div className="p-6 space-y-6 bg-white">
          {/* About */}
          {user.bio && (
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-2">About</h3>
              <p className="text-sm text-gray-700 leading-relaxed">{user.bio}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center gap-6 pt-6 pb-4 border-t border-gray-200">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSwipe('left');
              }}
              className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center active:scale-95 transition transform border-2 border-red-100"
            >
              <X className="w-8 h-8 text-red-500" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onShowDetail();
              }}
              className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center active:scale-95 transition transform border-2 border-gray-100"
            >
              <Info className="w-8 h-8 text-gray-600" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSwipe('right');
              }}
              className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center active:scale-95 transition transform border-2 border-primary/20"
            >
              <Heart className="w-8 h-8 text-primary" fill="currentColor" />
            </button>
          </div>
        </div>
      </div>

      {/* Swipe indicators */}
      <motion.div
        style={{ opacity: useTransform(x, [0, 100], [0, 1]) }}
        className="absolute top-8 right-8 bg-primary text-white px-6 py-3 rounded-lg font-bold text-2xl rotate-12 border-4 border-primary pointer-events-none"
      >
        LIKE
      </motion.div>
      
      <motion.div
        style={{ opacity: useTransform(x, [-100, 0], [1, 0]) }}
        className="absolute top-8 left-8 bg-red-500 text-white px-6 py-3 rounded-lg font-bold text-2xl -rotate-12 border-4 border-red-500 pointer-events-none"
      >
        NOPE
      </motion.div>
    </motion.div>
  );
}

