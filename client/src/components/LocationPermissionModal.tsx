import { useState } from 'react';
import { MapPin } from 'lucide-react';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';
import { logger } from '../utils/logger';

interface LocationPermissionModalProps {
  onComplete: (location?: string) => void;
  onSkip: () => void;
}

export default function LocationPermissionModal({ onComplete, onSkip }: LocationPermissionModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRequestLocation = async () => {
    try {
      setLoading(true);
      setError('');

      if (!Capacitor.isNativePlatform()) {
        // For web, use browser geolocation
        if (!navigator.geolocation) {
          setError('Geolocation is not supported by your browser');
          return;
        }

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            const location = await reverseGeocode(latitude, longitude);
            onComplete(location);
          },
          () => {
            setError('Unable to get your location. You can add it manually in your profile.');
            setTimeout(() => onSkip(), 2000);
          }
        );
      } else {
        // For native platforms, use Capacitor Geolocation
        const coordinates = await Geolocation.getCurrentPosition();
        const { latitude, longitude } = coordinates.coords;
        const location = await reverseGeocode(latitude, longitude);
        onComplete(location);
      }
    } catch (err: any) {
      logger.error('Location permission error', err as Error);
      setError('Unable to get your location. You can add it manually in your profile.');
      setTimeout(() => onSkip(), 2000);
    } finally {
      setLoading(false);
    }
  };

  const reverseGeocode = async (lat: number, lon: number): Promise<string> => {
    try {
      // Using free OpenStreetMap Nominatim API for reverse geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
      );
      const data = await response.json();
      
      if (data.address) {
        const city = data.address.city || data.address.town || data.address.village;
        const state = data.address.state;
        return city && state ? `${city}, ${state}` : 'Location found';
      }
      return 'Location found';
    } catch (error) {
      logger.error('Reverse geocoding error', error as Error, { lat, lon });
      return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <MapPin className="w-8 h-8 text-primary" />
          </div>
          
          <h2 className="text-2xl font-bold text-dark mb-2">Enable Location</h2>
          <p className="text-gray-600 mb-6">
            Help us find people near you for better matches
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleRequestLocation}
              disabled={loading}
              className="w-full px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition disabled:opacity-50"
            >
              {loading ? 'Getting location...' : 'Allow Location Access'}
            </button>
            
            <button
              onClick={onSkip}
              className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              Skip for now
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-4">
            You can always update your location in your profile settings
          </p>
        </div>
      </div>
    </div>
  );
}

