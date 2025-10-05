# 🔧 Supabase Google OAuth Setup Guide

## ⚠️ Error: "Unsupported provider: provider is not enabled"

This error means Google OAuth is not configured in your Supabase project. Follow these steps to fix it:

## 📋 Step-by-Step Setup

### 🎯 **Quick Overview**
1. **OAuth Consent Screen** → Configure app information
2. **Credentials** → Create OAuth client ID  
3. **Supabase** → Enter credentials and enable Google provider

### 1. **Configure Google Cloud Console**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. **Configure OAuth Consent Screen** (Required first!):
   - Go to "APIs & Services" → "OAuth consent screen"
   - Choose **External** (unless you have a Google Workspace)
   - Fill out the required fields:
     - **App name**: `Meetup App` (or your preferred name)
     - **User support email**: Your email address
     - **Developer contact information**: Your email address
   - Click **Save and Continue**
   - On "Scopes" page: Click **Save and Continue** (no changes needed)
   - On "Test users" page: 
     - Click **"+ ADD USERS"**
     - Enter your Gmail address (the one you want to test with)
     - Click **"ADD"**
     - Click **Save and Continue**
   - On "Summary" page: Review and click **"BACK TO DASHBOARD"**
4. Enable Google+ API (Optional but recommended):
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API" and enable it
5. Create OAuth credentials:
   - Go to "APIs & Services" → "Credentials"
   - Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
   - Choose **"Web application"**
   - Give it a name: `Meetup App Web Client`
   - Under **"Authorized redirect URIs"**, click **"+ ADD URI"** and add:
     ```
     https://vlacdhcdhhujnmginvgd.supabase.co/auth/v1/callback
     ```
   - Click **"CREATE"**
   - **Important**: Copy and save your **Client ID** and **Client Secret**

> **📝 Note**: Your app will be in "Testing" mode initially. Only test users you added can sign in. For production, you'll need to publish the app or submit it for verification.

### 2. **Configure Supabase Dashboard**

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `vlacdhcdhhujnmginvgd`
3. In the left sidebar, navigate to **Authentication** → **Settings**
4. Look for the **"Auth Providers"** or **"Third-party providers"** section
5. Find **Google** in the list of providers
6. Click the **toggle switch** or **"Configure"** button next to Google
7. Fill in your Google OAuth credentials:
   - **Client ID**: (from Google Cloud Console)
   - **Client Secret**: (from Google Cloud Console)
   - **Redirect URL**: Should be auto-filled as `https://vlacdhcdhhujnmginvgd.supabase.co/auth/v1/callback`
8. Click **Save** or **Update**

> **🔍 Alternative paths if above doesn't work**:
> - Try: **Authentication** → **Configuration** → **Auth Providers**
> - Or: **Authentication** → **Providers** (if it exists)
> - Or: Look for **"Social Auth"** or **"OAuth"** section under Authentication

### 3. **Verify Configuration**

1. In Supabase Dashboard → **Authentication** → **Settings**
2. Scroll down to **Auth Providers** section
3. Confirm Google shows as **"Enabled"** or has a green toggle/status
4. Test the authentication flow in your app at: http://localhost:3001/signin

> **💡 Tip**: If you can't find the exact menu, look for these terms in the Authentication section:
> - "Auth Providers"
> - "Social Auth" 
> - "Third-party providers"
> - "OAuth providers"

## 🔍 Common Issues & Solutions

### 🎯 **Can't Find Google Provider in Supabase?**

Supabase interface changes frequently. Try these locations:

**Method 1**: Authentication → Settings → Auth Providers
**Method 2**: Authentication → Configuration → OAuth/Social providers  
**Method 3**: Settings → Authentication → Third-party providers
**Method 4**: Project Settings → Authentication → Social Auth

**What to look for**:
- A list of social providers (Google, GitHub, Facebook, etc.)
- Toggle switches or "Configure" buttons
- A section titled "Auth Providers", "OAuth", or "Social Login"

**Still can't find it?**
1. Use the search bar in Supabase dashboard: Search "google" or "oauth"
2. Check the left sidebar for any Authentication-related sections
3. Look for a gear icon (⚙️) or settings symbol near Authentication

### 🎯 **Detailed: Adding Test Users (Step-by-Step)**

If you're having trouble finding the "Test users" section:

1. **In Google Cloud Console** → "APIs & Services" → "OAuth consent screen"
2. **You'll see 4 tabs**: App information, Scopes, Test users, Summary
3. **Click on "Test users" tab**
4. **You'll see**: "Add the email addresses of users who can test your app"
5. **Click the blue "+ ADD USERS" button**
6. **In the popup**: Enter your Gmail address (e.g., `yourname@gmail.com`)
7. **Click "ADD"** 
8. **Your email should now appear** in the test users list
9. **Click "SAVE AND CONTINUE"**

> **⚠️ Critical**: Only emails added to this list can sign in during testing phase!

### Issue: "This app isn't verified" warning
- **Solution**: This is normal for unpublished apps. Click "Advanced" → "Go to Meetup App (unsafe)" during testing
- **For Production**: Submit your app for verification in Google Cloud Console → OAuth consent screen

### Issue: "Access blocked: This app's request is invalid"
- **Solution**: Make sure you configured the OAuth consent screen first and added yourself as a test user

### Issue: "Invalid redirect URI"
- **Solution**: Make sure you added the exact Supabase callback URL to Google Cloud Console

### Issue: "Error 400: redirect_uri_mismatch"
- **Solution**: Check that the redirect URI in Google Cloud Console matches exactly:
  ```
  https://vlacdhcdhhujnmginvgd.supabase.co/auth/v1/callback
  ```

### Issue: "Access denied: [your-email] has not completed the OAuth flow"
- **Solution**: Add your email to the "Test users" list in OAuth consent screen

## 🚀 After Setup

Once configured, your authentication flow will work:
1. User clicks "Sign In" → Redirects to `/signin`
2. User clicks "Continue with Google" → Google OAuth flow
3. User authorizes → Redirects back to your app
4. User is now authenticated and can access protected features

## 📞 Need Help?

If you encounter issues:
1. Check Supabase logs: Dashboard → Logs → Auth logs
2. Verify Google Cloud Console settings
3. Ensure all URLs match exactly (no trailing slashes)

---

**Your Supabase Project URL**: `https://vlacdhcdhhujnmginvgd.supabase.co`
**Required Redirect URI**: `https://vlacdhcdhhujnmginvgd.supabase.co/auth/v1/callback`