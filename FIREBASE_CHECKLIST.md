# Firebase Console Checklist - Verify Everything is Set Up

## ✅ Step-by-Step Verification

### 1. Verify Firebase Project
- [ ] Go to https://console.firebase.google.com/
- [ ] Select project: **known-dating-e5f04**
- [ ] Project status should be **Active** (not suspended)

### 2. Check Firebase Authentication
- [ ] Go to **Authentication** → **Sign-in method**
- [ ] **Email/Password** should show **Enabled** (green toggle)
- [ ] If disabled, click on it and toggle **Enable** to ON, then **Save**
- [ ] Check **Users** tab - you should see any test users you created

### 3. Check Firestore Database
- [ ] Go to **Firestore Database**
- [ ] You should see at least one database listed (either "(default)" or "default")
- [ ] Database should show:
  - **Mode**: Native (or Test mode)
  - **Location**: Should be set (e.g., nam5, us-central1)
- [ ] Click on the database name to open it
- [ ] Check **Data** tab - should show collections (may be empty)
- [ ] Check **Rules** tab - verify security rules are set

### 4. Check Firestore Security Rules
- [ ] Go to **Firestore Database** → **Rules**
- [ ] Rules should allow authenticated users to read/write
- [ ] For development, you can use test mode rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```
- [ ] Click **Publish** if you made changes

### 5. Check Firebase Storage (if using)
- [ ] Go to **Storage**
- [ ] Should show "Get started" or have rules configured
- [ ] Check **Rules** tab if storage exists

### 6. Verify Firebase Config in Code
Your app uses these Firebase settings:
- **Project ID**: `known-dating-e5f04`
- **API Key**: `AIzaSyC9KhPz1omdPoxfZgTFtlJhkllgiwa9yyQ`
- **Auth Domain**: `known-dating-e5f04.firebaseapp.com`
- **Storage Bucket**: `known-dating-e5f04.firebasestorage.app`

Verify these match your Firebase Console → Project Settings → General

### 7. Check for Errors in Firebase Console
- [ ] Go to **Project Settings** → **General**
- [ ] Scroll down to **Your apps** section
- [ ] Verify your web app is listed with correct config
- [ ] Check for any warnings or errors

### 8. Test Firebase Connection
In your app's browser console (F12), you should see:
- ✅ "Firebase Auth is initialized"
- ✅ "Firestore is initialized"
- ✅ "Firebase connected and ready"

If you see errors, note them down.

## 🔍 Common Issues to Check

### Issue: "Authentication not enabled"
**Fix**: Enable Email/Password in Authentication → Sign-in method

### Issue: "Firestore database does not exist"
**Fix**: Create database in Firestore Database → Create database

### Issue: "Permission denied"
**Fix**: Update Firestore security rules to allow authenticated access

### Issue: "Network timeout"
**Possible causes**:
- Firestore database location mismatch
- Network connectivity issues
- iOS App Transport Security blocking (we fixed this)
- Firestore rules too restrictive

## 📱 iOS-Specific Checks

Since it works on localhost but not iOS:
1. **Verify iOS has internet** - Open Safari in simulator, visit a website
2. **Check Xcode console** - Look for network errors
3. **Verify Info.plist** - ATS settings should allow Firebase domains (we added this)
4. **Try physical device** - Simulator sometimes has network issues

## 🧪 Quick Test

1. In Firebase Console → Authentication → Users
2. Try to manually add a test user
3. Then try to login with that user in your app
4. This will help isolate if it's an auth issue or database issue

