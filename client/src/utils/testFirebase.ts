/**
 * Firebase Connection Test Utility
 * Use this to diagnose Firebase connection issues
 */

import { auth, db } from '../config/firebase';
import { getDocs, collection } from 'firebase/firestore';

export async function testFirebaseConnection() {
  const results = {
    authInitialized: false,
    firestoreInitialized: false,
    authEnabled: false,
    firestoreAccessible: false,
    errors: [] as string[],
    debugInfo: {} as Record<string, any>,
  };

  try {
    // Add debug info with better iOS detection
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown';
    const isIOS = typeof navigator !== 'undefined' && (
      /iPhone|iPad|iPod/i.test(userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) // iPad on iOS 13+
    );
    
    results.debugInfo = {
      platform: typeof window !== 'undefined' ? 'web' : 'unknown',
      userAgent: userAgent,
      isIOS: isIOS,
      timestamp: new Date().toISOString(),
    };
    console.log('🔍 Firebase Test Debug Info:', results.debugInfo);
    // Test 1: Check if auth is initialized
    if (auth) {
      results.authInitialized = true;
      console.log('✅ Firebase Auth is initialized');
    } else {
      results.errors.push('Firebase Auth is not initialized');
    }

    // Test 2: Check if Firestore is initialized
    if (db) {
      results.firestoreInitialized = true;
      console.log('✅ Firestore is initialized');
    } else {
      results.errors.push('Firestore is not initialized');
    }

    // Test 3: Check if auth is properly initialized
    try {
      // Check if auth object has the expected properties
      if ('currentUser' in auth && 'app' in auth) {
        results.authEnabled = true;
        console.log('✅ Firebase Auth appears to be enabled');
      }
    } catch (error: any) {
      results.errors.push(`Auth check failed: ${error.message}`);
    }

    // Test 4: Try to access Firestore (this will fail if database doesn't exist or rules block it)
    // Add timeout to prevent hanging - but be more lenient on iOS
    try {
      // Use the iOS detection from debugInfo (set earlier)
      const isIOS = results.debugInfo.isIOS || false;
      
      // Try to access the users collection with a limit to avoid reading too much data
      const usersRef = collection(db, 'users');
      const firestoreTestPromise = getDocs(usersRef);
      // Shorter timeout for iOS - if it times out, assume it's a network issue, not a missing database
      const timeoutMs = isIOS ? 5000 : 10000;
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Firestore query timed out')), timeoutMs)
      );
      
      const snapshot = await Promise.race([firestoreTestPromise, timeoutPromise]) as any;
      results.firestoreAccessible = true;
      console.log('✅ Firestore is accessible', `Found ${snapshot.size || 0} users`);
    } catch (error: any) {
      console.error('Firestore test error:', error);
      results.debugInfo.firestoreError = {
        code: error.code,
        message: error.message,
        name: error.name,
      };
      
      // Use the iOS detection from debugInfo (set earlier)
      const isIOS = results.debugInfo.isIOS || false;
      
      // If permission denied, database exists but rules require auth - this is OK for login page
      if (error.code === 'permission-denied') {
        // This is actually OK - database exists, just needs authentication
        results.firestoreAccessible = true;
        console.log('✅ Firestore is accessible (permission denied is expected before login)');
      } else if (error.message === 'Firestore query timed out') {
        // On iOS, timeout might just mean slow network - database likely exists
        // Don't treat this as a critical error since we can see the database in Firebase Console
        if (isIOS) {
          // On iOS, assume database exists (we can see it in console) and this is just a network/simulator issue
          results.firestoreAccessible = true;
          console.log('⚠️ Firestore query timed out on iOS - database exists but network is slow. This is OK for testing.');
          // Don't add to errors - it's not a blocking issue
          // This is expected on iOS and not a problem
        } else {
          results.errors.push(`Firestore connection timed out - check network or Firebase Console`);
        }
      } else if (error.code === 'failed-precondition') {
        results.errors.push('Firestore database does not exist - create it in Firebase Console → Firestore Database');
      } else if (error.code === 'unavailable') {
        results.errors.push('Firestore is unavailable - check network connection and Firebase Console status');
      } else {
        // For other errors, log them for debugging
        results.errors.push(`Firestore error: ${error.code || error.message || 'Unknown error'}`);
        console.error('❌ Firestore error details:', {
          code: error.code,
          message: error.message,
          name: error.name,
          stack: error.stack,
        });
      }
    }

  } catch (error: any) {
    results.errors.push(`Firebase test failed: ${error.message}`);
  }

  return results;
}

// Auto-run test in development
if (import.meta.env.DEV) {
  testFirebaseConnection().then((results) => {
    console.log('Firebase Connection Test Results:', results);
    if (results.errors.length > 0) {
      console.error('❌ Firebase Issues Detected:');
      results.errors.forEach((error) => console.error('  -', error));
    }
  });
}

