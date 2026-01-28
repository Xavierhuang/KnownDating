import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
} from 'firebase/auth';
import { Capacitor } from '@capacitor/core';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  serverTimestamp,
  onSnapshot,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
import {
  ref,
  deleteObject,
} from 'firebase/storage';
import { auth, db, storage } from '../config/firebase';
import { User, Match, Message, SwipeUser, AuthResponse } from '../types';
import { logger } from './logger';

// Helper to convert Firestore timestamp to string
const timestampToString = (timestamp: any): string => {
  if (!timestamp) return new Date().toISOString();
  if (timestamp.toDate) {
    return timestamp.toDate().toISOString();
  }
  if (timestamp instanceof Date) {
    return timestamp.toISOString();
  }
  // Handle Firestore REST API timestamp format (RFC3339 string)
  if (typeof timestamp === 'string' && timestamp.includes('T') && timestamp.includes('Z')) {
    return timestamp; // Already in ISO format
  }
  return timestamp;
};

// Helper to convert User document to User type
const docToUser = (docData: any, id: string): User => {
  return {
    id: id,
    email: docData.email || '',
    name: docData.name || '',
    age: docData.age || 0,
    gender: docData.gender || '',
    bio: docData.bio || null,
    location: docData.location || null,
    photos: docData.photos || [],
    interested_in: docData.interested_in || [],
    age_min: docData.age_min,
    age_max: docData.age_max,
    distance_max: docData.distance_max,
    founder_status: docData.founder_status || null,
    industry: docData.industry || null,
    funding_status: docData.funding_status || null,
    company_name: docData.company_name || null,
    company_stage: docData.company_stage || null,
    role: docData.role || null,
    founding_story: docData.founding_story || null,
    biggest_challenge: docData.biggest_challenge || null,
    work_life_balance: docData.work_life_balance || null,
    ideal_date_night: docData.ideal_date_night || null,
    view_on_exit: docData.view_on_exit || null,
    date_people_who_talk_work: docData.date_people_who_talk_work || null,
    how_destress: docData.how_destress || null,
    coffee_order: docData.coffee_order || null,
    hustle_quote: docData.hustle_quote || null,
    created_at: timestampToString(docData.created_at) || new Date().toISOString(),
    updated_at: timestampToString(docData.updated_at),
  };
};

class FirebaseApiClient {
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
    try {
      // Create Firebase auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      // Update display name
      await updateProfile(userCredential.user, {
        displayName: data.name,
      });

      // Create user document in Firestore
      const userData = {
        email: data.email,
        name: data.name,
        age: data.age,
        gender: data.gender,
        bio: data.bio || null,
        location: data.location || null,
        photos: [],
        interested_in: data.interested_in || [],
        age_min: 18,
        age_max: 100,
        distance_max: 50,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), userData);

      // Get the created user
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      const user = docToUser(userDoc.data(), userCredential.user.uid);

      return {
        token: await userCredential.user.getIdToken(),
        user,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to register');
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      // Check if Firebase auth is initialized
      if (!auth) {
        throw new Error('Firebase Authentication is not initialized. Please check your Firebase configuration.');
      }

      // Detect if running on iOS (Capacitor)
      const isIOS = Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';
      
      // Use longer timeout for iOS (simulator can be very slow, physical device can also be slow)
      const timeoutMs = isIOS ? 60000 : 20000; // 60 seconds for iOS, 20 for web

      console.log('🔐 Attempting login with email:', email);
      console.log('🔐 Platform:', isIOS ? 'iOS' : 'Web');
      console.log('🔐 Timeout:', timeoutMs, 'ms');
      console.log('🔐 Auth object:', { 
        app: auth.app?.name, 
        currentUser: auth.currentUser?.uid || 'none',
        authDomain: auth.app?.options?.authDomain,
        apiKey: auth.app?.options?.apiKey ? '***' + auth.app.options.apiKey.slice(-4) : 'missing'
      });

      // iOS workaround: Use REST API directly if SDK call hangs
      if (isIOS) {
        console.log('🔐 iOS detected - trying REST API workaround...');
        try {
          const apiKey = auth.app?.options?.apiKey;
          if (!apiKey) {
            throw new Error('Firebase API key not found');
          }

          console.log('🔐 Calling Firebase REST API directly...');
          const restResponse = await fetch(
            `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: email,
                password: password,
                returnSecureToken: true,
              }),
            }
          );

          console.log('🔐 REST API response status:', restResponse.status);
          
          if (!restResponse.ok) {
            const errorData = await restResponse.json();
            console.error('🔐 REST API error:', errorData);
            
            if (errorData.error) {
              const errorCode = errorData.error.message;
              if (errorCode.includes('EMAIL_NOT_FOUND')) {
                throw new Error('No account found with this email. Please sign up first.');
              } else if (errorCode.includes('INVALID_PASSWORD')) {
                throw new Error('Incorrect password. Please try again.');
              } else if (errorCode.includes('USER_DISABLED')) {
                throw new Error('This account has been disabled.');
              } else {
                throw new Error(errorData.error.message || 'Authentication failed');
              }
            }
            throw new Error('Authentication failed');
          }

          const restData = await restResponse.json(); // Get the response data
          console.log('🔐 REST API success! Got idToken and localId from response');
          
          // Extract the token and user ID from REST API response
          const idToken = restData.idToken;
          const localId = restData.localId; // This is the Firebase UID
          
          if (!idToken || !localId) {
            throw new Error('Invalid response from Firebase REST API');
          }
          
          console.log('🔐 Using REST API response directly (bypassing SDK)...');
          console.log('🔐 User UID:', localId);
          
          // Get user profile from Firestore using REST API with idToken
          // This works because Firestore REST API accepts idToken in Authorization header
          console.log('🔐 Fetching user profile from Firestore via REST API...');
          const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || 'known-dating-e5f04';
          const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${localId}`;
          
          const firestorePromise = fetch(firestoreUrl, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${idToken}`,
              'Content-Type': 'application/json',
            },
          });
          
          const firestoreTimeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Firestore user profile fetch timed out')), 15000)
          );
          
          let userData: any;
          try {
            const firestoreResponse = await Promise.race([firestorePromise, firestoreTimeout]) as Response;
            
            if (!firestoreResponse.ok) {
              if (firestoreResponse.status === 404) {
                throw new Error('User profile not found. Please contact support.');
              } else if (firestoreResponse.status === 403) {
                throw new Error('Permission denied. Please check Firestore security rules.');
              } else {
                const errorText = await firestoreResponse.text();
                throw new Error(`Firestore error: ${firestoreResponse.status} - ${errorText}`);
              }
            }
            
            const firestoreData = await firestoreResponse.json();
            console.log('🔐 Got user profile from Firestore REST API');
            
            // Convert Firestore REST API format to our user format
            if (!firestoreData.fields) {
              throw new Error('User profile not found. Please contact support.');
            }
            
            // Convert Firestore REST API fields format to regular object
            userData = {};
            for (const [key, value] of Object.entries(firestoreData.fields)) {
              const fieldValue = value as any;
              if (fieldValue.stringValue !== undefined) {
                userData[key] = fieldValue.stringValue;
              } else if (fieldValue.integerValue !== undefined) {
                userData[key] = parseInt(fieldValue.integerValue);
              } else if (fieldValue.doubleValue !== undefined) {
                userData[key] = parseFloat(fieldValue.doubleValue);
              } else if (fieldValue.booleanValue !== undefined) {
                userData[key] = fieldValue.booleanValue;
              } else if (fieldValue.arrayValue !== undefined) {
                userData[key] = fieldValue.arrayValue.values?.map((v: any) => 
                  v.stringValue !== undefined ? v.stringValue :
                  v.integerValue !== undefined ? parseInt(v.integerValue) :
                  v.doubleValue !== undefined ? parseFloat(v.doubleValue) :
                  v.booleanValue !== undefined ? v.booleanValue :
                  v.nullValue !== undefined ? null : null
                ) || [];
              } else if (fieldValue.timestampValue !== undefined) {
                // Firestore REST API returns timestamps in RFC3339 format
                // Keep as string, timestampToString will handle it
                userData[key] = fieldValue.timestampValue;
              } else if (fieldValue.nullValue !== undefined) {
                userData[key] = null;
              }
            }
          } catch (firestoreError: any) {
            console.error('🔐 Firestore REST API fetch failed:', firestoreError.message);
            // If Firestore times out or fails, create a minimal user object from the REST API response
            // The user can still use the app with limited functionality
            console.log('🔐 Creating minimal user object from REST API response...');
            const minimalUser = {
              id: localId,
              email: email,
              name: email.split('@')[0], // Use email prefix as name
              age: 0,
              gender: '',
              bio: null,
              location: null,
              photos: [],
              interested_in: [],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            
            console.log('🔐 Authentication successful via REST API (minimal profile)!');
            return {
              token: idToken,
              user: minimalUser,
            };
          }
          
          const user = docToUser(userData, localId);
          
          // Note: auth.currentUser won't be set with this approach, but we have the token
          // The app should work with the token and user data
          // For iOS, we'll need to handle auth state differently
          console.log('🔐 Authentication successful via REST API!');
          console.log('🔐 Note: auth.currentUser may not be set, but token is valid');
          
          return {
            token: idToken,
            user,
          };
        } catch (restError: any) {
          console.error('🔐 REST API workaround failed:', restError);
          console.error('🔐 REST API error details:', {
            message: restError.message,
            code: restError.code,
            stack: restError.stack
          });
          // If it's an auth error (wrong password, user not found), throw it
          if (restError.message && (
            restError.message.includes('No account found') ||
            restError.message.includes('Incorrect password') ||
            restError.message.includes('disabled')
          )) {
            throw restError; // Re-throw auth errors
          }
          // For other errors, fall through to try SDK method
          console.log('🔐 Falling back to SDK method...');
        }
      }

      // Wrap the login promise to catch any immediate errors
      console.log('🔐 Creating signInWithEmailAndPassword promise...');
      const loginPromise = signInWithEmailAndPassword(auth, email, password);
      console.log('🔐 Promise created, waiting for response...');
      
      // Add promise handlers to catch any errors immediately
      loginPromise.catch((err) => {
        console.error('🔐 Login promise rejected immediately:', err);
      });
      
      // Add a progress check every 5 seconds for iOS
      let progressInterval: NodeJS.Timeout | null = null;
      if (isIOS) {
        let elapsed = 0;
        progressInterval = setInterval(() => {
          elapsed += 5000;
          console.log(`🔐 Still waiting... ${elapsed}ms elapsed`);
        }, 5000);
      }
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => {
          if (progressInterval) clearInterval(progressInterval);
          console.error('⏱️ Login timeout after', timeoutMs, 'ms');
          console.error('🔐 This usually means Firebase Auth request never completed');
          reject(new Error(isIOS 
            ? 'Login timed out on iOS device. Possible causes:\n1. Network connectivity issue\n2. Firebase Auth API not reachable from iOS\n3. Check if device has internet (try Safari)\n4. Try restarting the app'
            : 'Login timed out. Please check:\n1. Firebase Authentication → Email/Password is ENABLED\n2. Your internet connection'));
        }, timeoutMs)
      );
      
      const userCredential = await Promise.race([loginPromise, timeoutPromise]) as any;
      if (progressInterval) clearInterval(progressInterval);
      
      console.log('🔐 Login promise resolved!');
      
      // Check if we got a valid credential
      if (!userCredential || !userCredential.user) {
        throw new Error('Invalid response from Firebase Authentication');
      }

      console.log('🔐 User credential received, fetching user profile...');
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      
      if (!userDoc.exists()) {
        throw new Error('User profile not found. Please contact support.');
      }

      const user = docToUser(userDoc.data(), userCredential.user.uid);

      return {
        token: await userCredential.user.getIdToken(),
        user,
      };
    } catch (error: any) {
      console.error('🔐 Login error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      
      // Provide more helpful error messages
      let errorMessage = 'Invalid credentials';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email. Please sign up first.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed login attempts. Please try again later.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address. Please check and try again.';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Email/Password authentication is not enabled. Please enable it in Firebase Console.';
      } else if (error.message && error.message.includes('timed out')) {
        // Keep timeout message as-is
        errorMessage = error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      throw new Error(errorMessage);
    }
  }

  async getCurrentUser(): Promise<User> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Not authenticated');
    }

    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
    if (!userDoc.exists()) {
      throw new Error('User profile not found');
    }

    return docToUser(userDoc.data(), currentUser.uid);
  }

  async logout(): Promise<void> {
    await signOut(auth);
  }

  // User methods
  async getDiscoverUsers(limitCount: number = 20): Promise<SwipeUser[]> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Not authenticated');
    }

    const currentUserDoc = await getDoc(doc(db, 'users', currentUser.uid));
    const currentUserData = currentUserDoc.data();
    if (!currentUserData) {
      throw new Error('User not found');
    }

    // Get current user's compatibility answers (cache this)
    const currentUserCompatibility = await getDoc(doc(db, 'compatibility', currentUser.uid));
    const currentUserAnswers = currentUserCompatibility.exists() 
      ? (currentUserCompatibility.data()?.answers || [])
      : [];

    // Get already swiped users (optimized query)
    const swipesRef = collection(db, 'swipes');
    const swipesQuery = query(swipesRef, where('swiper_id', '==', currentUser.uid));
    const swipesSnapshot = await getDocs(swipesQuery);
    const swipedIds = new Set<string>();
    swipesSnapshot.forEach((doc) => {
      swipedIds.add(doc.data().swiped_id);
    });

    // Get blocked users
    const blocksRef = collection(db, 'blocks');
    const blocksQuery = query(blocksRef, where('blocker_id', '==', currentUser.uid));
    const blocksSnapshot = await getDocs(blocksQuery);
    const blockedIds = new Set<string>();
    blocksSnapshot.forEach((doc) => {
      blockedIds.add(doc.data().blocked_id);
    });

    // Import compatibility matching
    const { calculateMatchCompatibility } = await import('./compatibilityMatching');

    // Build query with gender preference filter (more efficient than loading all users)
    const usersRef = collection(db, 'users');
    const interestedIn = currentUserData.interested_in || [];
    
    // Firestore doesn't support IN queries easily, so we'll query by each gender
    // and combine results, limiting to reduce reads
    const userQueries = interestedIn.map((gender: string) => 
      query(usersRef, where('gender', '==', gender), limit(50))
    );

    // Execute queries in parallel
    const querySnapshots = await Promise.all(
      userQueries.map((q: any) => getDocs(q))
    );

    // Collect all potential matches
    const potentialUsers = new Map<string, any>();
    querySnapshots.forEach((snapshot: any) => {
      snapshot.forEach((doc: any) => {
        const data = doc.data();
        // Check if user is interested in current user's gender
        if (data.interested_in?.includes(currentUserData.gender)) {
          potentialUsers.set(doc.id, { id: doc.id, data });
        }
      });
    });

    // Filter out current user, swiped users, and blocked users
    const filteredUsers: Array<{ id: string; data: any }> = [];
    potentialUsers.forEach((user, uid) => {
      if (uid === currentUser.uid) return;
      if (swipedIds.has(uid)) return;
      if (blockedIds.has(uid)) return;
      filteredUsers.push(user);
    });

    // Batch fetch compatibility profiles (more efficient)
    const compatibilityPromises = filteredUsers.map(user => 
      getDoc(doc(db, 'compatibility', user.id)).catch(() => null)
    );
    const compatibilityDocs = await Promise.all(compatibilityPromises);

    // Calculate compatibility scores
    const usersWithScores: Array<{ user: SwipeUser; compatibilityScore: number }> = [];
    
    for (let i = 0; i < filteredUsers.length; i++) {
      const { id: uid, data: userData } = filteredUsers[i];
      const compatibilityDoc = compatibilityDocs[i];
      
      try {
        const otherUserAnswers = compatibilityDoc?.exists()
          ? (compatibilityDoc.data()?.answers || [])
          : [];

        // Calculate compatibility score
        const compatibilityScore = currentUserAnswers.length > 0 && otherUserAnswers.length > 0
          ? calculateMatchCompatibility(currentUserAnswers, otherUserAnswers).overall
          : 50; // Default score if no compatibility data

        usersWithScores.push({
          user: {
            id: uid,
            name: userData.name || '',
            age: userData.age || 0,
            gender: userData.gender || '',
            bio: userData.bio || null,
            location: userData.location || null,
            photos: userData.photos || [],
            distance: null, // TODO: Calculate distance
            founder_status: userData.founder_status || null,
            industry: userData.industry || null,
            funding_status: userData.funding_status || null,
            company_name: userData.company_name || null,
            company_stage: userData.company_stage || null,
            role: userData.role || null,
            founding_story: userData.founding_story || null,
            biggest_challenge: userData.biggest_challenge || null,
            work_life_balance: userData.work_life_balance || null,
            ideal_date_night: userData.ideal_date_night || null,
            view_on_exit: userData.view_on_exit || null,
            date_people_who_talk_work: userData.date_people_who_talk_work || null,
            how_destress: userData.how_destress || null,
            coffee_order: userData.coffee_order || null,
            hustle_quote: userData.hustle_quote || null,
          },
          compatibilityScore,
        });
        } catch (error) {
          // Log error but continue processing other users
          logger.error(`Error calculating compatibility for user ${uid}`, error as Error, { userId: uid });
          continue;
        }
    }

    // Sort by compatibility score (highest first)
    usersWithScores.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    // Return limited results
    return usersWithScores.slice(0, limitCount).map(item => item.user);
  }

  async getUserProfile(id: string): Promise<User> {
    const userDoc = await getDoc(doc(db, 'users', id));
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }
    
    return docToUser(userDoc.data(), id);
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    // Get user ID and token from localStorage (works for both SDK and REST API login)
    const storedUser = localStorage.getItem('known_user');
    const token = localStorage.getItem('known_token');
    
    if (!storedUser || !token) {
      // Fallback to auth.currentUser for SDK login
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Not authenticated');
      }
      
      const userRef = doc(db, 'users', currentUser.uid);
      const updateData: any = {
        ...data,
        updated_at: serverTimestamp(),
      };
      delete updateData.id; // Don't update ID
      delete updateData.created_at; // Don't update created_at

      await updateDoc(userRef, updateData);

      const updatedDoc = await getDoc(userRef);
      return docToUser(updatedDoc.data(), currentUser.uid);
    }
    
    // Use Firestore REST API with token (for REST API login)
    const userData = JSON.parse(storedUser);
    const userId = userData.id;
    
    if (!userId) {
      throw new Error('User ID not found');
    }

    const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || 'known-dating-e5f04';
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${userId}`;
    
    // Convert update data to Firestore REST API format
    const updateData: any = { ...data };
    delete updateData.id; // Don't update ID
    delete updateData.created_at; // Don't update created_at
    
    const fields: any = {};
    for (const [key, value] of Object.entries(updateData)) {
      if (value === undefined || value === null) continue;
      
      if (typeof value === 'string') {
        fields[key] = { stringValue: value };
      } else if (typeof value === 'number') {
        if (Number.isInteger(value)) {
          fields[key] = { integerValue: value.toString() };
        } else {
          fields[key] = { doubleValue: value.toString() };
        }
      } else if (typeof value === 'boolean') {
        fields[key] = { booleanValue: value };
      } else if (Array.isArray(value)) {
        fields[key] = {
          arrayValue: {
            values: value.map(v => {
              if (typeof v === 'string') return { stringValue: v };
              if (typeof v === 'number') return { integerValue: v.toString() };
              if (typeof v === 'boolean') return { booleanValue: v };
              return { nullValue: null };
            })
          }
        };
      }
    }
    
    // Add updated_at timestamp
    fields.updated_at = { timestampValue: new Date().toISOString() };
    
    const documentData = {
      fields,
    };

    const response = await fetch(firestoreUrl, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(documentData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update profile: ${response.status} - ${errorText}`);
    }

    // Fetch updated document
    const getResponse = await fetch(firestoreUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!getResponse.ok) {
      throw new Error(`Failed to fetch updated profile: ${getResponse.status}`);
    }

    const firestoreData = await getResponse.json();
    
    // Convert Firestore REST API format to regular object
    const updatedData: any = {};
    if (firestoreData.fields) {
      for (const [key, value] of Object.entries(firestoreData.fields)) {
        const fieldValue = value as any;
        if (fieldValue.stringValue !== undefined) {
          updatedData[key] = fieldValue.stringValue;
        } else if (fieldValue.integerValue !== undefined) {
          updatedData[key] = parseInt(fieldValue.integerValue);
        } else if (fieldValue.doubleValue !== undefined) {
          updatedData[key] = parseFloat(fieldValue.doubleValue);
        } else if (fieldValue.booleanValue !== undefined) {
          updatedData[key] = fieldValue.booleanValue;
        } else if (fieldValue.arrayValue !== undefined) {
          updatedData[key] = fieldValue.arrayValue.values?.map((v: any) => 
            v.stringValue || v.integerValue || v.doubleValue || v.booleanValue || null
          ) || [];
        } else if (fieldValue.timestampValue !== undefined) {
          updatedData[key] = fieldValue.timestampValue;
        } else if (fieldValue.nullValue !== undefined) {
          updatedData[key] = null;
        }
      }
    }
    
    return docToUser(updatedData, userId);
  }

  // Match methods
  async swipe(swiped_id: string, direction: 'left' | 'right'): Promise<{ success: boolean; match: Match | null }> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Not authenticated');
    }

    const swipedUserUid = swiped_id;
    
    // Record the swipe
    const swipesRef = collection(db, 'swipes');
    await addDoc(swipesRef, {
      swiper_id: currentUser.uid,
      swiped_id: swipedUserUid,
      direction,
      created_at: serverTimestamp(),
    });

    if (direction === 'right') {
      // Check if the other user also swiped right
      const matchQuery = query(
        swipesRef,
        where('swiper_id', '==', swipedUserUid),
        where('swiped_id', '==', currentUser.uid),
        where('direction', '==', 'right')
      );

      const matchSnapshot = await getDocs(matchQuery);
      
      if (!matchSnapshot.empty) {
        // It's a match!
        const matchesRef = collection(db, 'matches');
        const matchDocRef = await addDoc(matchesRef, {
          user1_id: currentUser.uid,
          user2_id: swipedUserUid,
          created_at: serverTimestamp(),
        });

        // Get the matched user's data
        const matchedUserDoc = await getDoc(doc(db, 'users', swipedUserUid));
        const matchedUserData = matchedUserDoc.data();

        const match: Match = {
          id: matchDocRef.id,
          user1_id: currentUser.uid,
          user2_id: swiped_id,
          user_id: swiped_id,
          name: matchedUserData?.name || '',
          age: matchedUserData?.age || 0,
          photos: matchedUserData?.photos || [],
          created_at: new Date().toISOString(),
        };

        return { success: true, match };
      }
    }

    return { success: true, match: null };
  }

  async getMatches(): Promise<Match[]> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Not authenticated');
    }

    const matchesRef = collection(db, 'matches');
    const q = query(
      matchesRef,
      where('user1_id', '==', currentUser.uid)
    );
    const q2 = query(
      matchesRef,
      where('user2_id', '==', currentUser.uid)
    );

    const [snapshot1, snapshot2] = await Promise.all([
      getDocs(q),
      getDocs(q2),
    ]);

    const matches: Match[] = [];

    const processMatch = async (matchDoc: any) => {
      const data = matchDoc.data();
      const otherUserId = data.user1_id === currentUser.uid ? data.user2_id : data.user1_id;
      const otherUserDoc = await getDoc(doc(db, 'users', otherUserId));
      const otherUserData = otherUserDoc.data();

      if (otherUserData) {
        // Get last message
        const messagesRef = collection(db, 'messages');
        const messagesQuery = query(
          messagesRef,
          where('match_id', '==', matchDoc.id),
          orderBy('created_at', 'desc'),
          limit(1)
        );
        const messagesSnapshot = await getDocs(messagesQuery);
        let lastMessage: string | undefined;
        let lastMessageTime: string | undefined;

        if (!messagesSnapshot.empty) {
          const lastMsg = messagesSnapshot.docs[0].data();
          lastMessage = lastMsg.content;
          lastMessageTime = timestampToString(lastMsg.created_at);
        }

        matches.push({
          id: matchDoc.id,
          user1_id: data.user1_id,
          user2_id: data.user2_id,
          user_id: otherUserId,
          name: otherUserData.name || '',
          age: otherUserData.age || 0,
          photos: otherUserData.photos || [],
          created_at: timestampToString(data.created_at),
          last_message: lastMessage,
          last_message_time: lastMessageTime,
        });
      }
    };

    await Promise.all([
      ...snapshot1.docs.map(processMatch),
      ...snapshot2.docs.map(processMatch),
    ]);

    return matches;
  }

  // Message methods
  async getMessages(matchId: string): Promise<Message[]> {
    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('match_id', '==', matchId),
      orderBy('created_at', 'asc')
    );

    const snapshot = await getDocs(q);
    const messages: Message[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      messages.push({
        id: doc.id,
        sender_id: data.sender_id,
        sender_name: data.sender_name || '',
        content: data.content || '',
        created_at: timestampToString(data.created_at),
        read: data.read || false,
      });
    });

    return messages;
  }

  async sendMessage(match_id: string, content: string): Promise<Message> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Not authenticated');
    }

    // Get current user data for sender_name
    const currentUserDoc = await getDoc(doc(db, 'users', currentUser.uid));
    const currentUserData = currentUserDoc.data();

    const messagesRef = collection(db, 'messages');
    const messageDoc = await addDoc(messagesRef, {
      match_id: match_id,
      sender_id: currentUser.uid,
      sender_name: currentUserData?.name || '',
      content,
      read: false,
      created_at: serverTimestamp(),
    });

    return {
      id: messageDoc.id,
      sender_id: currentUser.uid,
      sender_name: currentUserData?.name || '',
      content,
      created_at: new Date().toISOString(),
      read: false,
    };
  }

  // Real-time message listener
  subscribeToMessages(
    matchId: string,
    callback: (messages: Message[]) => void
  ): () => void {
    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('match_id', '==', matchId),
      orderBy('created_at', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages: Message[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        messages.push({
          id: doc.id,
          sender_id: data.sender_id,
          sender_name: data.sender_name || '',
          content: data.content || '',
          created_at: timestampToString(data.created_at),
          read: data.read || false,
        });
      });
      callback(messages);
    });

    return unsubscribe;
  }

  // Photo upload
  async uploadPhotos(files: File[]): Promise<{ photos: string[] }> {
    // Get user ID and token from localStorage (works for both SDK and REST API login)
    const storedUser = localStorage.getItem('known_user');
    const token = localStorage.getItem('known_token');
    
    let userId: string;
    
    if (storedUser && token) {
      // Use stored user ID (for REST API login)
      const userData = JSON.parse(storedUser);
      userId = userData.id;
    } else {
      // Fallback to auth.currentUser for SDK login
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Not authenticated');
      }
      userId = currentUser.uid;
    }
    
    if (!userId) {
      throw new Error('User ID not found');
    }

    // Use Firebase Storage REST API with token
    const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'known-dating-e5f04.firebasestorage.app';
    
    // Get auth token
    let authToken = token;
    if (!authToken && auth.currentUser) {
      authToken = await auth.currentUser.getIdToken();
    }
    if (!authToken) {
      throw new Error('No authentication token available');
    }
    
    const uploadPromises = files.map(async (file) => {
      try {
        const fileName = `users/${userId}/photos/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
        const storageUrl = `https://firebasestorage.googleapis.com/v0/b/${storageBucket}/o`;
        
        logger.info('Uploading photo to Firebase Storage', { fileName, fileSize: file.size, fileType: file.type });
        
        // Upload file using Firebase Storage REST API
        // Format: POST /v0/b/{bucket}/o?name={path}&uploadType=media
        const uploadUrl = `${storageUrl}?name=${encodeURIComponent(fileName)}&uploadType=media`;
        
        const uploadResponse = await fetch(uploadUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': file.type || 'image/jpeg',
          },
          body: file,
        });

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          logger.error('Firebase Storage upload failed', new Error(`Status: ${uploadResponse.status}, Error: ${errorText}`));
          throw new Error(`Failed to upload photo: ${uploadResponse.status} - ${errorText}`);
        }

        const uploadData = await uploadResponse.json();
        logger.info('Photo uploaded successfully', { uploadData });
        
        // Get download URL from response
        // The response should contain downloadTokens or we construct the URL
        let downloadUrl: string;
        if (uploadData.downloadTokens) {
          downloadUrl = `https://firebasestorage.googleapis.com/v0/b/${storageBucket}/o/${encodeURIComponent(fileName)}?alt=media&token=${uploadData.downloadTokens}`;
        } else if (uploadData.mediaLink) {
          downloadUrl = uploadData.mediaLink;
        } else if (uploadData.selfLink) {
          // Convert selfLink to download URL
          const selfLinkParts = uploadData.selfLink.split('/');
          const objectName = selfLinkParts[selfLinkParts.length - 1];
          downloadUrl = `https://firebasestorage.googleapis.com/v0/b/${storageBucket}/o/${objectName}?alt=media`;
        } else {
          // Fallback: construct URL from fileName
          downloadUrl = `https://firebasestorage.googleapis.com/v0/b/${storageBucket}/o/${encodeURIComponent(fileName)}?alt=media`;
        }
        
        logger.info('Photo download URL generated', { downloadUrl });
        return downloadUrl;
      } catch (error: any) {
        logger.error('Error uploading photo', error as Error, { fileName: file.name });
        throw error;
      }
    });

    const urls = await Promise.all(uploadPromises);
    return { photos: urls };
  }

  async deletePhoto(photoUrl: string): Promise<void> {
    try {
      const photoRef = ref(storage, photoUrl);
      await deleteObject(photoRef);
    } catch (error) {
      logger.error('Error deleting photo', error as Error, { photoUrl });
      // Photo might not exist, continue anyway
    }
  }

  // Device tokens (for push notifications)
  async registerDeviceToken(token: string): Promise<void> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Not authenticated');
    }

    const tokensRef = doc(db, 'users', currentUser.uid, 'tokens', token);
    await setDoc(tokensRef, {
      token,
      created_at: serverTimestamp(),
    });
  }

  // Account deletion
  async deleteAccount(): Promise<void> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Not authenticated');
    }

    // Delete user document
    await deleteDoc(doc(db, 'users', currentUser.uid));
    
    // Delete auth account
    await currentUser.delete();
  }

  // Stats
  async getUserStats(): Promise<{ matches: number; profileViews: number; likes: number }> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Not authenticated');
    }

    // Get matches count
    const matchesRef = collection(db, 'matches');
    const matchesQuery1 = query(matchesRef, where('user1_id', '==', currentUser.uid));
    const matchesQuery2 = query(matchesRef, where('user2_id', '==', currentUser.uid));
    const [matches1, matches2] = await Promise.all([
      getDocs(matchesQuery1),
      getDocs(matchesQuery2),
    ]);

    return {
      matches: matches1.size + matches2.size,
      profileViews: 0, // Not implemented yet
      likes: 0, // Not implemented yet
    };
  }

  // Moderation
  async reportUser(reported_id: string, reason: string, details?: string): Promise<{ success: boolean; message: string }> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Not authenticated');
    }

    const reportsRef = collection(db, 'reports');
    await addDoc(reportsRef, {
      reporter_id: currentUser.uid,
      reported_id: reported_id,
      reason,
      details: details || null,
      created_at: serverTimestamp(),
    });

    return { success: true, message: 'Report submitted successfully' };
  }

  async blockUser(blocked_id: string): Promise<{ success: boolean; message: string }> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Not authenticated');
    }

    const blocksRef = collection(db, 'blocks');
    await addDoc(blocksRef, {
      blocker_id: currentUser.uid,
      blocked_id: blocked_id,
      created_at: serverTimestamp(),
    });

    return { success: true, message: 'User blocked successfully' };
  }

  async unblockUser(blocked_id: string): Promise<{ success: boolean; message: string }> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Not authenticated');
    }

    const blocksRef = collection(db, 'blocks');
    const q = query(
      blocksRef,
      where('blocker_id', '==', currentUser.uid),
      where('blocked_id', '==', blocked_id)
    );

    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    snapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    return { success: true, message: 'User unblocked successfully' };
  }

  async getBlockedUsers(): Promise<any[]> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Not authenticated');
    }

    const blocksRef = collection(db, 'blocks');
    const q = query(blocksRef, where('blocker_id', '==', currentUser.uid));
    const snapshot = await getDocs(q);
    
    const blockedUids: string[] = [];
    snapshot.forEach((doc) => {
      blockedUids.push(doc.data().blocked_id);
    });

    return blockedUids.map((uid) => ({ id: uid }));
  }

  // Auth state observer
  onAuthStateChanged(callback: (user: FirebaseUser | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  }

  // Get current auth token
  async getToken(): Promise<string | null> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return null;
    }
    return currentUser.getIdToken();
  }

  // Compatibility Profile methods
  async getCompatibilityProfile(): Promise<any> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Not authenticated');
    }

    const profileDoc = await getDoc(doc(db, 'compatibility', currentUser.uid));
    if (!profileDoc.exists()) {
      return null;
    }

    return profileDoc.data();
  }

  async saveCompatibilityAnswer(questionId: string, answer: string): Promise<void> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Not authenticated');
    }

    const profileRef = doc(db, 'compatibility', currentUser.uid);
    const profileDoc = await getDoc(profileRef);
    
    const existingData = profileDoc.exists() ? profileDoc.data() : { answers: [] };
    const answers = existingData.answers || [];
    
    // Update or add answer
    const answerIndex = answers.findIndex((a: any) => a.questionId === questionId);
    if (answerIndex >= 0) {
      answers[answerIndex] = {
        questionId,
        answer,
        answeredAt: new Date().toISOString(),
      };
    } else {
      answers.push({
        questionId,
        answer,
        answeredAt: new Date().toISOString(),
      });
    }

    await setDoc(profileRef, {
      userId: currentUser.uid,
      answers,
      lastUpdated: serverTimestamp(),
    }, { merge: true });
  }
}

export const firebaseApi = new FirebaseApiClient();

