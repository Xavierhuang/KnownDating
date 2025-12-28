# Firebase Setup for iOS App - Quick Guide

## ⚠️ Important: Firebase works the SAME for iOS and Web

Since this is a Capacitor app (web app wrapped in native), Firebase uses the **same JavaScript SDK** for both web and iOS. There's no difference in configuration.

## 🔧 Required Firebase Console Setup

You **MUST** enable Firebase services in the Firebase Console before the app will work:

### Step 1: Enable Firebase Authentication

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **known-dating-e5f04**
3. Click **Authentication** in the left menu
4. Click **Get Started** (if you see this button)
5. Go to the **Sign-in method** tab
6. Click on **Email/Password**
7. **Toggle "Enable" to ON**
8. Click **Save**

### Step 2: Create Firestore Database

1. In Firebase Console, click **Firestore Database**
2. If you see **"Create database"**, click it:
   - Choose **Start in test mode** (for development)
   - Select a location (e.g., `us-central1`)
   - Click **Enable**

### Step 3: Verify Your Project

Your Firebase project should be:
- **Project ID**: `known-dating-e5f04`
- **Project Name**: Should be visible in Firebase Console

## 🧪 Testing Firebase Connection

The login page now shows a Firebase connection status:
- ✅ **Green message**: Firebase is connected and working
- ⚠️ **Yellow message**: There's a Firebase configuration issue

## 📱 iOS vs Web - No Difference!

For Capacitor apps:
- ✅ Uses the same Firebase config
- ✅ Uses the same JavaScript SDK
- ✅ No iOS-specific setup needed
- ✅ Works the same on iOS simulator, iOS device, and web browser

## ❌ Common Issues

### "Login request timed out"
**Cause**: Firebase Authentication is not enabled
**Fix**: Enable Email/Password in Firebase Console → Authentication → Sign-in method

### "Firestore permission denied"
**Cause**: Firestore database doesn't exist or security rules block access
**Fix**: Create Firestore database in Firebase Console

### "Network error"
**Cause**: No internet connection or Firebase project is suspended
**Fix**: Check internet connection and verify project is active in Firebase Console

## 🔍 Debugging

1. **Check the login page** - It now shows Firebase connection status
2. **Open browser console** (F12) - Look for Firebase errors
3. **Check Firebase Console** - Verify services are enabled
4. **Test in browser first** - If it works in browser, it will work in iOS

## ✅ Quick Checklist

Before testing login:
- [ ] Firebase Authentication → Email/Password is **ENABLED**
- [ ] Firestore Database is **CREATED**
- [ ] Internet connection is active
- [ ] Firebase project is active (not suspended)

Once these are done, login should work on both web and iOS!

