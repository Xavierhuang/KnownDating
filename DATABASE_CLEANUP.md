# Firestore Database Cleanup Guide

## Current Situation

You have **two databases**:
1. **(default)** - Location: nam5, Mode: Native
2. **default** - Location: nam5, Mode: Native

## Which One to Keep?

Your app uses the **"(default)"** database by default (this is Firebase's standard).

### Steps to Check:

1. **Click on "(default)" database** in Firebase Console
2. Go to the **"Data"** tab
3. Check if it has any collections/data:
   - If it has `users`, `matches`, `messages` collections → **KEEP THIS ONE**
   - If it's empty → You can delete it (but check the other one first)

4. **Click on "default" database**
5. Go to the **"Data"** tab  
6. Check if it has any collections/data:
   - If it has data → **KEEP THIS ONE** and delete "(default)"
   - If it's empty → You can delete this one

## Recommendation

**Keep "(default)"** - This is the standard Firebase database name and your app is configured to use it.

**Delete "default"** - This appears to be a duplicate/empty database.

## How to Delete a Database

⚠️ **WARNING**: Deleting a database is **PERMANENT** and cannot be undone!

1. In Firebase Console → Firestore Database
2. Find the database you want to delete
3. Click the **three dots (⋯)** on the right
4. Select **"Delete database"**
5. Type the database name to confirm
6. Click **"Delete"**

## After Deletion

1. Rebuild your app: `npm run build && npx cap sync ios`
2. Test the connection again
3. The timeout issue should be resolved if it was caused by database confusion

## Alternative: Keep Both

If both databases are empty or you're unsure, you can keep both. Having multiple databases shouldn't cause connection issues - the app will use "(default)" automatically.

