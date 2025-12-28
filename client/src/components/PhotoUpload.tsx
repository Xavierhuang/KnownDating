import { useState } from 'react';
import { Camera, Plus, X } from 'lucide-react';
import { Camera as CapacitorCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { api, getPhotoUrl } from '../utils/api';
import { logger } from '../utils/logger';

interface PhotoUploadProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  maxPhotos?: number;
}

export default function PhotoUpload({ photos, onPhotosChange, maxPhotos = 6 }: PhotoUploadProps) {
  const [loading, setLoading] = useState(false);

  const convertUriToFile = async (image: any): Promise<File> => {
    // Fallback: try fetching webPath (works on web and sometimes on mobile)
    if (image.webPath) {
      try {
        const response = await fetch(image.webPath);
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.status}`);
        }
        const blob = await response.blob();
        const filename = image.webPath.split('/').pop() || 'photo.jpg';
        return new File([blob], filename, { type: blob.type || 'image/jpeg' });
      } catch (error) {
        logger.error('Failed to fetch image from webPath', error as Error);
        throw error;
      }
    }
    
    throw new Error('No valid image path found');
  };

  const handleAddPhoto = async () => {
    try {
      setLoading(true);
      logger.info('Starting photo upload process');

      if (Capacitor.isNativePlatform()) {
        // Use native camera on mobile
        // Use Base64 for more reliable file handling on iOS
        const image = await CapacitorCamera.getPhoto({
          quality: 90,
          allowEditing: true,
          resultType: CameraResultType.Base64,
          source: CameraSource.Prompt, // Let user choose camera or gallery
        });

        // Handle base64 string from camera
        const base64String = image.base64String || image.dataUrl?.split(',')[1];
        
        if (base64String) {
          try {
            // Convert base64 to File
            const byteCharacters = atob(base64String);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const imageType = image.format === 'png' ? 'image/png' : 'image/jpeg';
            const blob = new Blob([byteArray], { type: imageType });
            const fileExtension = image.format || 'jpg';
            const file = new File([blob], `photo.${fileExtension}`, { type: imageType });
            
            logger.info('Photo converted to File, uploading...', { fileSize: file.size, fileType: file.type });
            const result = await api.uploadPhotos([file]);
            // If this is the first photo, it becomes the profile picture (index 0)
            // Otherwise, add to the end
            const newPhotos = photos.length === 0 
              ? [...result.photos] 
              : [...photos, ...result.photos];
            onPhotosChange(newPhotos);
          } catch (error) {
            logger.error('Failed to convert base64 to File', error as Error, { hasBase64: !!base64String });
            throw new Error('Failed to process photo. Please try again.');
          }
        } else if (image.webPath) {
          // Fallback: try using webPath if base64 is not available
          logger.warn('base64String not found, trying webPath fallback');
          try {
            const file = await convertUriToFile(image);
            const result = await api.uploadPhotos([file]);
            // If this is the first photo, it becomes the profile picture (index 0)
            const newPhotos = photos.length === 0 
              ? [...result.photos] 
              : [...photos, ...result.photos];
            onPhotosChange(newPhotos);
          } catch (error) {
            logger.error('Failed to use webPath fallback', error as Error);
            throw new Error('Failed to process photo. Please try again.');
          }
        } else {
          logger.error('No image data found', new Error('No base64String or webPath in image response'));
          throw new Error('No image data received from camera.');
        }
      } else {
        // Use file input on web - allow multiple files
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.multiple = true;
        input.onchange = async (e) => {
          const files = Array.from((e.target as HTMLInputElement).files || []);
          if (files.length > 0) {
            // Limit to remaining slots
            const remainingSlots = maxPhotos - photos.length;
            const filesToUpload = files.slice(0, remainingSlots);
            
            try {
              const result = await api.uploadPhotos(filesToUpload);
              // If this is the first photo(s), they become the profile picture(s) (starting at index 0)
              const newPhotos = photos.length === 0 
                ? [...result.photos] 
                : [...photos, ...result.photos];
              onPhotosChange(newPhotos);
            } catch (error) {
              logger.error('Failed to upload photos', error as Error);
              alert('Failed to upload photos. Please try again.');
            }
          }
        };
        input.click();
      }
    } catch (error) {
      logger.error('Failed to add photo', error as Error);
      alert('Failed to add photo. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePhoto = async (index: number) => {
    const photoToRemove = photos[index];
    
    // If it's a server URL, try to delete it from server
    if (photoToRemove.startsWith('/uploads/')) {
      const filename = photoToRemove.split('/').pop();
      if (filename) {
        try {
          await api.deletePhoto(filename);
        } catch (error) {
          logger.error('Failed to delete photo from server', error as Error, { photoUrl: photoToRemove });
          // Continue with local removal even if server delete fails
        }
      }
    }
    
    onPhotosChange(photos.filter((_, i) => i !== index));
  };

  const handleSetAsProfile = (index: number) => {
    if (index === 0) return; // Already the profile picture
    
    // Move the selected photo to index 0 (profile picture position)
    const newPhotos = [...photos];
    const [selectedPhoto] = newPhotos.splice(index, 1);
    newPhotos.unshift(selectedPhoto);
    onPhotosChange(newPhotos);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Photos ({photos.length}/{maxPhotos})
      </label>
      
      <div className="grid grid-cols-3 gap-3">
        {photos.map((photo, index) => (
          <div 
            key={index} 
            className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group cursor-pointer"
            onClick={() => handleSetAsProfile(index)}
            title={index === 0 ? "Profile picture" : "Click to set as profile picture"}
          >
            <img
              src={getPhotoUrl(photo)}
              alt={`Photo ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemovePhoto(index);
              }}
              className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition z-10"
            >
              <X className="w-4 h-4" />
            </button>
            {index === 0 && (
              <div className="absolute top-1 left-1 bg-primary text-white text-xs px-2 py-0.5 rounded font-semibold">
                Profile
              </div>
            )}
            <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-2 py-0.5 rounded">
              {index + 1}
            </div>
          </div>
        ))}
        
        {photos.length < maxPhotos && (
          <button
            onClick={handleAddPhoto}
            disabled={loading}
            className="aspect-square bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/5 transition disabled:opacity-50"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            ) : (
              <>
                <Camera className="w-8 h-8 text-gray-400" />
                <Plus className="w-5 h-5 text-gray-400" />
              </>
            )}
          </button>
        )}
      </div>
      
      <p className="text-xs text-gray-500 mt-2">
        Tap to add up to {maxPhotos} photos. The first photo is your profile picture. Click any photo to set it as your profile picture.
      </p>
    </div>
  );
}

