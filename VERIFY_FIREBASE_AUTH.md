# Verify Firebase Authentication is Enabled

## Critical Check: Email/Password Authentication

The login timeout means Firebase Authentication might not be enabled. Here's how to verify:

### Step 1: Check Authentication Status

1. Go to: https://console.firebase.google.com/project/known-dating-e5f04/authentication/providers
2. Look for **"Email/Password"** in the list
3. Check if it shows:
   - ✅ **"Enabled"** (green toggle) → Good!
   - ❌ **"Disabled"** or not listed → This is the problem!

### Step 2: Enable Email/Password (if disabled)

1. Click on **"Email/Password"**
2. Toggle **"Enable"** to **ON**
3. Click **"Save"**
4. Wait a few seconds for it to activate

### Step 3: Verify It's Working

After enabling, you should see:
- Status shows "Enabled"
- You can add test users in the "Users" tab

### Step 4: Test Login Again

1. Rebuild the app in Xcode
2. Try logging in again
3. It should work now!

## Why Login Times Out

If Email/Password authentication is **not enabled**:
- Firebase Auth API calls will hang/timeout
- No error is returned, just a timeout
- This is why you see "Login request timed out"

## Quick Test

You can also test by trying to create a user in Firebase Console:
1. Go to Authentication → Users
2. Click "Add user"
3. Enter an email and password
4. If this works, authentication is enabled
5. Then try logging in with those credentials in your app

