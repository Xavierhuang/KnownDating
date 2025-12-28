import { useState } from 'react';
import { X, Sliders } from 'lucide-react';
import { api } from '../utils/api';
import { logger } from '../utils/logger';
import { User } from '../types';

interface FilterModalProps {
  onClose: () => void;
  onApply: () => void;
  currentUser: User;
}

export default function FilterModal({ onClose, onApply, currentUser }: FilterModalProps) {
  const [ageMin, setAgeMin] = useState(currentUser.age_min || 18);
  const [ageMax, setAgeMax] = useState(currentUser.age_max || 99);
  const [distanceMax, setDistanceMax] = useState(currentUser.distance_max || 50);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    try {
      setLoading(true);
      await api.updateProfile({
        age_min: ageMin,
        age_max: ageMax,
        distance_max: distanceMax,
      });
      onApply();
      onClose();
    } catch (error) {
      logger.error('Failed to update filters', error as Error);
      alert('Failed to save filters. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 relative animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Sliders className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-dark">Discovery Filters</h2>
            <p className="text-sm text-gray-600">Adjust who you see</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Age Range */}
          <div>
            <label className="block text-sm font-semibold text-dark mb-3">
              Age Range: {ageMin} - {ageMax}
            </label>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Minimum Age</label>
                <input
                  type="range"
                  min="18"
                  max="99"
                  value={ageMin}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    setAgeMin(value);
                    if (value > ageMax) {
                      setAgeMax(value);
                    }
                  }}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Maximum Age</label>
                <input
                  type="range"
                  min="18"
                  max="99"
                  value={ageMax}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    setAgeMax(value);
                    if (value < ageMin) {
                      setAgeMin(value);
                    }
                  }}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
            </div>
          </div>

          {/* Distance */}
          <div>
            <label className="block text-sm font-semibold text-dark mb-3">
              Maximum Distance: {distanceMax === 100 ? '100+' : distanceMax} miles
            </label>
            <input
              type="range"
              min="1"
              max="100"
              value={distanceMax}
              onChange={(e) => setDistanceMax(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1 mi</span>
              <span>100+ mi</span>
            </div>
          </div>

          {/* Info Message */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              <strong>Note:</strong> Distance filtering requires location services. 
              If location is not available, all users within your age range will be shown.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Apply Filters'}
          </button>
        </div>
      </div>
    </div>
  );
}

