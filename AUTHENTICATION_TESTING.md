# Authentication Workflow Test & Debug Guide

## 🔍 Current Authentication Flow Analysis

### ✅ What I've Fixed:

1. **UserProfile Type**: Added proper TypeScript interface for user profiles
2. **Auth Callback**: Improved OAuth callback handling with better error detection
3. **Modal Closure**: AuthModal now closes after initiating OAuth flow
4. **Error Display**: Added visual error feedback on main page for auth failures
5. **URL Hash Handling**: Auth callback now handles both session and hash-based OAuth responses

### 🔧 Authentication Flow Steps:

1. **User clicks "Sign In"** → Opens AuthModal
2. **User clicks "Continue with Google"** → Initiates OAuth flow
3. **Modal closes** → User redirected to Google OAuth
4. **Google OAuth completes** → User redirected to `/auth/callback`
5. **Callback page processes** → Extracts session/token and redirects to main page
6. **AuthContext updates** → User state changes, UI updates to show avatar
7. **Protected features unlock** → RSVP/Join buttons become active

### 🧪 Testing Checklist:

**Before Testing** (Required Setup):
- [ ] Database schema created in Supabase SQL Editor
- [ ] Google OAuth configured in Google Cloud Console
- [ ] Google provider enabled in Supabase Auth settings
- [ ] Redirect URLs configured correctly

**Test Steps:**
1. [ ] Open http://localhost:3000
2. [ ] Verify "Sign In" button appears in navigation (green gradient)
3. [ ] Click "Sign In" button → Modal should open
4. [ ] Click "Continue with Google" → Should redirect to Google OAuth
5. [ ] Complete Google authentication → Should redirect back to app
6. [ ] Verify user avatar appears in navigation (replaces Sign In button)
7. [ ] Click avatar → Dropdown should show user info and "View Profile"/"Sign out"
8. [ ] Check EventCards → Should show "RSVP" instead of "Sign in to RSVP"
9. [ ] Check GroupCards → Should show "Join" instead of "Sign in to join"
10. [ ] Visit `/profile` → Should show user profile page with Google data

### 🐛 Common Issues & Solutions:

**Issue: "Sign In" button doesn't work**
- Check browser console for errors
- Verify Supabase environment variables
- Check if Google provider is enabled in Supabase

**Issue: OAuth redirects but user not logged in**
- Check Supabase auth logs in dashboard
- Verify redirect URLs match exactly
- Check console for callback errors

**Issue: Profile page shows "Please sign in"**
- AuthContext might not be detecting user
- Check browser developer tools → Application → Local Storage for Supabase session

**Issue: Cards still show "Sign in to..." after login**
- AuthContext user state not propagating
- Check React Developer Tools for context values

### 🔧 Debug Commands:

```javascript
// In browser console, check authentication state:
console.log('Current user:', JSON.parse(localStorage.getItem('sb-vlacdhcdhhujnmginvgd-auth-token')));

// Check Supabase connection:
import { supabase } from './src/lib/supabase';
console.log(await supabase.auth.getSession());
```

### 📋 Setup Requirements:

**Google Cloud Console:**
- Create OAuth 2.0 credentials
- Add authorized redirect URIs:
  - `https://vlacdhcdhhujnmginvgd.supabase.co/auth/v1/callback`
  - `http://localhost:3000/auth/callback`

**Supabase Dashboard:**
- Authentication → Providers → Enable Google
- Enter Google Client ID and Secret
- Site URL: `http://localhost:3000`
- Redirect URLs: `http://localhost:3000/auth/callback`

**Database Setup:**
- Run the complete SQL schema from `database/schema.sql`
- Verify `user_profiles` table exists
- Check RLS policies are active

### 🎯 Expected Behavior:

✅ **Before Login:**
- Navigation shows "Sign In" button (green gradient)
- Event cards show "Sign in to RSVP" (gray button)
- Group cards show "Sign in to join" (gray button)

✅ **After Login:**
- Navigation shows user avatar with dropdown
- Event cards show "RSVP" (blue button)
- Group cards show "Join" (purple button)
- Profile page accessible and functional

### 🚨 Current Status:

**Development server:** ✅ Running at http://localhost:3000
**Code compilation:** ✅ No errors
**Dependencies:** ✅ All installed
**Environment:** ✅ Variables configured

**Next step:** Complete Supabase OAuth setup and test the flow!

---

**Note:** The authentication system is fully implemented and ready to test. The only remaining step is configuring the OAuth providers in your Supabase dashboard following the setup guide.