# Firebase Troubleshooting Guide

## Login Timeout Issues

If you're experiencing "Login request timed out" errors, follow these steps:

### 1. Verify Firebase Authentication is Enabled

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `known-dating-e5f04`
3. Navigate to **Authentication** → **Sign-in method**
4. Ensure **Email/Password** is enabled
5. If not enabled:
   - Click on "Email/Password"
   - Toggle "Enable" to ON
   - Click "Save"

### 2. Verify Firestore Database is Created

1. Go to Firebase Console → **Firestore Database**
2. If you see "Create database" button, click it:
   - Choose **Start in test mode** (for development)
   - Select a location (e.g., `us-central1`)
   - Click "Enable"

### 3. Check Network Connectivity

- Ensure you have an active internet connection
- Try accessing https://known-dating-e5f04.firebaseapp.com in your browser
- Check if your firewall or network is blocking Firebase domains

### 4. Verify Firebase Configuration

Check that your Firebase config in `client/src/config/firebase.ts` matches your Firebase project:

- Project ID: `known-dating-e5f04`
- API Key: Should match your Firebase project's Web API key
- Auth Domain: `known-dating-e5f04.firebaseapp.com`

### 5. Check Browser Console

Open browser DevTools (F12) and check the Console tab for:
- Firebase initialization errors
- Network errors
- CORS errors
- Authentication errors

### 6. Test Firebase Connection

You can test if Firebase is working by running this in the browser console:

```javascript
import { auth } from './config/firebase';
console.log('Auth initialized:', auth);
```

### 7. Common Error Codes

- **auth/network-request-failed**: Network connectivity issue
- **auth/too-many-requests**: Too many failed attempts, wait before retrying
- **auth/invalid-email**: Email format is incorrect
- **auth/user-not-found**: User doesn't exist, need to register first
- **auth/wrong-password**: Incorrect password

### 8. Reset Firebase Auth State

If stuck, try clearing Firebase auth state:

```javascript
// In browser console
localStorage.clear();
sessionStorage.clear();
location.reload();
```

## Still Having Issues?

1. Verify your Firebase project is active and not suspended
2. Check Firebase Console for any service outages
3. Ensure you're using the correct Firebase project credentials
4. Try creating a new test user in Firebase Console → Authentication → Users

