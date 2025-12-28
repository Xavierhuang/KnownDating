import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { logger } from '../utils/logger';
import { User as UserIcon, MapPin, Info, LogOut, Edit2, Check, X, Sliders, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import PhotoUpload from '../components/PhotoUpload';

export default function Profile() {
  const { user, logout, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [editingFilters, setEditingFilters] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    age: user?.age || 18,
    bio: user?.bio || '',
    location: user?.location || '',
    photos: user?.photos || [],
  });
  const [filterData, setFilterData] = useState({
    age_min: user?.age_min || 18,
    age_max: user?.age_max || 99,
    distance_max: user?.distance_max || 50,
  });
  const [saving, setSaving] = useState(false);
  const [savingFilters, setSavingFilters] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [stats, setStats] = useState({ matches: 0, profileViews: 0, likes: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    // Update form data when user changes
    setFormData({
      name: user.name || '',
      age: user.age || 18,
      bio: user.bio || '',
      location: user.location || '',
      photos: user.photos || [],
    });

    const loadStats = async () => {
      try {
        const result = await api.getUserStats();
        setStats(result);
      } catch (error) {
        logger.error('Failed to load user stats', error as Error);
      }
    };

    loadStats();
  }, [user]);

  if (!user) return null;

  const handleSave = async () => {
    try {
      setSaving(true);
      const updatedUser = await api.updateProfile(formData);
      updateUser(updatedUser);
      setEditing(false);
    } catch (error) {
      logger.error('Failed to update profile', error as Error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name,
      age: user.age,
      bio: user.bio || '',
      location: user.location || '',
      photos: user.photos || [],
    });
    setEditing(false);
  };

  const handleSaveFilters = async () => {
    try {
      setSavingFilters(true);
      const updatedUser = await api.updateProfile(filterData);
      updateUser(updatedUser);
      setEditingFilters(false);
    } catch (error) {
      logger.error('Failed to update filters', error as Error);
      alert('Failed to update filters. Please try again.');
    } finally {
      setSavingFilters(false);
    }
  };

  const handleCancelFilters = () => {
    setFilterData({
      age_min: user.age_min || 18,
      age_max: user.age_max || 99,
      distance_max: user.distance_max || 50,
    });
    setEditingFilters(false);
  };

  const handleLogout = async () => {
    try {
      logger.info('Logout initiated');
      await logout();
      logger.info('Logout completed, navigating to login');
      
      // On native platforms, use window.location for more reliable navigation
      if (Capacitor.isNativePlatform()) {
        window.location.href = '/login';
      } else {
        // On web, use React Router
        navigate('/login', { replace: true });
      }
    } catch (error) {
      logger.error('Logout failed', error as Error);
      // Still navigate to login even if logout fails
      if (Capacitor.isNativePlatform()) {
        window.location.href = '/login';
      } else {
        navigate('/login', { replace: true });
      }
    }
  };

  const handleDeleteAccount = async () => {
    const confirmation = window.confirm(
      'Deleting your account will permanently remove your matches, messages, and profile. This action cannot be undone. Do you want to continue?'
    );

    if (!confirmation) {
      return;
    }

    try {
      setDeleting(true);
      await api.deleteAccount();
      logout();
      navigate('/register');
    } catch (error) {
      logger.error('Failed to delete account', error as Error);
      alert('Failed to delete account. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-icy-100 via-white to-icy-200 page-with-nav pb-8 px-4 relative">
      <div className="max-w-2xl mx-auto relative z-10">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-icy-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-icy-400 via-icy-500 to-icy-600 p-6 text-white relative overflow-hidden">
            <Sparkles className="absolute top-2 right-2 w-8 h-8 text-white/30 animate-sparkle" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">My Profile</h1>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                <UserIcon className="w-10 h-10" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">{user.name}</h2>
                <p className="text-white/80">{user.email}</p>
              </div>
            </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {!editing ? (
              <>
                {/* View Mode */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">The Basics</h3>
                  <InfoItem
                    icon={<UserIcon className="w-5 h-5" />}
                    label="Name"
                    value={`${user.name}, ${user.age}`}
                  />
                  
                  <InfoItem
                    icon={<UserIcon className="w-5 h-5" />}
                    label="Gender"
                    value={user.gender}
                  />

                  {user.location && (
                    <InfoItem
                      icon={<MapPin className="w-5 h-5" />}
                      label="Location"
                      value={user.location}
                    />
                  )}

                  {user.bio && (
                    <InfoItem
                      icon={<Info className="w-5 h-5" />}
                      label="About Me"
                      value={user.bio}
                    />
                  )}

                  <InfoItem
                    icon={<UserIcon className="w-5 h-5" />}
                    label="Interested In"
                    value={user.interested_in.join(', ')}
                  />

                </div>

                <button
                  onClick={() => setEditing(true)}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition"
                >
                  <Edit2 className="w-5 h-5" />
                  Edit Profile
                </button>
              </>
            ) : (
              <>
                {/* Edit Mode */}
                <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                  {/* The Basics Section */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">The Basics</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Name
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Age
                        </label>
                        <input
                          type="number"
                          value={formData.age}
                          onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
                          min="18"
                          max="100"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Location
                        </label>
                        <input
                          type="text"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          placeholder="New York, NY"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          About Me (500 characters max)
                        </label>
                        <textarea
                          value={formData.bio}
                          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                          rows={4}
                          maxLength={500}
                          placeholder="Tell us about yourself..."
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
                        />
                        <p className="text-xs text-gray-500 mt-1">{formData.bio.length}/500</p>
                      </div>

                      <PhotoUpload
                        photos={formData.photos}
                        onPhotosChange={(photos) => setFormData({ ...formData, photos })}
                      />
                    </div>
                  </div>

                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleCancel}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                  >
                    <X className="w-5 h-5" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition disabled:opacity-50"
                  >
                    <Check className="w-5 h-5" />
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <StatCard label="Matches" value={stats.matches} />
          <StatCard label="Profile Views" value={stats.profileViews} />
          <StatCard label="Likes" value={stats.likes} />
        </div>

        {/* Discovery Filters */}
        <div className="mt-6 bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                <Sliders className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-dark">Discovery Preferences</h3>
                <p className="text-xs text-gray-600">Who you want to see</p>
              </div>
            </div>
            {!editingFilters && (
              <button
                onClick={() => setEditingFilters(true)}
                className="px-3 py-1.5 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition"
              >
                Edit
              </button>
            )}
          </div>

          <div className="p-6">
            {!editingFilters ? (
              <div className="space-y-3">
                <InfoItem
                  icon={<UserIcon className="w-5 h-5" />}
                  label="Age Range"
                  value={`${user.age_min || 18} - ${user.age_max || 99} years old`}
                />
                <InfoItem
                  icon={<MapPin className="w-5 h-5" />}
                  label="Maximum Distance"
                  value={`${user.distance_max || 50} miles`}
                />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Age Range */}
                <div>
                  <label className="block text-sm font-semibold text-dark mb-3">
                    Age Range: {filterData.age_min} - {filterData.age_max}
                  </label>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Minimum Age</label>
                      <input
                        type="range"
                        min="18"
                        max="99"
                        value={filterData.age_min}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          setFilterData({ ...filterData, age_min: value });
                          if (value > filterData.age_max) {
                            setFilterData({ ...filterData, age_min: value, age_max: value });
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
                        value={filterData.age_max}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          setFilterData({ ...filterData, age_max: value });
                          if (value < filterData.age_min) {
                            setFilterData({ ...filterData, age_min: value, age_max: value });
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
                    Maximum Distance: {filterData.distance_max === 100 ? '100+' : filterData.distance_max} miles
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={filterData.distance_max}
                    onChange={(e) => setFilterData({ ...filterData, distance_max: parseInt(e.target.value) })}
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

                <div className="flex gap-3">
                  <button
                    onClick={handleCancelFilters}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                  >
                    <X className="w-5 h-5" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveFilters}
                    disabled={savingFilters}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition disabled:opacity-50"
                  >
                    <Check className="w-5 h-5" />
                    {savingFilters ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8">
          <button
            onClick={handleDeleteAccount}
            disabled={deleting}
            className="w-full px-6 py-3 border-2 border-red-500 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition disabled:opacity-50"
          >
            {deleting ? 'Deleting account...' : 'Delete Account'}
          </button>
          <p className="text-xs text-gray-500 text-center mt-2">
            Required for App Store approval: permanently removes your data.
          </p>
        </div>
      </div>
    </div>
  );
}

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function InfoItem({ icon, label, value }: InfoItemProps) {
  return (
    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
      <div className="text-primary mt-0.5">{icon}</div>
      <div className="flex-1">
        <p className="text-sm text-gray-500 mb-1">{label}</p>
        <p className="text-dark font-medium capitalize">{value}</p>
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number;
}

function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4 text-center">
      <p className="text-2xl font-bold text-primary">{value}</p>
      <p className="text-sm text-gray-600">{label}</p>
    </div>
  );
}

