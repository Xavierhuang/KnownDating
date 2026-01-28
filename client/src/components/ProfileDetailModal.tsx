import { useState } from 'react';
import { X, MapPin, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { SwipeUser } from '../types';

interface ProfileDetailModalProps {
  user: SwipeUser;
  onClose: () => void;
}

export default function ProfileDetailModal({ user, onClose }: ProfileDetailModalProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const photos = user.photos.length > 0 ? user.photos : ['https://via.placeholder.com/400x600?text=No+Photo'];

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={onClose}>
      {/* Close button - positioned relative to viewport, not modal */}
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onClose();
        }}
        className="fixed z-[60] w-12 h-12 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 transition shadow-lg"
        style={{
          top: 'calc(env(safe-area-inset-top, 0px) + 16px)',
          right: 'calc(env(safe-area-inset-right, 0px) + 16px)',
          touchAction: 'manipulation',
          WebkitTapHighlightColor: 'transparent'
        }}
      >
        <X className="w-6 h-6 text-gray-800" />
      </button>

      <div 
        className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >

        {/* Photo gallery */}
        <div className="relative aspect-[3/4] bg-gray-900">
          <img
            src={photos[currentPhotoIndex]}
            alt={user.name}
            className="w-full h-full object-cover"
          />

          {/* Photo navigation */}
          {photos.length > 1 && (
            <>
              <button
                onClick={prevPhoto}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition"
              >
                <ChevronLeft className="w-6 h-6 text-gray-800" />
              </button>
              <button
                onClick={nextPhoto}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition"
              >
                <ChevronRight className="w-6 h-6 text-gray-800" />
              </button>

              {/* Photo indicators */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
                {photos.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPhotoIndex(index)}
                    className={`w-2 h-2 rounded-full transition ${
                      index === currentPhotoIndex ? 'bg-white w-6' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* User details */}
        <div className="p-6 space-y-4 max-h-64 overflow-y-auto">
          <div>
            <h2 className="text-3xl font-bold text-dark">
              {user.name}, {user.age}
            </h2>
          </div>

          {user.location && (
            <div className="flex items-center text-gray-600">
              <MapPin className="w-5 h-5 mr-2 text-primary" />
              <span>{user.location}</span>
            </div>
          )}

          {user.bio && (
            <div className="flex items-start text-gray-700">
              <Info className="w-5 h-5 mr-2 mt-0.5 text-primary flex-shrink-0" />
              <p className="text-sm leading-relaxed">{user.bio}</p>
            </div>
          )}

          {user.gender && (
            <div className="text-sm text-gray-600">
              <span className="font-semibold">Gender:</span> <span className="capitalize">{user.gender}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

