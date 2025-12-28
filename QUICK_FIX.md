# Quick Fix: "Database may not exist or network issue"

## ✅ Solution: Create Firestore Database

The error means your Firestore database hasn't been created yet. Here's how to fix it:

### Step-by-Step Instructions:

1. **Go to Firebase Console**
   - Open: https://console.firebase.google.com/
   - Sign in with your Google account

2. **Select Your Project**
   - Click on project: **known-dating-e5f04**
   - (If you don't see it, you may need to create it first)

3. **Create Firestore Database**
   - In the left sidebar, click **"Firestore Database"**
   - If you see a **"Create database"** button, click it
   - Choose **"Start in test mode"** (for development)
   - Select a location (choose the closest to you, e.g., `us-central1` or `us-east1`)
   - Click **"Enable"**

4. **Wait for Database to Initialize**
   - This takes about 30-60 seconds
   - You'll see "Cloud Firestore" with an empty database

5. **Enable Firebase Authentication** (if not done already)
   - Click **"Authentication"** in the left sidebar
   - Click **"Get Started"** (if you see it)
   - Go to **"Sign-in method"** tab
   - Click on **"Email/Password"**
   - Toggle **"Enable"** to ON
   - Click **"Save"**

6. **Refresh Your App**
   - Reload the app (hard refresh: Cmd+Shift+R or Ctrl+Shift+R)
   - The status should now show "✅ Firebase connected and ready"

## 🔍 Verify It's Working

After creating the database, you should see:
- ✅ Green status message on login page
- ✅ No more "database may not exist" error
- ✅ Login should work

## ⚠️ If You Still See Errors

### "Network issue"
- Check your internet connection
- Try accessing https://known-dating-e5f04.firebaseapp.com in your browser
- Check if your firewall is blocking Firebase

### "Permission denied"
- Make sure you created the database in **test mode** (not production mode with strict rules)
- Or update Firestore security rules (see FIREBASE_SETUP.md)

### "Project not found"
- Verify you're using the correct Firebase project
- Check that project ID is: `known-dating-e5f04`
- Make sure the project is active (not suspended)

## 📝 Quick Checklist

Before testing login:
- [ ] Firestore Database is **CREATED** (not just planned)
- [ ] Database is in **test mode** (for development)
- [ ] Firebase Authentication → Email/Password is **ENABLED**
- [ ] Internet connection is active
- [ ] App has been **refreshed/reloaded**

Once all these are done, the error should disappear!

