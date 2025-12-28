import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { api } from '../utils/api';
import { firebaseApi } from '../utils/firebaseApi';
import { logger } from '../utils/logger';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import LocationPermissionModal from '../components/LocationPermissionModal';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  
  // Helper to store user/token in localStorage
  const storeAuthData = (userData: User, token: string) => {
    try {
      localStorage.setItem('known_user', JSON.stringify(userData));
      localStorage.setItem('known_token', token);
    } catch (error) {
      logger.error('Failed to store auth data', error as Error);
    }
  };
  
  // Helper to clear stored auth data
  const clearAuthData = () => {
    try {
      localStorage.removeItem('known_user');
      localStorage.removeItem('known_token');
    } catch (error) {
      logger.error('Failed to clear auth data', error as Error);
    }
  };
  
  // Helper to load stored auth data
  const loadStoredAuthData = (): { user: User | null; token: string | null } => {
    try {
      const storedUser = localStorage.getItem('known_user');
      const storedToken = localStorage.getItem('known_token');
      if (storedUser && storedToken) {
        return {
          user: JSON.parse(storedUser),
          token: storedToken,
        };
      }
    } catch (error) {
      logger.error('Failed to load stored auth data', error as Error);
      clearAuthData();
    }
    return { user: null, token: null };
  };

  useEffect(() => {
    // Initialize push notifications on mobile
    if (Capacitor.isNativePlatform()) {
      initPushNotifications();
      
      // Listen for push notification events
      PushNotifications.addListener('registration', (token) => {
        logger.info('Push notification token registered', { token: token.value });
        api.registerDeviceToken(token.value);
      });

      PushNotifications.addListener('registrationError', (error) => {
        logger.error('Push notification registration failed', new Error(error.error || 'Registration failed'));
      });

      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        logger.info('Push notification received', { notification });
      });

      return () => {
        PushNotifications.removeAllListeners();
      };
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    let unsubscribe: (() => void) | null = null;
    
    // First, check localStorage for stored auth data (for REST API login)
    const storedAuth = loadStoredAuthData();
    if (storedAuth.user && storedAuth.token) {
      logger.info('Found stored auth data, using it');
      if (isMounted) {
        setUser(storedAuth.user);
        api.setToken(storedAuth.token);
        setLoading(false);
      }
    }
    
    // Set a timeout to stop loading if Firebase doesn't respond (longer for iOS)
    const timeoutId = setTimeout(() => {
      if (isMounted && !storedAuth.user) {
        logger.error('Firebase auth state check timed out, setting loading to false', new Error('Auth timeout'));
        setLoading(false);
        // Set user to null so user can try to login
        setUser(null);
      }
    }, 10000); // 10 second timeout (increased for iOS)

    try {
      // Listen to Firebase auth state changes
      unsubscribe = firebaseApi.onAuthStateChanged(async (firebaseUser) => {
        if (!isMounted) return;
        
        clearTimeout(timeoutId);
        
        if (firebaseUser) {
          try {
            const userData = await firebaseApi.getCurrentUser();
            const token = await firebaseUser.getIdToken();
            if (isMounted) {
              setUser(userData);
              api.setToken(token);
              // Store in localStorage for persistence
              storeAuthData(userData, token);
            }
          } catch (error) {
            logger.error('Failed to get user data after auth state change', error as Error);
            if (isMounted) {
              setUser(null);
              api.setToken(null);
              clearAuthData();
            }
          }
        } else {
          // If we're logging out, don't restore from stored data
          if (isLoggingOut && isMounted) {
            setUser(null);
            api.setToken(null);
            return;
          }
          
          // If Firebase says no user, check if we have stored data (REST API login)
          const currentStoredAuth = loadStoredAuthData();
          if (!currentStoredAuth.user && isMounted) {
            // No stored data either, clear everything
            setUser(null);
            api.setToken(null);
            clearAuthData();
          } else if (currentStoredAuth.user && isMounted) {
            // We have stored data but Firebase doesn't see a user (REST API login)
            // Keep the stored data
            setUser(currentStoredAuth.user);
            api.setToken(currentStoredAuth.token || null);
          }
        }
        if (isMounted) {
          setLoading(false);
        }
      });
    } catch (error) {
      logger.error('Failed to set up auth state listener', error as Error);
      clearTimeout(timeoutId);
      if (isMounted) {
        setLoading(false);
      }
    }

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const initPushNotifications = async () => {
    try {
      const permission = await PushNotifications.requestPermissions();
      if (permission.receive === 'granted') {
        await PushNotifications.register();
      }
    } catch (error) {
      logger.error('Error initializing push notifications', error as Error);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { token, user: userData } = await api.login(email, password);
      api.setToken(token);
      setUser(userData);
      // Store in localStorage for persistence across page reloads
      storeAuthData(userData, token);
      
      // Redirect to compatibility questions after login
      // Use setTimeout to ensure state is updated before navigation
      setTimeout(() => {
        window.location.href = '/compatibility';
      }, 100);
    } catch (error: any) {
      logger.error('Login failed', error as Error);
      throw error; // Re-throw so the Login component can handle it
    }
  };

  const register = async (data: any) => {
    try {
      const { token, user: userData } = await api.register(data);
      api.setToken(token);
      setUser(userData);
      // Store in localStorage for persistence across page reloads
      storeAuthData(userData, token);
      
      // Redirect to compatibility questions after registration
      // Use setTimeout to ensure state is updated before navigation
      setTimeout(() => {
        window.location.href = '/compatibility';
      }, 100);
    } catch (error: any) {
      logger.error('Registration failed', error as Error);
      throw error; // Re-throw so the Register component can handle it
    }
  };

  const logout = async () => {
    logger.info('Starting logout process');
    
    // Set flag to prevent onAuthStateChanged from restoring user
    setIsLoggingOut(true);
    
    // Clear auth data FIRST before signing out, so onAuthStateChanged doesn't restore it
    logger.info('Clearing auth data');
    clearAuthData();
    setUser(null);
    api.setToken(null);
    
    // Then sign out from Firebase
    try {
      logger.info('Signing out from Firebase');
      await firebaseApi.logout();
      logger.info('Firebase sign out successful');
    } catch (error) {
      // Even if Firebase logout fails, we've already cleared local state
      logger.error('Firebase logout failed, but local state cleared', error as Error);
    } finally {
      logger.info('Logout process completed');
      // Reset flag after a short delay to allow navigation to complete
      setTimeout(() => {
        setIsLoggingOut(false);
      }, 2000);
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const handleLocationComplete = async (location?: string) => {
    setShowLocationModal(false);
    if (location && user) {
      try {
        const updatedUser = await api.updateProfile({ location });
        setUser(updatedUser);
      } catch (error) {
        logger.error('Failed to update user location', error as Error);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
      {showLocationModal && (
        <LocationPermissionModal
          onComplete={handleLocationComplete}
          onSkip={() => setShowLocationModal(false)}
        />
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

