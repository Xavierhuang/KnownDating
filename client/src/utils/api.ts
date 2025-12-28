import { AuthResponse, User, Match, Message, SwipeUser } from '../types';
import { firebaseApi } from './firebaseApi';

// Helper function to resolve photo URLs (now handles Firebase Storage URLs)
export const getPhotoUrl = (photoPath: string): string => {
  // If it's already a full URL (http/https), return as is
  if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
    return photoPath;
  }
  
  // If it's a data URL (base64), return as is
  if (photoPath.startsWith('data:')) {
    return photoPath;
  }
  
  // Firebase Storage URLs are already full URLs, so just return
  return photoPath;
};

// Wrapper class to maintain backward compatibility
class ApiClient {
  setToken(token: string | null) {
    // Firebase handles tokens internally, but we keep this for compatibility
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  // Auth methods
  async register(data: {
    email: string;
    password: string;
    name: string;
    age: number;
    gender: string;
    bio?: string;
    location?: string;
    interested_in?: string[];
  }): Promise<AuthResponse> {
    return firebaseApi.register(data);
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const result = await firebaseApi.login(email, password);
    // Store token for compatibility
    if (result.token) {
      this.setToken(result.token);
    }
    return result;
  }

  async getCurrentUser(): Promise<User> {
    return firebaseApi.getCurrentUser();
  }

  // Users
  async getDiscoverUsers(): Promise<SwipeUser[]> {
    return firebaseApi.getDiscoverUsers();
  }

  async getUserProfile(id: string): Promise<User> {
    return firebaseApi.getUserProfile(id);
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    return firebaseApi.updateProfile(data);
  }

  // Matches
  async swipe(swiped_id: string, direction: 'left' | 'right'): Promise<{ success: boolean; match: Match | null }> {
    return firebaseApi.swipe(swiped_id, direction);
  }

  async getMatches(): Promise<Match[]> {
    return firebaseApi.getMatches();
  }

  // Messages
  async getMessages(matchId: string): Promise<Message[]> {
    return firebaseApi.getMessages(matchId);
  }

  async sendMessage(match_id: string, content: string): Promise<Message> {
    return firebaseApi.sendMessage(match_id, content);
  }

  // Device tokens
  async registerDeviceToken(token: string): Promise<void> {
    return firebaseApi.registerDeviceToken(token);
  }

  async deleteAccount(): Promise<void> {
    return firebaseApi.deleteAccount();
  }

  async getUserStats(): Promise<{ matches: number; profileViews: number; likes: number }> {
    return firebaseApi.getUserStats();
  }

  // Photos
  async uploadPhotos(files: File[]): Promise<{ photos: string[] }> {
    return firebaseApi.uploadPhotos(files);
  }

  async deletePhoto(photoUrl: string): Promise<void> {
    return firebaseApi.deletePhoto(photoUrl);
  }

  // Moderation
  async reportUser(reported_id: string, reason: string, details?: string): Promise<{ success: boolean; message: string }> {
    return firebaseApi.reportUser(reported_id, reason, details);
  }

  async blockUser(blocked_id: string): Promise<{ success: boolean; message: string }> {
    return firebaseApi.blockUser(blocked_id);
  }

  async unblockUser(blocked_id: string): Promise<{ success: boolean; message: string }> {
    return firebaseApi.unblockUser(blocked_id);
  }

  async getBlockedUsers(): Promise<any[]> {
    return firebaseApi.getBlockedUsers();
  }
}

export const api = new ApiClient();

