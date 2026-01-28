# Firebase Integration Setup Guide

## ✅ What's Been Integrated

The app has been successfully migrated from Express/Node.js backend to Firebase:

1. **Firebase Authentication** - Replaces JWT-based auth
2. **Cloud Firestore** - Replaces SQLite database
3. **Firebase Storage** - Replaces local file uploads
4. **Real-time Listeners** - Replaces Socket.io for messaging

## 🔧 Firebase Console Setup Required

### 1. Enable Authentication

1. Go to Firebase Console → Authentication
2. Click "Get Started"
3. Enable "Email/Password" sign-in method

### 2. Create Firestore Database

1. Go to Firebase Console → Firestore Database
2. Click "Create database"
3. Start in **test mode** (for development) or **production mode** (with security rules)
4. Choose a location (e.g., `us-central1`)

### 3. Set Up Firestore Security Rules

Go to Firestore → Rules and add:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Swipes collection
    match /swipes/{swipeId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.resource.data.swiper_id == request.auth.uid;
    }
    
    // Matches collection
    match /matches/{matchId} {
      allow read: if request.auth != null && 
        (resource.data.user1_id == request.auth.uid || resource.data.user2_id == request.auth.uid);
      allow create: if request.auth != null;
    }
    
    // Messages collection
    match /messages/{messageId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.resource.data.sender_id == request.auth.uid;
    }
    
    // Reports collection
    match /reports/{reportId} {
      allow create: if request.auth != null && request.resource.data.reporter_id == request.auth.uid;
    }
    
    // Blocks collection
    match /blocks/{blockId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.resource.data.blocker_id == request.auth.uid;
      allow delete: if request.auth != null;
    }
  }
}
```

### 4. Set Up Firebase Storage

1. Go to Firebase Console → Storage
2. Click "Get Started"
3. Start in **test mode** (for development)
4. Choose a location

### 5. Storage Security Rules

Go to Storage → Rules and add:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 6. Create Firestore Indexes

Firestore will prompt you to create indexes when needed. Common indexes:

- `messages` collection: `match_id` (ascending), `created_at` (ascending)
- `swipes` collection: `swiper_id` (ascending), `swiped_id` (ascending), `direction` (ascending)
- `matches` collection: `user1_id` (ascending) and `user2_id` (ascending)

## 📝 Important Notes

### ID System Migration

The app currently uses numeric IDs in the UI, but Firebase uses string UIDs. The integration includes compatibility layers, but for production you should:

1. **Option A**: Store a numeric `id` field in each user document for backward compatibility
2. **Option B**: Migrate the entire app to use Firebase UIDs (string) instead of numeric IDs

### Data Migration

To migrate existing data from SQLite to Firestore:

1. Export data from SQLite
2. Transform to Firestore format
3. Import using Firebase Admin SDK or manually

### Real-time Features

- **Messaging**: Now uses Firestore real-time listeners (no Socket.io needed)
- **Matches**: Updates in real-time via Firestore
- **Presence**: Can be added using Firestore presence features

## 🚀 Testing

1. Start the app: `npm run dev` in the client folder
2. Register a new user
3. Check Firebase Console to see data being created
4. Test messaging - messages should appear in real-time

## 🔒 Production Considerations

1. **Security Rules**: Update Firestore and Storage rules for production
2. **Indexes**: Create all necessary composite indexes
3. **Quotas**: Monitor Firebase usage and set up billing alerts
4. **Backup**: Set up Firestore backups
5. **Monitoring**: Use Firebase Performance Monitoring and Crashlytics

## 📚 Firebase Services Used

- ✅ Authentication (Email/Password)
- ✅ Cloud Firestore (Database)
- ✅ Firebase Storage (File uploads)
- ⚠️ Cloud Messaging (Push notifications - can be added later)
- ⚠️ Cloud Functions (Can replace some client-side logic)

## 🐛 Known Issues / TODOs

1. **ID Mapping**: Need better mapping between numeric IDs and Firebase UIDs
2. **Distance Calculation**: Location-based matching needs implementation
3. **Content Filtering**: Client-side filtering should move to Cloud Functions
4. **Push Notifications**: Need to integrate Firebase Cloud Messaging
5. **Analytics**: Can add Firebase Analytics for user behavior

